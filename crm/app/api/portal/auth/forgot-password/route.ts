import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!email.includes("@")) return NextResponse.json({ ok: true });

  try {
    const supabase = createSupabaseAdminClient();

    // Check user exists (don't reveal whether the email is registered)
    const { data } = await supabase.auth.admin.listUsers();
    const exists = data?.users?.some((u) => u.email?.toLowerCase() === email);

    if (exists) {
      // Send a magic-link OTP — lands at /portal/verify?code=…
      await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/verify`,
        },
      });
    }
  } catch (err) {
    console.error("[forgot-password]", err);
  }

  // Always return ok — never reveal whether the email exists
  return NextResponse.json({ ok: true });
}
