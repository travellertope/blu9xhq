import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import {
  getTicket,
  getClientPost,
  updateTicket,
  createTicketReply,
} from "@/lib/wp-api";
import { sendTicketReply } from "@/lib/resend";
import { logTicketToTimeline } from "@/lib/ticket-utils";

// POST /api/admin/tickets/[id]/replies — admin reply or internal note
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; name?: string | null };
  const actorWpUserId = user.wpUserId;
  if (!actorWpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const ticketId = parseInt(params.id, 10);
  if (isNaN(ticketId)) return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });

  let body: { body?: string; replyType?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const replyBody = body.body?.trim();
  const replyType = body.replyType === "internal_note" ? "internal_note" : "reply";

  if (!replyBody || replyBody.length < 2) {
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
  }

  try {
    const ticket = await getTicket(ticketId);
    if (ticket.acf.tkt_status === "closed") {
      return NextResponse.json({ error: "Cannot reply to a closed ticket" }, { status: 400 });
    }

    const reply = await createTicketReply({
      acf: {
        reply_ticket_id: ticketId,
        reply_author_id: actorWpUserId,
        reply_body:      replyBody,
        reply_type:      replyType,
      },
    });

    // Update ticket state on first team reply
    const acfUpdates: Record<string, string> = {};
    if (replyType === "reply") {
      if (!ticket.acf.tkt_first_response_at) {
        acfUpdates.tkt_first_response_at = new Date().toISOString();
      }
      if (ticket.acf.tkt_status === "open" || ticket.acf.tkt_status === "in_progress") {
        acfUpdates.tkt_status = "awaiting_client";
      }
    }
    if (Object.keys(acfUpdates).length > 0) {
      await updateTicket(ticketId, { acf: acfUpdates }).catch(console.error);
    }

    // Notify client only for visible replies (not internal notes)
    if (replyType === "reply") {
      const clientPost = await getClientPost(ticket.acf.tkt_client).catch(() => null);
      if (clientPost?.acf.portal_email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        const authorName = user.name ?? "BluuHQ Team";
        void sendTicketReply(clientPost.acf.portal_email, {
          recipientName: clientPost.acf.contact_name,
          ticketNumber:  ticket.acf.tkt_number,
          subject:       ticket.title.rendered.replace(/<[^>]+>/g, ""),
          authorName,
          replyPreview:  replyBody.slice(0, 300),
          ticketUrl:     `${appUrl}/portal/tickets/${ticketId}`,
        }).catch(console.error);

        void logTicketToTimeline({
          clientPostId: clientPost.id,
          wpUserId:     actorWpUserId,
          ticketNumber: ticket.acf.tkt_number,
          subject:      ticket.title.rendered.replace(/<[^>]+>/g, ""),
          content:      `[Team reply on ticket ${ticket.acf.tkt_number}]\n\n${replyBody}`,
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
