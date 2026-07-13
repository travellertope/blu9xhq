/**
 * Server-only ticket helpers (use createSupabaseServerClient, which pulls in
 * next/headers). Kept separate from ticket-utils.ts so that file stays safe
 * to import from client components — bundling this into a "use client" page
 * fails the build ("You're importing a component that needs next/headers").
 */
import { createSupabaseServerClient } from "./supabase/server";

// ─── Ticket number generation ─────────────────────────────────────────────────
// Per-tenant, per-year sequence (tickets.tkt_number has a unique(tenant_id,
// tkt_number) constraint) — was a single WP-wide counter pre-migration.

export async function generateTicketNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BLU-${year}-`;

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("tickets")
    .select("tkt_number")
    .eq("tenant_id", tenantId)
    .ilike("tkt_number", `${prefix}%`)
    .order("tkt_number", { ascending: false })
    .limit(1);

  let nextSeq = 1;
  const latest = (data as { tkt_number: string }[] | null)?.[0]?.tkt_number;
  if (latest) {
    const match = latest.match(/BLU-\d{4}-(\d+)/);
    if (match) nextSeq = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ─── Communication timeline integration ───────────────────────────────────────

/**
 * Log a ticket event to the client's communication timeline
 * so it appears in the admin client profile timeline view.
 *
 * channel/comm_type are mapped to the closest values the communications
 * table (and the frontend's CommChannel/CommType unions) actually support —
 * "portal"/"support_ticket" were never valid values even in the WP era, so
 * these entries already rendered as generic communications, not specially.
 */
export async function logTicketToTimeline(params: {
  tenantId: string;
  clientId: string;
  loggedBy: string | null;
  ticketNumber: string;
  subject: string;
  content: string;
  direction?: "inbound" | "outbound";
}): Promise<void> {
  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from("communications").insert({
      tenant_id:   params.tenantId,
      client_id:   params.clientId,
      direction:   params.direction ?? "inbound",
      channel:     "other",
      comm_type:   "manual",
      subject:     `Ticket ${params.ticketNumber}: ${params.subject}`,
      body:        params.content,
      occurred_at: new Date().toISOString(),
      logged_by:   params.loggedBy,
    });
    if (error) throw error;
  } catch (err) {
    // Non-fatal — timeline logging should never block the ticket operation
    console.error("[ticketServer] logTicketToTimeline failed:", err);
  }
}
