/**
 * Shared utilities for the support ticket system.
 * Used by both portal and admin API routes.
 */
import { createSupabaseServerClient } from "./supabase/server";

// ─── SLA targets ──────────────────────────────────────────────────────────────

const SLA_CONFIG: Record<string, { responseHours: number; resolveHours: number }> = {
  urgent: { responseHours: 2,  resolveHours: 8 },
  high:   { responseHours: 4,  resolveHours: 24 },
  normal: { responseHours: 8,  resolveHours: 48 },
  low:    { responseHours: 24, resolveHours: 120 }, // 5 business days ≈ 120 hours
};

export function calculateSlaTargets(priority: string): {
  sla_response_target: string;
  sla_resolve_target: string;
} {
  const cfg = SLA_CONFIG[priority] ?? SLA_CONFIG.normal;
  const now = Date.now();
  return {
    sla_response_target: new Date(now + cfg.responseHours * 3_600_000).toISOString(),
    sla_resolve_target:  new Date(now + cfg.resolveHours  * 3_600_000).toISOString(),
  };
}

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
    console.error("[ticket-utils] logTicketToTimeline failed:", err);
  }
}

// ─── Status transition helpers ────────────────────────────────────────────────

const VALID_STATUSES = new Set([
  "open", "in_progress", "awaiting_client", "awaiting_internal", "resolved", "closed",
]);

const VALID_PRIORITIES = new Set(["low", "normal", "high", "urgent"]);

const VALID_CATEGORIES = new Set([
  "content_feedback", "delivery_query", "retainer_question",
  "technical_issue", "billing", "other",
]);

export function isValidStatus(s: string): boolean   { return VALID_STATUSES.has(s); }
export function isValidPriority(s: string): boolean { return VALID_PRIORITIES.has(s); }
export function isValidCategory(s: string): boolean { return VALID_CATEGORIES.has(s); }

export function priorityBadgeColor(priority: string): string {
  switch (priority) {
    case "urgent": return "bg-red-100 text-red-700 border-red-200";
    case "high":   return "bg-orange-100 text-orange-700 border-orange-200";
    case "low":    return "bg-slate-100 text-slate-600 border-slate-200";
    default:       return "bg-blue-100 text-blue-700 border-blue-200";
  }
}

export function statusBadgeColor(status: string): string {
  switch (status) {
    case "open":              return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "in_progress":       return "bg-blue-100 text-blue-700 border-blue-200";
    case "awaiting_client":   return "bg-purple-100 text-purple-700 border-purple-200";
    case "awaiting_internal": return "bg-orange-100 text-orange-700 border-orange-200";
    case "resolved":          return "bg-green-100 text-green-700 border-green-200";
    case "closed":            return "bg-slate-100 text-slate-600 border-slate-200";
    default:                  return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// ─── Allowed MIME types for ticket attachments ────────────────────────────────

export const TICKET_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export const TICKET_MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25 MB
export const TICKET_MAX_ATTACHMENTS = 10;
