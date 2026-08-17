import { getSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export interface AuditEventParams {
  action: string;
  actorName: string;
  /** @deprecated unused now that logged_by is a Supabase auth uuid taken from the session */
  actorWpUserId?: number;
  detail?: string;
  /** Supabase clients.id (uuid). Omit for tenant-wide events not tied to one client. */
  clientId?: string;
  resourceType?: string;
}

/**
 * Persists an audit event as a communications row with channel='system'.
 *
 * This is fire-and-forget on the happy path — log the error but never throw,
 * so a logging failure never blocks the primary operation.
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  const { action, actorName, detail, clientId } = params;
  const subject = `${action} by ${actorName}`;
  const now = new Date().toISOString();

  try {
    const session = await getSession();
    if (!session?.user?.tenantId) return;

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("communications").insert({
      tenant_id:   session.user.tenantId,
      client_id:   clientId ?? null,
      direction:   "internal",
      channel:     "system",
      comm_type:   "system",
      subject,
      body:        detail ?? "",
      occurred_at: now,
      logged_by:   session.user.id ?? null,
    });
    if (error) throw error;
  } catch (err) {
    console.error("[auditLog] Failed to write audit event:", action, err);
  }
}

// ─── Typed action constants ────────────────────────────────────────────────────

export const AUDIT_ACTIONS = {
  // Clients
  CLIENT_CREATED:   "client_created",
  CLIENT_EDITED:    "client_edited",
  CLIENT_DELETED:   "client_deleted",
  // Subscriptions
  SUBSCRIPTION_ASSIGNED:   "subscription_assigned",
  SUBSCRIPTION_EDITED:     "subscription_edited",
  SUBSCRIPTION_CANCELLED:  "subscription_cancelled",
  // Credentials
  CREDENTIAL_ROTATED:   "credential_rotated",
  CREDENTIAL_REVEALED:  "credential_revealed",
  // Invoices
  INVOICE_CREATED:      "invoice_created",
  INVOICE_SENT:         "invoice_sent",
  INVOICE_MARKED_PAID:  "invoice_marked_paid",
  INVOICE_VOIDED:       "invoice_voided",
  // Files
  FILE_UPLOADED: "file_uploaded",
  FILE_DELETED:  "file_deleted",
  // Team
  TEAM_MEMBER_INVITED:        "team_member_invited",
  TEAM_MEMBER_ROLE_CHANGED:   "team_member_role_changed",
  TEAM_MEMBER_DEACTIVATED:    "team_member_deactivated",
  TEAM_MEMBER_REACTIVATED:    "team_member_reactivated",
  // Sequences
  SEQUENCE_SYNCED:                  "sequence_synced",
  CLIENT_ENROLLED_IN_SEQUENCE:      "client_enrolled_in_sequence",
  CLIENT_REMOVED_FROM_SEQUENCE:     "client_removed_from_sequence",
  // Portal
  PORTAL_INVITE_SENT: "portal_invite_sent",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
