import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import {
  getTicket,
  updateTicket,
  getClientPost,
  listTicketReplies,
  listTicketAttachments,
  createTicketStatusLog,
  deleteWPTicket,
  type TicketReplyItem,
  type TicketAttachmentItem,
} from "@/lib/wp-api";
import { deleteFromR2 } from "@/lib/r2";
import { sendTicketStatusChanged } from "@/lib/resend";
import { isValidStatus, isValidPriority, logTicketToTimeline } from "@/lib/ticket-utils";

// GET /api/admin/tickets/[id] — full ticket with thread including internal notes
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const ticketId = parseInt(params.id, 10);
  if (isNaN(ticketId)) return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });

  try {
    const ticket = await getTicket(ticketId);
    const acf = ticket.acf as typeof ticket.acf | false;
    if (!acf) return NextResponse.json({ error: "Failed to load ticket" }, { status: 500 });

    const [repliesRaw, attachmentsRaw, clientPost] = await Promise.all([
      listTicketReplies(ticketId).catch((): TicketReplyItem[] => []),
      listTicketAttachments(ticketId).catch((): TicketAttachmentItem[] => []),
      getClientPost(acf.tkt_client).catch(() => null),
    ]);

    return NextResponse.json({
      id: ticket.id,
      ticketNumber:         acf.tkt_number,
      subject:              ticket.title.rendered.replace(/<[^>]+>/g, ""),
      clientId:             acf.tkt_client,
      clientName:           clientPost ? (clientPost.acf.company_name || clientPost.acf.contact_name) : null,
      clientEmail:          clientPost?.acf.portal_email ?? null,
      submittedBy:          acf.tkt_submitted_by,
      assignedTo:           acf.tkt_assigned_to ?? null,
      category:             acf.tkt_category,
      priority:             acf.tkt_priority,
      status:               acf.tkt_status,
      retainerId:           acf.tkt_retainer_id ?? null,
      slaResponseTarget:    acf.tkt_sla_response_target,
      slaResolveTarget:     acf.tkt_sla_resolve_target,
      firstResponseAt:      acf.tkt_first_response_at ?? null,
      resolvedAt:           acf.tkt_resolved_at ?? null,
      closedAt:             acf.tkt_closed_at ?? null,
      createdAt:            ticket.date,
      replies: repliesRaw
        .filter((r) => r.reply_body)
        .map((r) => ({
          id:        r.id,
          authorId:  r.reply_author_id,
          body:      r.reply_body,
          replyType: r.reply_type,
          createdAt: r.date,
        })),
      attachments: attachmentsRaw.map((a) => ({
        id:          a.id,
        fileName:    a.att_file_name,
        fileUrl:     a.att_file_url,
        fileType:    a.att_file_type,
        fileSizeKb:  a.att_file_size_kb,
        uploadedBy:  a.att_uploaded_by,
        replyId:     a.att_reply_id,
        createdAt:   a.date,
      })),
    });
  } catch (err) {
    console.error("[GET /api/admin/tickets/[id]]", err);
    return NextResponse.json({ error: "Failed to load ticket" }, { status: 500 });
  }
}

// PATCH /api/admin/tickets/[id] — update status, priority, assignee
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const actorWpUserId = user.wpUserId;

  const ticketId = parseInt(params.id, 10);
  if (isNaN(ticketId)) return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });

  let body: { status?: string; priority?: string; assignedTo?: number; note?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (body.status && !isValidStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (body.priority && !isValidPriority(body.priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  try {
    const ticket = await getTicket(ticketId);
    const acf = ticket.acf as typeof ticket.acf | false;
    if (!acf) return NextResponse.json({ error: "Failed to load ticket" }, { status: 500 });

    const clientPost = await getClientPost(acf.tkt_client).catch(() => null);

    const acfUpdates: Record<string, string | number> = {};
    const prevStatus = acf.tkt_status;

    if (body.status && body.status !== prevStatus) {
      acfUpdates.tkt_status = body.status;
      if (body.status === "resolved") acfUpdates.tkt_resolved_at = new Date().toISOString();
      if (body.status === "closed")   acfUpdates.tkt_closed_at   = new Date().toISOString();
    }
    if (body.priority) acfUpdates.tkt_priority  = body.priority;
    if (body.assignedTo !== undefined) acfUpdates.tkt_assigned_to = body.assignedTo;

    if (Object.keys(acfUpdates).length === 0) {
      return NextResponse.json({ ok: true, message: "No changes" });
    }

    await updateTicket(ticketId, { acf: acfUpdates });

    // Log status change to audit trail
    if (body.status && body.status !== prevStatus && actorWpUserId) {
      await createTicketStatusLog({
        acf: {
          log_ticket_id:   ticketId,
          log_changed_by:  actorWpUserId,
          log_from_status: prevStatus,
          log_to_status:   body.status,
          log_note:        body.note ?? "",
          log_changed_at:  new Date().toISOString(),
        },
      }).catch(console.error);

      // Notify client of status change
      if (clientPost?.acf.portal_email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        void sendTicketStatusChanged(clientPost.acf.portal_email, {
          clientName:  clientPost.acf.contact_name,
          ticketNumber: acf.tkt_number,
          subject:     ticket.title.rendered.replace(/<[^>]+>/g, ""),
          fromStatus:  prevStatus,
          toStatus:    body.status,
          note:        body.note,
          ticketUrl:   `${appUrl}/portal/tickets/${ticketId}`,
        }).catch(console.error);

        // Log status change to client timeline
        void logTicketToTimeline({
          clientPostId: clientPost.id,
          wpUserId:     actorWpUserId ?? 0,
          ticketNumber: acf.tkt_number,
          subject:      ticket.title.rendered.replace(/<[^>]+>/g, ""),
          content:      `Ticket status updated: ${prevStatus} → ${body.status}${body.note ? `\n\n${body.note}` : ""}`,
          direction:    "outbound",
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/tickets/[id]]", err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

// DELETE /api/admin/tickets/[id] — delete ticket, all replies, attachments, and R2 files
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const ticketId = parseInt(params.id, 10);
  if (isNaN(ticketId)) return NextResponse.json({ error: "Invalid ticket ID" }, { status: 400 });

  try {
    const { att_file_urls } = await deleteWPTicket(ticketId);
    // Delete R2 files concurrently, best-effort (don't fail if one is missing)
    await Promise.allSettled(att_file_urls.filter(Boolean).map((key) => deleteFromR2(key)));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/tickets/[id]]", err);
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
