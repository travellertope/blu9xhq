/**
 * Minimal JWT payload decoder — no signature verification, because these are
 * only ever read from a session Supabase's own SDK already established (the
 * token's authenticity was verified when Supabase issued/accepted it).
 *
 * Needed because custom claims added by the custom_access_token_hook
 * (tenant_id, user_type, crm_role, tenant_plan, ...) live at the top level
 * of the JWT payload, not on the SDK's User/Session objects — those only
 * expose the standard app_metadata/user_metadata sub-objects. Uses atob
 * instead of Buffer so it works in both Node (route handlers) and the Edge
 * runtime (middleware).
 */
export function decodeJwtClaims(jwt: string): Record<string, any> {
  const payload = jwt.split(".")[1] ?? "";
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  try {
    const binary = atob(padded);
    const utf8 = decodeURIComponent(
      binary
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(utf8);
  } catch {
    return {};
  }
}
