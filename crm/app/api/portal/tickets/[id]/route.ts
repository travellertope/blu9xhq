import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/portal/tickets/[id] — get single ticket with thread (no internal notes)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const clientId = session.user.clientId;
  const tenantId = session.user.tenantId!;
  if (!clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const supabase = createSupabaseServerClient();
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId)
      .maybeSingle();
    if (error) throw error;
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [{ data: repliesRaw }, { data: attachmentsRaw }] = await Promise.all([
      supabase.from("ticket_replies").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: true }),
      supabase.from("ticket_attachments").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: true }),
    ]);

    // Filter out internal_note replies for client view
    const replies = (repliesRaw ?? [])
      .filter((r: any) => r.reply_type === "reply" && r.body)
      .map((r: any) => ({ id: r.id, authorId: r.author_id, body: r.body, replyType: r.reply_type, createdAt: r.created_at }));

    const attachments = (attachmentsRaw ?? []).map((a: any) => ({
      id:         a.id,
      fileName:   a.file_name,
      fileUrl:    a.r2_key,
      fileType:   a.mime_type,
      fileSizeKb: a.size_kb,
      uploadedBy: a.uploaded_by,
      replyId:    a.reply_id,
      createdAt:  a.created_at,
    }));

    return NextResponse.json({
      id: ticket.id,
      ticketNumber: ticket.tkt_number,
      subject: ticket.tkt_number,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      firstResponseAt: ticket.first_response_at ?? null,
      resolvedAt: ticket.resolved_at ?? null,
      createdAt: ticket.created_at,
      replies,
      attachments,
      // SLA fields intentionally omitted from client responses
    });
  } catch (err) {
    console.error("[GET /api/portal/tickets/[id]]", err);
    return NextResponse.json({ error: "Failed to load ticket" }, { status: 500 });
  }
}
