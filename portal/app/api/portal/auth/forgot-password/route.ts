import { NextRequest, NextResponse } from "next/server";
import { sendEmailHtml } from "@/lib/resend";
import { generateMagicToken, findWPClientByEmail } from "@/lib/magicToken";

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email : "";
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!email.includes("@")) return NextResponse.json({ ok: true });

  try {
    const user = await findWPClientByEmail(email);
    if (!user) return NextResponse.json({ ok: true });

    const token = generateMagicToken(email);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const link = `${appUrl}/portal/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    await sendEmailHtml({
      to: email,
      subject: "Reset your BluuHQ portal password",
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#fff">
        <div style="padding:20px 32px;border-bottom:4px solid #1875F2">
          <img src="https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png" alt="BluuHQ" height="32" style="display:block">
        </div>
        <div style="padding:32px">
          <h2 style="color:#1e293b;margin:0 0 20px">Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your BluuHQ portal password. Click the button below to sign in and set a new password.</p>
          <p style="margin:24px 0">
            <a href="${link}" style="background:#1875F2;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block">
              Reset Password
            </a>
          </p>
          <p style="color:#64748b;font-size:13px">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
        </div>
      </div>`,
      text: `Reset your BluuHQ portal password:\n${link}\n\nExpires in 1 hour.`,
      tags: [{ name: "type", value: "portal_password_reset" }],
    });
  } catch (err) {
    console.error("[forgot-password]", err);
  }

  return NextResponse.json({ ok: true });
}
