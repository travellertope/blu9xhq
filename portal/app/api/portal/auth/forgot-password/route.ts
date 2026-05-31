import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch, wpRestList } from "@/lib/wp-api";
import type { WPUser } from "@/lib/wp-api";
import { sendEmail } from "@/lib/resend";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true }); // Always return ok
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? (body as { email?: unknown }).email
      : undefined;

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: true });
  }

  // Don't reveal whether email exists — always return ok
  try {
    const usersResult = await wpRestList<WPUser>("/wp/v2/users", {
      search: email,
      per_page: 1,
    });

    const user = usersResult.items.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // Store token on WP user meta
    await wpRestFetch(`/wp/v2/users/${user.id}`, {
      method: "POST",
      body: JSON.stringify({
        meta: {
          portal_reset_token: token,
          portal_reset_token_expires: expires,
        },
      }),
    });

    // Send reset email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const resetLink = `${appUrl}/portal/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      subject: "Reset your BluuHQ portal password",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Reset Your Password</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your portal password. Click the button below to set a new password.</p>
          <p>
            <a href="${resetLink}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
              Reset Password
            </a>
          </p>
          <p style="color:#64748b;font-size:14px">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
      text: `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.`,
      tags: [{ name: "type", value: "portal_password_reset" }],
    });
  } catch (err) {
    console.error("[forgot-password] Error:", err);
    // Still return ok to avoid revealing info
  }

  return NextResponse.json({ ok: true });
}
