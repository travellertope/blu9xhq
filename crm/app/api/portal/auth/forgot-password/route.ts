import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

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
    // Admin client only for the existence check — it needs the service role
    // for admin.listUsers().
    const adminSupabase = createSupabaseAdminClient();
    const { data } = await adminSupabase.auth.admin.listUsers();
    const exists = data?.users?.some((u) => u.email?.toLowerCase() === email);
    console.log(`[forgot-password] email=${email} exists=${!!exists}`);

    if (exists) {
      // resetPasswordForEmail (not signInWithOtp) — this is a password reset,
      // not a magic-link sign-in. signInWithOtp uses the PKCE ?code= flow,
      // which requires clicking the link in the SAME browser that requested
      // it (the code_verifier lives in that browser's cookies) — completely
      // unworkable for email links, which people routinely open on a
      // different device. resetPasswordForEmail delivers a self-contained
      // recovery token instead (via /reset-password's hash-fragment
      // handling), which works from any device.
      const supabase = createSupabaseServerClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      });
      if (error) {
        console.error("[forgot-password] resetPasswordForEmail failed:", error.message);
      } else {
        console.log("[forgot-password] resetPasswordForEmail sent successfully");
      }
    }
  } catch (err) {
    console.error("[forgot-password]", err);
  }

  // Always return ok — never reveal whether the email exists
  return NextResponse.json({ ok: true });
}
