import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import {
  getTicket,
  listTicketAttachments,
  createTicketAttachment,
} from "@/lib/wp-api";
import { uploadToR2 } from "@/lib/r2";
import {
  TICKET_ALLOWED_MIME_TYPES,
  TICKET_MAX_ATTACHMENT_SIZE,
  TICKET_MAX_ATTACHMENTS,
} from "@/lib/ticket-utils";

// POST /api/admin/tickets/[id]/attachments
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const actorWpUserId = user.wpUserId;
  if (!actorWpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const ticketId = parseInt(params.id, 10);
  if (isNaN(ticketId)) return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });

  let formData: FormData;
  try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  const replyIdStr = formData.get("replyId") as string | null;
  const replyId = replyIdStr ? parseInt(replyIdStr, 10) : undefined;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!TICKET_ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if (file.size > TICKET_MAX_ATTACHMENT_SIZE) {
    return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 400 });
  }

  try {
    await getTicket(ticketId); // verify exists

    const existing = await listTicketAttachments(ticketId).catch(() => []);
    if (existing.length >= TICKET_MAX_ATTACHMENTS) {
      return NextResponse.json({ error: "Maximum 10 attachments per ticket" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "";
    const safeFilename = `${crypto.randomUUID()}.${ext}`;
    const key = `tickets/${ticketId}/attachments/${safeFilename}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2(key, buffer, file.type);

    const attachment = await createTicketAttachment({
      acf: {
        att_ticket_id:    ticketId,
        ...(replyId ? { att_reply_id: replyId } : {}),
        att_uploaded_by:  actorWpUserId,
        att_file_name:    file.name,
        att_file_url:     key,
        att_file_type:    file.type,
        att_file_size_kb: Math.ceil(file.size / 1024),
      },
    });

    return NextResponse.json({ id: attachment.id, fileName: file.name }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/tickets/[id]/attachments]", err);
    const msg = err instanceof Error ? err.message : "Failed to upload attachment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
