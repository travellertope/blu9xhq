import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { z } from "zod";
import { createMagicToken } from "@/lib/redis";

const RequestSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const token = nanoid(32);
  await createMagicToken(email, token);

  const appUrl = process.env.NEXTAUTH_URL || "https://scan.bluuhq.com";
  const link = `${appUrl}/login/verify?email=${encodeURIComponent(email)}&token=${token}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "");
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "BluuHQ Scan <scan@bluuhq.com>",
      to: email,
      subject: "Your sign-in link",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#0f1729">Sign in to your dashboard</h2>
          <p style="color:#374151;font-size:14px">Click the link below to sign in. It expires in 15 minutes.</p>
          <a href="${link}" style="display:inline-block;background:#2F5FE0;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:12px">Sign in</a>
          <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch {
    return NextResponse.json(
      { error: "email_failed", message: "Could not send the sign-in email. Try again shortly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ sent: true });
}
