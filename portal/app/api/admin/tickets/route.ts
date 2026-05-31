import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { listTickets } from "@/lib/wp-api";

// GET /api/admin/tickets — list all tickets (filterable)
export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status")   ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const clientId = searchParams.get("clientId") ? parseInt(searchParams.get("clientId")!, 10) : undefined;
  const page     = parseInt(searchParams.get("page") ?? "1", 10);

  try {
    const result = await listTickets({ per_page: 50, page, client_id: clientId });

    const tickets = result.items
      .filter((t) => (!status   || t.acf.tkt_status   === status))
      .filter((t) => (!priority || t.acf.tkt_priority === priority))
      .map((t) => ({
        id:                   t.id,
        ticketNumber:         t.acf.tkt_number,
        subject:              t.title.rendered.replace(/<[^>]+>/g, ""),
        clientId:             t.acf.tkt_client,
        submittedBy:          t.acf.tkt_submitted_by,
        assignedTo:           t.acf.tkt_assigned_to ?? null,
        category:             t.acf.tkt_category,
        priority:             t.acf.tkt_priority,
        status:               t.acf.tkt_status,
        slaResponseTarget:    t.acf.tkt_sla_response_target,
        slaResolveTarget:     t.acf.tkt_sla_resolve_target,
        firstResponseAt:      t.acf.tkt_first_response_at ?? null,
        resolvedAt:           t.acf.tkt_resolved_at ?? null,
        createdAt:            t.date,
      }));

    return NextResponse.json({ tickets, total: result.total, totalPages: result.totalPages, page });
  } catch (err) {
    console.error("[GET /api/admin/tickets]", err);
    return NextResponse.json({ error: "Failed to load tickets" }, { status: 500 });
  }
}
