import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendTicketReply } from "@/lib/resend";
import { logTicketToTimeline } from "@/lib/ticketServer";

// POST /api/admin/tickets/[id]/replies — admin reply or internal note
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const actorId = session.user.id;
  const tenantId = session.user.tenantId!;

  let body: { body?: string; replyType?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const replyBody = body.body?.trim();
  const replyType = body.replyType === "internal_note" ? "internal_note" : "reply";

  if (!replyBody || replyBody.length < 2) {
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: ticket, error: fetchErr } = await supabase
      .from("tickets")
      .select("*, clients(contact_name,portal_email)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    if (ticket.status === "closed") {
      return NextResponse.json({ error: "Cannot reply to a closed ticket" }, { status: 400 });
    }

    const { data: reply, error: replyErr } = await supabase
      .from("ticket_replies")
      .insert({
        ticket_id:  params.id,
        tenant_id:  tenantId,
        author_id:  actorId,
        body:       replyBody,
        reply_type: replyType,
      })
      .select("*")
      .single();
    if (replyErr) throw replyErr;

    // Update ticket state on first team reply
    const updates: Record<string, unknown> = {};
    if (replyType === "reply") {
      if (!ticket.first_response_at) {
        updates.first_response_at = new Date().toISOString();
      }
      if (ticket.status === "open" || ticket.status === "in_progress") {
        updates.status = "awaiting_client";
      }
    }
    if (Object.keys(updates).length > 0) {
      await supabase.from("tickets").update(updates).eq("id", params.id).then(({ error }) => {
        if (error) console.error("[ticket update on reply]", error);
      });
    }

    // Notify client only for visible replies (not internal notes)
    if (replyType === "reply") {
      if (ticket.clients?.portal_email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        const authorName = session.user.name ?? "BluuHQ Team";
        void sendTicketReply(ticket.clients.portal_email, {
          recipientName: ticket.clients.contact_name,
          ticketNumber:  ticket.tkt_number,
          subject:       ticket.tkt_number,
          authorName,
          replyPreview:  replyBody.slice(0, 300),
          ticketUrl:     `${appUrl}/portal/tickets/${params.id}`,
        }).catch(console.error);

        void logTicketToTimeline({
          tenantId,
          clientId:     ticket.client_id,
          loggedBy:     actorId,
          ticketNumber: ticket.tkt_number,
          subject:      ticket.tkt_number,
          content:      `[Team reply on ticket ${ticket.tkt_number}]\n\n${replyBody}`,
          direction:    "outbound",
        });
      }
    }

    return NextResponse.json({ id: reply.id, ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/tickets/[id]/replies]", err);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}
