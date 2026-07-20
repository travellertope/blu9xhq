import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Shop } from "@/types";

export interface ShopSession {
  userId: string;
  email: string;
}

/**
 * Use in Server Components and Route Handlers. Returns null if signed out.
 * Single-role model — there's no team/client/affiliate split like BluuCRM,
 * so this is just "is someone signed in."
 */
export async function getSession(): Promise<ShopSession | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  return {
    userId: session.user.id,
    email: session.user.email ?? "",
  };
}

/**
 * Fetches the signed-in user's shop, if they've completed onboarding.
 * Returns null if signed out or if the shop hasn't been created yet.
 */
export async function getMyShop(): Promise<Shop | null> {
  const session = await getSession();
  if (!session) return null;

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_user_id", session.userId)
    .maybeSingle();

  return (data as Shop | null) ?? null;
}

export async function signInWithMagicLink(email: string, redirectTo?: string) {
  const supabase = createSupabaseServerClient();
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  return supabase.auth.signOut();
}
