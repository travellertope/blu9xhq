import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2";
import { sendTicketStatusChanged } from "@/lib/resend";
import { isValidStatus, isValidPriority } from "@/lib/ticket-utils";
import { logTicketToTimeline } from "@/lib/ticketServer";

// GET /api/admin/tickets/[id] — full ticket with thread including internal notes
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: ticket, error } = await supabase
      .from("tickets")
      .select("*, clients(company_name,contact_name,portal_email)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw error;
    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const [{ data: replies }, { data: attachments }] = await Promise.all([
      supabase.from("ticket_replies").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: true }),
      supabase.from("ticket_attachments").select("*").eq("ticket_id", ticket.id).order("created_at", { ascending: true }),
    ]);

    return NextResponse.json({
      id:                   ticket.id,
      ticketNumber:         ticket.tkt_number,
      subject:              ticket.tkt_number,
      clientId:             ticket.client_id,
      clientName:           ticket.clients?.company_name || ticket.clients?.contact_name || null,
      clientEmail:          ticket.clients?.portal_email ?? null,
      submittedBy:          ticket.submitted_by,
      assignedTo:           ticket.assigned_to ?? null,
      category:             ticket.category,
      priority:             ticket.priority,
      status:               ticket.status,
      retainerId:           ticket.retainer_id ?? null,
      slaResponseTarget:    ticket.sla_response_target,
      slaResolveTarget:     ticket.sla_resolve_target,
      firstResponseAt:      ticket.first_response_at ?? null,
      resolvedAt:           ticket.resolved_at ?? null,
      closedAt:             ticket.closed_at ?? null,
      createdAt:            ticket.created_at,
      replies: (replies ?? []).map((r: any) => ({
        id:        r.id,
        authorId:  r.author_id,
        body:      r.body,
        replyType: r.reply_type,
        createdAt: r.created_at,
      })),
      attachments: (attachments ?? []).map((a: any) => ({
        id:          a.id,
        fileName:    a.file_name,
        fileUrl:     a.r2_key,
        fileType:    a.mime_type,
        fileSizeKb:  a.size_kb,
        uploadedBy:  a.uploaded_by,
        replyId:     a.reply_id,
        createdAt:   a.created_at,
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
  const actorId = session.user.id;
  const tenantId = session.user.tenantId!;

  let body: { status?: string; priority?: string; assignedTo?: string; note?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (body.status && !isValidStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (body.priority && !isValidPriority(body.priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
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

    const updates: Record<string, unknown> = {};
    const prevStatus = ticket.status;

    if (body.status && body.status !== prevStatus) {
      updates.status = body.status;
      if (body.status === "resolved") updates.resolved_at = new Date().toISOString();
      if (body.status === "closed")   updates.closed_at   = new Date().toISOString();
    }
    if (body.priority) updates.priority = body.priority;
    if (body.assignedTo !== undefined) updates.assigned_to = body.assignedTo || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: true, message: "No changes" });
    }

    const { error: updateErr } = await supabase
      .from("tickets")
      .update(updates)
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (updateErr) throw updateErr;

    // Log status change to audit trail
    if (body.status && body.status !== prevStatus) {
      await supabase.from("ticket_status_log").insert({
        ticket_id:   params.id,
        tenant_id:   tenantId,
        changed_by:  actorId,
        from_status: prevStatus,
        to_status:   body.status,
        note:        body.note ?? null,
        changed_at:  new Date().toISOString(),
      }).then(({ error }) => { if (error) console.error("[status log]", error); });

      // Notify client of status change
      if (ticket.clients?.portal_email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        void sendTicketStatusChanged(ticket.clients.portal_email, {
          clientName:  ticket.clients.contact_name,
          ticketNumber: ticket.tkt_number,
          subject:     ticket.tkt_number,
          fromStatus:  prevStatus,
          toStatus:    body.status,
          note:        body.note,
          ticketUrl:   `${appUrl}/portal/tickets/${params.id}`,
        }).catch(console.error);

        // Log status change to client timeline
        void logTicketToTimeline({
          tenantId,
          clientId:     ticket.client_id,
          loggedBy:     actorId,
          ticketNumber: ticket.tkt_number,
          subject:      ticket.tkt_number,
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
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: attachments } = await supabase
      .from("ticket_attachments")
      .select("r2_key")
      .eq("ticket_id", params.id)
      .eq("tenant_id", tenantId);

    const { error, count } = await supabase
      .from("tickets")
      .delete({ count: "exact" })
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (error) throw error;
    if (!count) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    // Delete R2 files concurrently, best-effort (don't fail if one is missing)
    await Promise.allSettled((attachments ?? []).map((a) => deleteFromR2(a.r2_key)));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/tickets/[id]]", err);
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
