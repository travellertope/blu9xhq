import { createHmac, timingSafeEqual } from "crypto";
import { wpRestList, wpRestFetch } from "@/lib/wp-api";
import type { WPUser } from "@/lib/wp-api";

// ─── HMAC stateless magic-link tokens ────────────────────────────────────────
// Token payload: JSON({ email, exp }) signed with NEXTAUTH_SECRET.
// No WP user meta storage required — the token itself is the source of truth.

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set");
  return s;
}

const TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateMagicToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + TTL_MS });
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return Buffer.from(`${payload}||${sig}`).toString("base64url");
}

export function verifyMagicToken(token: string, email: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const sepIdx = decoded.lastIndexOf("||");
    if (sepIdx === -1) return false;

    const payload = decoded.slice(0, sepIdx);
    const sig     = decoded.slice(sepIdx + 2);

    const expected = createHmac("sha256", secret()).update(payload).digest("hex");
    if (sig.length !== expected.length) return false;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;

    const { email: tokenEmail, exp } = JSON.parse(payload) as { email: string; exp: number };
    if (tokenEmail.toLowerCase() !== email.toLowerCase()) return false;
    if (Date.now() > exp) return false;

    return true;
  } catch {
    return false;
  }
}

// ─── WP user lookup ───────────────────────────────────────────────────────────

/** Find a bluu_client WP user by exact email or username match. */
export async function findWPClientByEmail(email: string): Promise<WPUser | null> {
  const result = await wpRestList<WPUser>("/wp/v2/users", {
    search:   email,
    per_page: 10,
    context:  "edit",
  });
  const lower = email.toLowerCase();
  return (
    result.items.find(
      (u) =>
        ((u.email ?? "").toLowerCase() === lower ||
         (u.username ?? "").toLowerCase() === lower) &&
        u.roles.includes("bluu_client")
    ) ?? null
  );
}

/**
 * Verify the HMAC token and return the matching WPUser, or null on failure.
 * No WP meta read/write needed — the token is self-contained.
 */
export async function verifyAndConsumeMagicToken(
  email: string,
  token: string
): Promise<WPUser | null> {
  if (!verifyMagicToken(token, email)) return null;
  const user = await findWPClientByEmail(email);
  if (!user || !user.roles.includes("bluu_client")) return null;
  return user;
}

// Keep storeMagicToken as a no-op shim so existing callers don't break
// while we migrate — no-op because token state is now in the signed JWT.
export async function storeMagicToken(_wpUserId: number, _token: string): Promise<void> {
  // Token is self-validating via HMAC; no storage needed.
}
