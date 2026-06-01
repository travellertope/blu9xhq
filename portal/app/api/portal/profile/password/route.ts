import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";

const WORDPRESS_URL = process.env.WORDPRESS_URL!;

async function verifyCurrentPassword(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch(WORDPRESS_URL + "/wp-json/bluuhq/v1/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function passwordStrength(pw: string): "weak" | "fair" | "strong" {
  if (pw.length < 8) return "weak";
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (pw.length >= 12 && score >= 3) return "strong";
  if (pw.length >= 8 && score >= 2) return "fair";
  return "weak";
}

export async function PATCH(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; email?: string | null };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  let body: { currentPassword?: string; newPassword?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { currentPassword, newPassword } = body;
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }
  if (passwordStrength(newPassword) === "weak") {
    return NextResponse.json({ error: "Password is too weak — use a mix of letters, numbers, and symbols" }, { status: 400 });
  }

  // currentPassword is required when changing an existing password (profile page),
  // but omitted during first-time setup where the client has no password yet.
  if (currentPassword) {
    const email = user.email ?? "";
    const valid = await verifyCurrentPassword(email, currentPassword);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
  }

  try {
    await wpRestFetch("/wp/v2/users/" + wpUserId, {
      method: "POST",
      body: JSON.stringify({ password: newPassword }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/portal/profile/password]", err);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
