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
    // for admin.listUsers(), but its cookie handlers are no-ops, which would
    // silently drop the PKCE code_verifier signInWithOtp() needs to persist.
    const adminSupabase = createSupabaseAdminClient();
    const { data } = await adminSupabase.auth.admin.listUsers();
    const exists = data?.users?.some((u) => u.email?.toLowerCase() === email);

    if (exists) {
      // Send via the cookie-aware server client so the PKCE verifier actually
      // gets persisted — lands at /portal/verify?code=… when clicked.
      const supabase = createSupabaseServerClient();
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
