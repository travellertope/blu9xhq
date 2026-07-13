/**
 * Shared, client-safe utilities for the support ticket system — pure
 * functions and constants only. Used by both portal/admin pages ("use
 * client" components) and API routes. Server-only helpers that need
 * createSupabaseServerClient (and therefore next/headers) live in
 * ticketServer.ts instead — mixing them in here breaks the build for any
 * client component that imports this file.
 */

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
