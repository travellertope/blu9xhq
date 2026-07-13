/**
 * Auth shim — preserves the session interface consumed across the codebase
 * while the underlying implementation moves from NextAuth → Supabase Auth.
 *
 * Drop-in replacement: files that previously called
 *   getServerSession(authOptions)  →  now call  getSession()
 *   useSession()                   →  now call  useBluuSession()
 *
 * The session object shape is identical to the NextAuth version.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decodeJwtClaims } from "@/lib/jwt";
import type { UserRole } from "@/types";

// ── Session shape (mirrors the old NextAuth session.user payload) ─────────────

export interface BluuUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  wpUserId?: number;
  clientId?: string;
  bluuhqRole?: string;
  assignedClients?: number[];
  status?: string;
  affiliateCode?: string;
  affiliateStatus?: string;
  // Supabase-native
  tenantId?: string;
  tenantPlan?: import("@/lib/planLimits").TenantPlan;
}

export interface BluuSession {
  user: BluuUser;
  expires: string;
}

// ── Server: get session from Supabase cookie ──────────────────────────────────

/**
 * Use in Server Components and Route Handlers.
 * Returns null if the user is not signed in.
 */
export async function getSession(): Promise<BluuSession | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // Custom claims (tenant_id, user_type, crm_role, ...) live at the top
  // level of the JWT payload, not on session.user.app_metadata.
  const claims = decodeJwtClaims(session.access_token);
  const userMeta = session.user.user_metadata ?? {};

  const userType: string = claims.user_type ?? "";

  const role: UserRole = userType === "team"
    ? "bluu_admin"
    : userType === "client"
    ? "bluu_client"
    : userType === "affiliate"
    ? "bluu_affiliate"
    : "bluu_client";

  return {
    user: {
      id:               session.user.id,
      email:            session.user.email ?? "",
      name:             userMeta.full_name ?? userMeta.name ?? session.user.email ?? "",
      role,
      tenantId:         claims.tenant_id,
      tenantPlan:       claims.tenant_plan,
      bluuhqRole:       claims.crm_role,
      assignedClients:  claims.assigned_clients,
      affiliateCode:    claims.affiliate_code,
      affiliateStatus:  claims.aff_status,
      // wp_user_id preserved for any remaining WP-backed calls
      wpUserId:         claims.wp_user_id ? Number(claims.wp_user_id) : undefined,
      clientId:         claims.client_id,
      status:           claims.status,
    },
    expires: new Date(session.expires_at! * 1000).toISOString(),
  };
}

/**
 * Use in Server Components that require authentication.
 * Throws a redirect-friendly error string if session is missing.
 */
export async function requireSession(
  redirectTo = "/portal-login"
): Promise<BluuSession> {
  const session = await getSession();
  if (!session) {
    throw new Error(`REDIRECT:${redirectTo}`);
  }
  return session;
}

// ── Sign-in helpers (used by login pages) ─────────────────────────────────────

/**
 * Email+password sign-in. Works for team members, client users, and affiliates.
 * Supabase determines the user type; the JWT hook injects the correct claims.
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = createSupabaseServerClient();
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Magic-link (OTP) sign-in for client portal.
 */
export async function signInWithMagicLink(email: string, redirectTo?: string) {
  const supabase = createSupabaseServerClient();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo ?? `${process.env.NEXT_PUBLIC_SITE_URL}/portal/verify`,
    },
  });
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  return supabase.auth.signOut();
}

// ── Legacy export — kept so any file that imports authOptions doesn't break ───
// TODO: remove once all route handlers are migrated away from next-auth.
export const authOptions = undefined;
