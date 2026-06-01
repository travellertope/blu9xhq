import { NextRequest, NextResponse } from "next/server";
import { sendEmailHtml } from "@/lib/resend";
import { generateMagicToken, findWPClientByEmail } from "@/lib/magicToken";

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
    // Silently rate-limit — don't reveal timing info
    return NextResponse.json({ ok: true });
  }

  try {
    const user = await findWPClientByEmail(email);
    if (!user) {
      console.warn("[resend-invite] no bluu_client WP user found for:", email);
      return NextResponse.json({ ok: true });
    }

    const token = generateMagicToken(email);
    inviteLog.set(email, Date.now());

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const link = `${appUrl}/portal/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    await sendEmailHtml({
      to: email,
      subject: "Your BluuHQ portal access link",
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#1e293b">Sign in to your BluuHQ portal</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to sign in instantly — no password needed. This link is valid for 1 hour.</p>
        <p style="margin:24px 0">
          <a href="${link}" style="background:#1875F2;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
            Open My Portal
          </a>
        </p>
        <p style="color:#64748b;font-size:13px">If you didn't request this, you can safely ignore it. This link can only be used once.</p>
      </div>`,
      text: `Sign in to your BluuHQ portal:\n${link}\n\nExpires in 1 hour. One-time use only.`,
      tags: [{ name: "type", value: "portal_magic_link" }],
    });
  } catch (err) {
    console.error("[resend-invite]", err);
  }

  return NextResponse.json({ ok: true });
}
