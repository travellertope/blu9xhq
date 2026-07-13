"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

/**
 * Supabase Admin-API-generated links (password recovery, invite, admin-side
 * magic links) deliver the session as a URL hash fragment
 * (#access_token=...&refresh_token=...&type=...). @supabase/ssr's browser
 * client is built around the cookie-based PKCE (?code=) flow and does not
 * reliably auto-detect this legacy fragment format, so it's parsed and
 * applied explicitly via setSession() instead of relying on SDK auto-detection.
 */
export async function consumeAuthHash(): Promise<{ session: Session | null; type: string | null }> {
  if (typeof window === "undefined") return { session: null, type: null };

  const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  if (!raw) return { session: null, type: null };

  const params = new URLSearchParams(raw);
  const accessToken  = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type         = params.get("type");
  const hashError    = params.get("error_description");

  // Clear the hash immediately so tokens don't linger in browser history
  // or get reprocessed on refresh.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  if (hashError || !accessToken || !refreshToken) return { session: null, type };

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase.auth.setSession({
    access_token:  accessToken,
    refresh_token: refreshToken,
  });

  if (error) return { session: null, type };
  return { session: data.session, type };
}
