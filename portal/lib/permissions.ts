// ─── Role constants ────────────────────────────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN:     "super_admin",
  ACCOUNT_MANAGER: "account_manager",
  BILLING_MANAGER: "billing_manager",
  SUPPORT_STAFF:   "support_staff",
  VIEWER:          "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Permission matrix ────────────────────────────────────────────────────────
// account_manager's "view_all_clients" is handled separately via canAccessClient().
// All other permissions are a static role list.

export const PERMISSIONS: Record<string, Role[]> = {
  view_all_clients:      ["super_admin", "billing_manager", "support_staff", "viewer"],
  create_edit_clients:   ["super_admin", "account_manager"],
  delete_clients:        ["super_admin"],
  assign_subscriptions:  ["super_admin", "account_manager"],
  edit_credentials:      ["super_admin", "account_manager"],
  create_edit_services:  ["super_admin"],
  create_invoices:       ["super_admin", "billing_manager"],
  mark_invoices_paid:    ["super_admin", "billing_manager"],
  view_invoices:         ["super_admin", "account_manager", "billing_manager", "support_staff", "viewer"],
  compose_send_emails:   ["super_admin", "account_manager", "billing_manager", "support_staff"],
  build_sequences:       ["super_admin", "account_manager", "support_staff"],
  log_communications:    ["super_admin", "account_manager", "billing_manager", "support_staff"],
  upload_manage_files:   ["super_admin", "account_manager", "support_staff"],
  delete_files:          ["super_admin", "account_manager"],
  approve_cancellations: ["super_admin", "billing_manager", "account_manager"],
  manage_team:           ["super_admin"],
  access_settings:       ["super_admin"],
  send_portal_invites:   ["super_admin", "account_manager", "support_staff"],
  view_credentials:      ["super_admin", "account_manager", "support_staff"],
};

// ─── Helper functions ──────────────────────────────────────────────────────────

/**
 * Returns true if `role` has the given permission key.
 * account_manager implicitly has view_all_clients — use canAccessClient() for
 * the scoped check.
 */
export function hasPermission(role: Role | string, permission: string): boolean {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  // account_manager can view clients — actual scoping is enforced via canAccessClient()
  if (permission === "view_all_clients" && role === ROLES.ACCOUNT_MANAGER) return true;
  return allowed.includes(role as Role);
}

/**
 * Returns true if `role` can access the given client.
 * All roles except account_manager can access any client.
 * account_manager can only access clients explicitly in their assignedClients list.
 */
export function canAccessClient(
  role: Role | string,
  assignedClients: number[],
  clientId: number
): boolean {
  if (role !== ROLES.ACCOUNT_MANAGER) return true;
  return assignedClients.includes(clientId);
}

/**
 * Returns the dashboard scope for a given role.
 * 'full'   → super_admin, billing_manager
 * 'scoped' → account_manager, support_staff, viewer
 */
export function getDashboardScope(role: Role | string): "full" | "scoped" {
  if (role === ROLES.SUPER_ADMIN || role === ROLES.BILLING_MANAGER) return "full";
  return "scoped";
}

/** All valid role values as a typed array (useful for selects). */
export const ALL_ROLES: Role[] = Object.values(ROLES) as Role[];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin:     "Super Admin",
  account_manager: "Account Manager",
  billing_manager: "Billing Manager",
  support_staff:   "Support Staff",
  viewer:          "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  super_admin:     "Full access to everything — use sparingly",
  account_manager: "Manages assigned clients; no billing or global settings",
  billing_manager: "Full invoice and payment access; no sequences or settings",
  support_staff:   "View, log communications, and upload files; no billing",
  viewer:          "Read-only access across all CRM data",
};
