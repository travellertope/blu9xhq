import { NextRequest, NextResponse } from "next/server";
import { listTickets, updateTicket, getClientPost, wpRestFetch, type WPUser } from "@/lib/wp-api";
import { sendTicketSlaBreached } from "@/lib/resend";

export const maxDuration = 60;

// GET /api/cron/sla-check — runs every 30 minutes via Vercel cron
// Checks for SLA breaches and alerts the admin team.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("Authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000).toISOString();
  const adminEmail = process.env.RESEND_REPLY_TO ?? process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  let alerted = 0;
  let skipped = 0;

  try {
    const result = await listTickets({ per_page: 100 });
    const activeTickets = result.items.filter(
      (t) => t.acf.tkt_status !== "closed" && t.acf.tkt_status !== "resolved"
    );

    const ticketResults = await Promise.allSettled(
      activeTickets.map(async (ticket) => {
        const {
          tkt_number,
          tkt_client,
          tkt_sla_response_target,
          tkt_sla_resolve_target,
          tkt_first_response_at,
          tkt_resolved_at,
          tkt_sla_alerted_at,
          tkt_priority,
          tkt_assigned_to,
        } = ticket.acf;

        const responseBreached =
          !tkt_first_response_at &&
          tkt_sla_response_target &&
          now > tkt_sla_response_target;

        const resolveBreached =
          !tkt_resolved_at &&
          tkt_sla_resolve_target &&
          now > tkt_sla_resolve_target;

        if (!responseBreached && !resolveBreached) return "skipped";

        // Deduplication: only re-alert if 2+ hours since last alert
        if (tkt_sla_alerted_at && tkt_sla_alerted_at > twoHoursAgo) return "skipped";

        const breachType: "response" | "resolve" = responseBreached ? "response" : "resolve";

        let clientName = `Client #${tkt_client}`;
        let assignedToName: string | undefined;

        const clientPost = await getClientPost(tkt_client).catch(() => null);
        if (clientPost) {
          clientName = clientPost.acf.company_name || clientPost.acf.contact_name;
        }

        if (tkt_assigned_to) {
          const assignee = await wpRestFetch<WPUser>(`/wp/v2/users/${tkt_assigned_to}`).catch(() => null);
          if (assignee) assignedToName = assignee.name ?? undefined;
        }

        if (adminEmail) {
          await sendTicketSlaBreached(adminEmail, {
            ticketNumber: tkt_number,
            subject:      ticket.title.rendered.replace(/<[^>]+>/g, ""),
            clientName,
            priority:     tkt_priority,
            breachType,
            assignedTo:   assignedToName,
            ticketUrl:    `${appUrl}/admin/tickets/${ticket.id}`,
          });
        }

        await updateTicket(ticket.id, { acf: { tkt_sla_alerted_at: now } });
        return "alerted";
      })
    );

    for (const r of ticketResults) {
      if (r.status === "fulfilled") {
        if (r.value === "alerted") alerted++;
        else skipped++;
      } else {
        console.error("[sla-check] ticket failed:", r.reason);
        skipped++;
      }
    }
  } catch (err) {
    console.error("[sla-check] fatal:", err);
    return NextResponse.json({ error: "SLA check failed", details: String(err) }, { status: 500 });
  }

  return NextResponse.json({ alerted, skipped });
}
