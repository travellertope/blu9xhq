import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Rate limit: 1 invite per email per hour (in-memory, resets on server restart)
const inviteLog = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!email.includes("@")) return NextResponse.json({ ok: true });

  const lastSent = inviteLog.get(email);
  if (lastSent && Date.now() - lastSent < RATE_LIMIT_MS) {
    return NextResponse.json({ ok: true }); // silent rate-limit
  }

  try {
    // Cookie-aware server client — NOT the admin client, whose cookie
    // handlers are no-ops and would silently drop the PKCE code_verifier
    // this flow needs to persist for the link to work when clicked.
    const supabase = createSupabaseServerClient();

    // Send OTP magic link — Supabase handles email delivery via its SMTP settings.
    // shouldCreateUser: false means it silently no-ops if email is not registered,
    // so we never leak whether an address is in the system.
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/verify`,
      },
    });

    if (error) {
      console.error(`[resend-invite] email=${email} signInWithOtp failed:`, error.message);
    } else {
      console.log(`[resend-invite] email=${email} sent successfully`);
      inviteLog.set(email, Date.now());
    }
  } catch (err) {
    console.error("[resend-invite]", err);
  }

  return NextResponse.json({ ok: true });
}
