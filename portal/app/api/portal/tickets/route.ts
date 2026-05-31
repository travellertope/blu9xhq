import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {
  findClientByWpUserId,
  listTickets,
  createTicket,
  createTicketStatusLog,
} from "@/lib/wp-api";
import {
  generateTicketNumber,
  calculateSlaTargets,
  logTicketToTimeline,
  isValidCategory,
  isValidPriority,
} from "@/lib/ticket-utils";
import { sendTicketCreated } from "@/lib/resend";

// GET /api/portal/tickets — list client's own tickets
export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ tickets: [] });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? undefined;

    const result = await listTickets({ client_id: clientPost.id, per_page: 50 });

    const tickets = result.items
      .filter((t) => !status || t.acf.tkt_status === status)
      .map((t) => ({
        id: t.id,
        ticketNumber: t.acf.tkt_number,
        subject: t.title.rendered.replace(/<[^>]+>/g, ""),
        category: t.acf.tkt_category,
        priority: t.acf.tkt_priority,
        status: t.acf.tkt_status,
        createdAt: t.date,
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

  const user = session.user as { wpUserId?: number; email?: string | null };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  let body: {
    subject?: string;
    description?: string;
    category?: string;
    priority?: string;
    retainerId?: number;
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
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const ticketNumber = await generateTicketNumber();
    const sla = calculateSlaTargets(priority);

    const ticket = await createTicket({
      title: ticketNumber,
      acf: {
        tkt_number:              ticketNumber,
        tkt_client:              clientPost.id,
        tkt_submitted_by:        wpUserId,
        tkt_category:            category,
        tkt_priority:            priority,
        tkt_status:              "open",
        tkt_sla_response_target: sla.sla_response_target,
        tkt_sla_resolve_target:  sla.sla_resolve_target,
        ...(body.retainerId ? { tkt_retainer_id: body.retainerId } : {}),
      },
    });

    // Log initial status to audit trail
    await createTicketStatusLog({
      acf: {
        log_ticket_id:  ticket.id,
        log_changed_by: wpUserId,
        log_from_status: "",
        log_to_status:  "open",
        log_note:       "Ticket submitted by client",
        log_changed_at: new Date().toISOString(),
      },
    }).catch(console.error);

    // Log to communication timeline
    void logTicketToTimeline({
      clientPostId: clientPost.id,
      wpUserId,
      ticketNumber,
      subject,
      content: `[Support ticket submitted]\n\n${description}`,
      direction: "inbound",
    });

    // Email confirmation to client
    const email = clientPost.acf.portal_email;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    if (email) {
      void sendTicketCreated(email, {
        clientName: clientPost.acf.contact_name,
        ticketNumber,
        subject,
        category: category.replace(/_/g, " "),
        priority,
        ticketUrl: `${appUrl}/portal/tickets/${ticket.id}`,
      }).catch(console.error);
    }

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
