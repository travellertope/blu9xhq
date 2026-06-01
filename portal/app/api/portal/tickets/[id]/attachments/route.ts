import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {
  resolveClientPost, getTicket,
  listTicketAttachments,
  createTicketAttachment,
} from "@/lib/wp-api";
import { uploadToR2 } from "@/lib/r2";
import {
  TICKET_ALLOWED_MIME_TYPES,
  TICKET_MAX_ATTACHMENT_SIZE,
  TICKET_MAX_ATTACHMENTS,
} from "@/lib/ticket-utils";

// POST /api/portal/tickets/[id]/attachments
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; clientId?: number | string };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const ticketId = parseInt(params.id, 10);
  if (isNaN(ticketId)) return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });

  let formData: FormData;
  try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!TICKET_ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if (file.size > TICKET_MAX_ATTACHMENT_SIZE) {
    return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 400 });
  }

  try {
    const [clientPost, ticket] = await Promise.all([
      resolveClientPost(sessionClientId, wpUserId),
      getTicket(ticketId),
    ]);
    if (!clientPost) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (ticket.acf.tkt_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Enforce max 10 attachments per ticket
    const existing = await listTicketAttachments(ticketId);
    if (existing.items.length >= TICKET_MAX_ATTACHMENTS) {
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
        att_uploaded_by:  wpUserId,
        att_file_name:    file.name,
        att_file_url:     key,
        att_file_type:    file.type,
        att_file_size_kb: Math.ceil(file.size / 1024),
      },
    });

    return NextResponse.json({ id: attachment.id, fileName: file.name }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/portal/tickets/[id]/attachments]", err);
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 });
  }
}
