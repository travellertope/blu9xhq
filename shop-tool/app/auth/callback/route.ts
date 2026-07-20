import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completePendingShopSetup } from "@/lib/onboarding";

/**
 * Exchanges the magic-link code for a session, then routes based on
 * onboarding state. This only completes sign-in when the link is opened in
 * the same browser that requested it (PKCE) — the 6-digit code flow
 * (verified client-side, see create-with-email-form.tsx / login/page.tsx)
 * is the cross-device path.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.exchangeCodeForSession(code);

  if (!data.user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { redirectTo } = await completePendingShopSetup(supabase, data.user);
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
