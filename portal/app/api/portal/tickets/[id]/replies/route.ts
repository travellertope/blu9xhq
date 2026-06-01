import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {
  resolveClientPost, getTicket,
  updateTicket,
  createTicketReply,
} from "@/lib/wp-api";
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

  const user = session.user as { wpUserId?: number; clientId?: number | string };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const ticketId = parseInt(params.id, 10);
  if (isNaN(ticketId)) return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });

  let body: { body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const replyBody = body.body?.trim();
  if (!replyBody || replyBody.length < 2) {
    return NextResponse.json({ error: "Reply body is required" }, { status: 400 });
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
    if (ticket.acf.tkt_status === "closed") {
      return NextResponse.json({ error: "Cannot reply to a closed ticket" }, { status: 400 });
    }

    const reply = await createTicketReply({
      acf: {
        reply_ticket_id: ticketId,
        reply_author_id: wpUserId,
        reply_body:      replyBody,
        reply_type:      "reply", // clients can never post internal_note
      },
    });

    // Status transition: if awaiting_client → in_progress
    const updates: Record<string, string> = {};
    if (ticket.acf.tkt_status === "awaiting_client") {
      updates.tkt_status = "in_progress";
    }
    if (Object.keys(updates).length > 0) {
      await updateTicket(ticketId, { acf: updates }).catch(console.error);
    }

    // Notify admin via email (find admin email from env or a fallback)
    const adminEmail = process.env.RESEND_REPLY_TO ?? process.env.RESEND_FROM_EMAIL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    if (adminEmail) {
      void sendTicketReply(adminEmail, {
        recipientName:  "BluuHQ Team",
        ticketNumber:   ticket.acf.tkt_number,
        subject:        ticket.title.rendered.replace(/<[^>]+>/g, ""),
        authorName:     clientPost.acf.contact_name,
        replyPreview:   replyBody.slice(0, 300),
        ticketUrl:      `${appUrl}/admin/tickets/${ticketId}`,
      }).catch(console.error);
    }

    // Log to timeline
    void logTicketToTimeline({
      clientPostId: clientPost.id,
      wpUserId,
      ticketNumber: ticket.acf.tkt_number,
      subject: ticket.title.rendered.replace(/<[^>]+>/g, ""),
      content: `[Client reply on ticket ${ticket.acf.tkt_number}]\n\n${replyBody}`,
      direction: "inbound",
    });

    return NextResponse.json({ id: reply.id, ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/portal/tickets/[id]/replies]", err);
    return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
  }
}
