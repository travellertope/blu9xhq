"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BluuUser } from "@/lib/auth";
import type { UserRole } from "@/types";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface BluuSessionState {
  user: BluuUser | null;
  status: SessionStatus;
  /** Refresh the session (e.g. after an admin updates assignedClients). */
  refresh: () => Promise<void>;
}

function mapUser(supaUser: any): BluuUser | null {
  if (!supaUser) return null;
  const claims  = supaUser.app_metadata ?? {};
  const meta    = supaUser.user_metadata ?? {};
  const userType: string = claims.user_type ?? "";

  const role: UserRole = userType === "team"
    ? "bluu_admin"
    : userType === "client"
    ? "bluu_client"
    : userType === "affiliate"
    ? "bluu_affiliate"
    : "bluu_client";

  return {
    id:               supaUser.id,
    email:            supaUser.email ?? "",
    name:             meta.full_name ?? meta.name ?? supaUser.email ?? "",
    role,
    tenantId:         claims.tenant_id,
    bluuhqRole:       claims.crm_role,
    assignedClients:  claims.assigned_clients,
    affiliateCode:    claims.affiliate_code,
    affiliateStatus:  claims.aff_status,
    wpUserId:         claims.wp_user_id ? Number(claims.wp_user_id) : undefined,
    clientId:         claims.client_id,
    status:           claims.status ?? "active",
  };
}

/**
 * Client-side session hook — drop-in replacement for next-auth's useSession().
 *
 * Usage:
 *   const { user, status } = useBluuSession();
 *
 * Equivalent to the old:
 *   const { data: session, status } = useSession();
 *   const user = session?.user;
 */
export function useBluuSession(): BluuSessionState {
  const [user, setUser]     = useState<BluuUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");
  const supabase            = createSupabaseBrowserClient();

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(mapUser(session?.user ?? null));
    setStatus(session ? "authenticated" : "unauthenticated");
  }

  useEffect(() => {
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user ?? null));
      setStatus(session ? "authenticated" : "unauthenticated");
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, status, refresh: load };
}
