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
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// ── Session shape (mirrors the old NextAuth session.user payload) ─────────────

export interface BluuUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  wpUserId?: number;
  clientId?: string;
  bluuhqRole?: string;
  assignedClients?: string[];
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
 * Read session from next/headers cookies WITHOUT any Supabase SDK network call.
 * Uses the same cookie source as createSupabaseServerClient() but skips the
 * GoTrueClient initialization that can hang on cold Lambda starts.
 * Use in API Route Handlers; falls back to null if no valid session found.
 */
export function getSessionFromCookies(): BluuSession | null {
  return _parseSupabaseCookies(cookies().getAll());
}

/**
 * Read session from a NextRequest's cookies WITHOUT any Supabase SDK network call.
 * Prefer getSessionFromCookies() in route handlers — req.cookies may not reflect
 * middleware-modified cookie values.
 */
export function getSessionFromRequest(req: NextRequest): BluuSession | null {
  return _parseSupabaseCookies(req.cookies.getAll());
}

function _parseSupabaseCookies(
  allCookies: { name: string; value: string }[]
): BluuSession | null {

  // @supabase/ssr stores large sessions as chunked cookies:
  // sb-<ref>-auth-token.0, sb-<ref>-auth-token.1, ...
  // The base cookie sb-<ref>-auth-token is empty when chunks exist.
  const chunks: { index: number; value: string }[] = [];
  let baseCookieName: string | undefined;
  for (const c of allCookies) {
    const chunkMatch = c.name.match(/^(sb-.+-auth-token)\.(\d+)$/);
    if (chunkMatch) {
      chunks.push({ index: Number(chunkMatch[2]), value: c.value });
      baseCookieName = chunkMatch[1];
    }
  }

  let tokenJson: string | undefined;
  if (chunks.length > 0) {
    chunks.sort((a, b) => a.index - b.index);
    tokenJson = chunks.map((c) => c.value).join("");
  } else {
    const baseCookie = allCookies.find((c) => /^sb-.+-auth-token$/.test(c.name));
    if (baseCookie?.value) tokenJson = baseCookie.value;
  }

  if (!tokenJson) return null;

  let parsed: { access_token?: string; user?: { id?: string; email?: string; user_metadata?: Record<string, any> }; expires_at?: number };
  try {
    const decoded = tokenJson.startsWith("%") || tokenJson.includes("%7B")
      ? decodeURIComponent(tokenJson)
      : tokenJson;
    parsed = JSON.parse(decoded);
  } catch {
    return null;
  }

  const { access_token, user, expires_at } = parsed;
  if (!access_token || !user) return null;

  // Reject expired tokens (middleware should have refreshed, but be defensive)
  if (expires_at && expires_at * 1000 < Date.now()) return null;

  const claims = decodeJwtClaims(access_token);
  const userMeta = user.user_metadata ?? {};
  const userType: string = claims.user_type ?? "";
  const role: UserRole =
    userType === "team"      ? "bluu_admin"
    : userType === "client"  ? "bluu_client"
    : userType === "affiliate" ? "bluu_affiliate"
    : "bluu_client";

  return {
    user: {
      id:              user.id ?? "",
      email:           user.email ?? "",
      name:            userMeta.full_name ?? userMeta.name ?? user.email ?? "",
      role,
      tenantId:        claims.tenant_id,
      tenantPlan:      claims.tenant_plan,
      bluuhqRole:      claims.crm_role,
      assignedClients: claims.assigned_clients,
      affiliateCode:   claims.affiliate_code,
      affiliateStatus: claims.aff_status,
      wpUserId:        claims.wp_user_id ? Number(claims.wp_user_id) : undefined,
      clientId:        claims.client_id,
      status:          claims.status,
    },
    expires: expires_at ? new Date(expires_at * 1000).toISOString() : "",
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
