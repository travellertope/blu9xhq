import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendTicketReply } from "@/lib/resend";
import { logTicketToTimeline } from "@/lib/ticket-utils";

// POST /api/portal/tickets/[id]/replies — client adds a reply
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const clientId = session.user.clientId;
  const tenantId = session.user.tenantId!;
  const userId = session.user.id;
  if (!clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const replyBody = body.body?.trim();
  if (!replyBody || replyBody.length < 2) {
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data: ticket, error: fetchErr } = await supabase
      .from("tickets")
      .select("*, clients(contact_name)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Cannot reply to a closed ticket" }, { status: 400 });
    }

    const { data: reply, error: replyErr } = await supabase
      .from("ticket_replies")
      .insert({
        ticket_id:  params.id,
        tenant_id:  tenantId,
        author_id:  userId,
        body:       replyBody,
        reply_type: "reply",
      })
      .select("*")
      .single();
    if (replyErr) throw replyErr;

    // Status transition: if awaiting_client → in_progress
    if (ticket.status === "awaiting_client") {
      await supabase.from("tickets").update({ status: "in_progress" }).eq("id", params.id)
        .then(({ error }) => { if (error) console.error(error); });
    }

    const adminEmail = process.env.RESEND_REPLY_TO ?? process.env.RESEND_FROM_EMAIL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    if (adminEmail) {
      void sendTicketReply(adminEmail, {
        recipientName:  "BluuHQ Team",
        ticketNumber:   ticket.tkt_number,
        subject:        ticket.tkt_number,
        authorName:     ticket.clients?.contact_name ?? "Client",
        replyPreview:   replyBody.slice(0, 300),
        ticketUrl:      `${appUrl}/admin/tickets/${params.id}`,
      }).catch(console.error);
    }

    void logTicketToTimeline({
      tenantId,
      clientId,
      loggedBy: userId,
      ticketNumber: ticket.tkt_number,
      subject: ticket.tkt_number,
      content: `[Client reply on ticket ${ticket.tkt_number}]\n\n${replyBody}`,
      direction: "inbound",
    });

    return NextResponse.json({ id: reply.id, ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/portal/tickets/[id]/replies]", err);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}
