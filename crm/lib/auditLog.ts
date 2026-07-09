import { wpRestFetch } from "@/lib/wp-api";

export interface AuditEventParams {
  action: string;
  actorName: string;
  actorWpUserId: number;
  detail?: string;
  clientId?: number;
  resourceType?: string;
}

/**
 * Persists an audit event as a bluu_communication post with comm_channel=system.
 *
 * This is fire-and-forget on the happy path — log the error but never throw,
 * so a logging failure never blocks the primary operation.
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  const { action, actorName, actorWpUserId, detail, clientId } = params;
  const subject = `${action} by ${actorName}`;
  const now = new Date().toISOString();

  try {
    await wpRestFetch("/wp/v2/bluu_communication", {
      method: "POST",
      body: JSON.stringify({
        title: subject,
        status: "publish",
        acf: {
          comm_direction: "internal",
          comm_channel:   "system",
          comm_subject:   subject,
          comm_content:   detail ?? "",
          comm_logged_by: actorWpUserId,
          comm_occurred_at: now,
          ...(clientId ? { comm_client: clientId } : {}),
        },
      }),
    });
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
