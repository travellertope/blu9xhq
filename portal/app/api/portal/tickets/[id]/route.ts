import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {
  resolveClientPost, getTicket,
  listTicketReplies,
  listTicketAttachments,
} from "@/lib/wp-api";

// GET /api/portal/tickets/[id] — get single ticket with thread (no internal notes)
export async function GET(
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

  try {
    const [clientPost, ticket] = await Promise.all([
      resolveClientPost(sessionClientId, wpUserId),
      getTicket(ticketId),
    ]);

    if (!clientPost) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const acf = ticket.acf as typeof ticket.acf | false;
    if (!acf || acf.tkt_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [repliesResult, attachmentsResult] = await Promise.all([
      listTicketReplies(ticketId).catch(() => ({ items: [], total: 0, totalPages: 1 })),
      listTicketAttachments(ticketId).catch(() => ({ items: [], total: 0, totalPages: 1 })),
    ]);

    // Filter out internal_note replies for client view
    const replies = repliesResult.items
      .filter((r) => r.acf && r.acf.reply_type === "reply")
      .map((r) => ({
        id: r.id,
        authorId: r.acf.reply_author_id,
        body: r.acf.reply_body,
        createdAt: r.date,
      }));

    const attachments = attachmentsResult.items.map((a) => ({
      id: a.id,
      fileName: a.acf.att_file_name,
      fileType: a.acf.att_file_type,
      fileSizeKb: a.acf.att_file_size_kb,
      replyId: a.acf.att_reply_id,
      createdAt: a.date,
    }));

    return NextResponse.json({
      id: ticket.id,
      ticketNumber: acf.tkt_number,
      subject: ticket.title.rendered.replace(/<[^>]+>/g, ""),
      category: acf.tkt_category,
      priority: acf.tkt_priority,
      status: acf.tkt_status,
      firstResponseAt: acf.tkt_first_response_at ?? null,
      resolvedAt: acf.tkt_resolved_at ?? null,
      createdAt: ticket.date,
      replies,
      attachments,
      // SLA fields intentionally omitted from client responses
    });
  } catch (err) {
    console.error("[GET /api/portal/tickets/[id]]", err);
    return NextResponse.json({ error: "Failed to load ticket" }, { status: 500 });
  }
}
