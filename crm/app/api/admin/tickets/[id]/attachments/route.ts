import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { uploadToR2, generateTicketAttachmentKey } from "@/lib/r2";
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
  const actorId = session.user.id;
  const tenantId = session.user.tenantId!;

  let formData: FormData;
  try { formData = await req.formData(); } catch { return NextResponse.json({ error: "Invalid form data" }, { status: 400 }); }

  const file = formData.get("file") as File | null;
  const replyId = (formData.get("replyId") as string | null) || undefined;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!TICKET_ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "File type not allowed" }, { status: 400 });
  }
  if (file.size > TICKET_MAX_ATTACHMENT_SIZE) {
    return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: ticket, error: fetchErr } = await supabase
      .from("tickets")
      .select("id")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const { count } = await supabase
      .from("ticket_attachments")
      .select("id", { count: "exact", head: true })
      .eq("ticket_id", params.id);
    if ((count ?? 0) >= TICKET_MAX_ATTACHMENTS) {
      return NextResponse.json({ error: "Maximum 10 attachments per ticket" }, { status: 400 });
    }

    const key = generateTicketAttachmentKey(tenantId, params.id, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2(key, buffer, file.type);

    const { data: attachment, error: insErr } = await supabase
      .from("ticket_attachments")
      .insert({
        ticket_id:   params.id,
        tenant_id:   tenantId,
        reply_id:    replyId || null,
        uploaded_by: actorId,
        file_name:   file.name,
        r2_key:      key,
        mime_type:   file.type,
        size_kb:     Math.ceil(file.size / 1024),
      })
      .select("*")
      .single();
    if (insErr) throw insErr;

    return NextResponse.json({ id: attachment.id, fileName: file.name }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/tickets/[id]/attachments]", err);
    const msg = err instanceof Error ? err.message : "Failed to upload attachment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
