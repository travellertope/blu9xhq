import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { listTickets, getClientPost, wpRestFetch, type WPUser } from "@/lib/wp-api";

// GET /api/admin/tickets/dashboard — v_open_tickets_dashboard equivalent
export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const now = new Date().toISOString();

    // Fetch all non-closed tickets
    const result = await listTickets({ per_page: 100 });
    const openTickets = result.items.filter(
      (t) => t.acf.tkt_status !== "closed"
    );

    // Enrich with client names and assignee names
    const enriched = await Promise.all(
      openTickets.map(async (t) => {
        let clientName = `Client #${t.acf.tkt_client}`;
        let assignedToName: string | null = null;

        try {
          const client = await getClientPost(t.acf.tkt_client);
          clientName = client.acf.company_name || client.acf.contact_name;
        } catch { /* non-fatal */ }

        if (t.acf.tkt_assigned_to) {
          try {
            const assignee = await wpRestFetch<WPUser>(`/wp/v2/users/${t.acf.tkt_assigned_to}`);
            assignedToName = assignee.name ?? null;
          } catch { /* non-fatal */ }
        }

        const responseTarget = t.acf.tkt_sla_response_target;
        const resolveTarget  = t.acf.tkt_sla_resolve_target;
        const slaStatus =
          !t.acf.tkt_first_response_at && responseTarget && now > responseTarget
            ? "response_breached"
            : !t.acf.tkt_resolved_at && resolveTarget && now > resolveTarget
            ? "resolve_breached"
            : "on_track";

        return {
          id:               t.id,
          ticketNumber:     t.acf.tkt_number,
          subject:          t.title.rendered.replace(/<[^>]+>/g, ""),
          status:           t.acf.tkt_status,
          priority:         t.acf.tkt_priority,
          category:         t.acf.tkt_category,
          clientId:         t.acf.tkt_client,
          clientName,
          assignedTo:       t.acf.tkt_assigned_to ?? null,
          assignedToName,
          slaResponseTarget: responseTarget ?? null,
          slaResolveTarget:  resolveTarget ?? null,
          firstResponseAt:   t.acf.tkt_first_response_at ?? null,
          slaStatus,
          createdAt:         t.date,
        };
      })
    );

    // Sort: urgent → high → normal → low, then by createdAt asc
    const priorityOrder: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
    enriched.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 5;
      const pb = priorityOrder[b.priority] ?? 5;
      if (pa !== pb) return pa - pb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const summary = {
      total:            enriched.length,
      open:             enriched.filter((t) => t.status === "open").length,
      inProgress:       enriched.filter((t) => t.status === "in_progress").length,
      awaitingClient:   enriched.filter((t) => t.status === "awaiting_client").length,
      slaBreached:      enriched.filter((t) => t.slaStatus !== "on_track").length,
    };

    return NextResponse.json({ tickets: enriched, summary });
  } catch (err) {
    console.error("[GET /api/admin/tickets/dashboard]", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
