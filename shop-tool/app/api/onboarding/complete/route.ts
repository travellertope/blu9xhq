import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completePendingShopSetup } from "@/lib/onboarding";

/**
 * Called right after a client-side supabase.auth.verifyOtp() succeeds (the
 * 6-digit code path — session cookies are already set by that point). Runs
 * the same "create the shop from pending signup metadata if needed" logic
 * the magic-link callback uses, so both paths land in the same place.
 */
export async function POST() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const result = await completePendingShopSetup(supabase, user);
  return NextResponse.json(result);
}
