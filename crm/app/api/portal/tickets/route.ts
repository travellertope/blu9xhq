import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  generateTicketNumber,
  calculateSlaTargets,
  logTicketToTimeline,
  isValidCategory,
  isValidPriority,
} from "@/lib/ticket-utils";
import { sendTicketCreated, sendNewTicketAdmin } from "@/lib/resend";

// GET /api/portal/tickets — list client's own tickets
export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const clientId = session.user.clientId;
  const tenantId = session.user.tenantId!;
  if (!clientId) return NextResponse.json({ tickets: [] });

  try {
    const supabase = createSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    let query = supabase
      .from("tickets")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    const tickets = (data ?? []).map((t: any) => ({
      id:           t.id,
      ticketNumber: t.tkt_number,
      subject:      t.tkt_number,
      category:     t.category,
      priority:     t.priority,
      status:       t.status,
      createdAt:    t.created_at,
      // Never expose SLA fields or sla_alerted_at to clients
    }));

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("[GET /api/portal/tickets]", err);
    return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}

// POST /api/portal/tickets — submit a new ticket
export async function POST(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const clientId = session.user.clientId;
  const tenantId = session.user.tenantId!;
  const userId = session.user.id;
  if (!clientId) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  let body: {
    subject?: string;
    description?: string;
    category?: string;
    priority?: string;
    retainerId?: string;
  };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const subject = body.subject?.trim();
  const description = body.description?.trim();
  const category = body.category?.trim() ?? "other";
  const priority = body.priority?.trim() ?? "normal";

  if (!subject || subject.length < 3) {
    return NextResponse.json({ error: "Subject is required (min 3 characters)" }, { status: 400 });
  }
  if (!description || description.length < 10) {
    return NextResponse.json({ error: "Description is required (min 10 characters)" }, { status: 400 });
  }
  if (!isValidCategory(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (!isValidPriority(priority)) {
    return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data: client } = await supabase
      .from("clients")
      .select("contact_name, company_name, portal_email")
      .eq("id", clientId)
      .maybeSingle();

    const ticketNumber = await generateTicketNumber(tenantId);
    const sla = calculateSlaTargets(priority);

    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        tenant_id:           tenantId,
        client_id:           clientId,
        submitted_by:        userId,
        tkt_number:          ticketNumber,
        category,
        priority,
        status:              "open",
        sla_response_target: sla.sla_response_target,
        sla_resolve_target:  sla.sla_resolve_target,
        retainer_id:         body.retainerId || null,
      })
      .select("*")
      .single();
    if (error) throw error;

    // Store initial description as first reply so it appears in the thread
    await supabase.from("ticket_replies").insert({
      ticket_id:  ticket.id,
      tenant_id:  tenantId,
      author_id:  userId,
      body:       description,
      reply_type: "reply",
    }).then(({ error: replyErr }) => {
      if (replyErr) console.error("[createTicket] Failed to store initial reply:", replyErr);
    });

    // Log initial status to audit trail
    await supabase.from("ticket_status_log").insert({
      ticket_id:   ticket.id,
      tenant_id:   tenantId,
      changed_by:  userId,
      from_status: null,
      to_status:   "open",
      note:        "Ticket submitted by client",
      changed_at:  new Date().toISOString(),
    }).then(({ error: logErr }) => { if (logErr) console.error(logErr); });

    // Log to communication timeline
    void logTicketToTimeline({
      tenantId,
      clientId,
      loggedBy: userId,
      ticketNumber,
      subject,
      content: `[Support ticket submitted]\n\n${description}`,
      direction: "inbound",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    // Email confirmation to client
    const email = client?.portal_email;
    if (email) {
      void sendTicketCreated(email, {
        clientName: client?.contact_name ?? "",
        ticketNumber,
        subject,
        category: category.replace(/_/g, " "),
        priority,
        ticketUrl: `${appUrl}/portal/tickets/${ticket.id}`,
      }).catch(console.error);
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@bluuhq.com";
    void sendNewTicketAdmin(adminEmail, {
      clientName:    client?.contact_name || client?.company_name || "",
      clientCompany: client?.company_name,
      ticketNumber,
      subject,
      category: category.replace(/_/g, " "),
      priority,
      description,
      reviewUrl: `${appUrl}/admin/tickets/${ticket.id}`,
    }).catch(console.error);

    return NextResponse.json({
      id: ticket.id,
      ticketNumber,
      status: "open",
    }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/portal/tickets]", err);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
