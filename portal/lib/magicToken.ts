import { randomBytes } from "crypto";
import { wpRestFetch, wpRestList } from "@/lib/wp-api";
import type { WPUser } from "@/lib/wp-api";

const TTL_MS = 60 * 60 * 1000; // 1 hour

export function generateMagicToken(): string {
  return randomBytes(32).toString("hex");
}

/** Find a bluu_client WP user by exact email match. */
export async function findWPClientByEmail(email: string): Promise<WPUser | null> {
  const result = await wpRestList<WPUser>("/wp/v2/users", {
    search:   email,
    per_page: 10,
    context:  "edit", // required to include the email field in the response
  });
  return (
    result.items.find(
      (u) =>
        (u.email ?? "").toLowerCase() === email.toLowerCase() &&
        u.roles.includes("bluu_client")
    ) ?? null
  );
}

/** Store a magic-link token on a WP user (1 hour TTL). */
export async function storeMagicToken(wpUserId: number, token: string): Promise<void> {
  const expires = new Date(Date.now() + TTL_MS).toISOString();
  await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
    method: "POST",
    body: JSON.stringify({
      meta: {
        portal_magic_token: token,
        portal_magic_token_expires: expires,
      },
    }),
  });
}

/**
 * Verify a magic token against a WP user's stored token.
 * On success: clears the token (one-time use) and returns the full WPUser.
 * On failure: returns null.
 */
export async function verifyAndConsumeMagicToken(
  email: string,
  token: string
): Promise<WPUser | null> {
  const match = await findWPClientByEmail(email);
  if (!match) return null;

  // Fetch the full user record to read registered meta
  const user = await wpRestFetch<WPUser>(`/wp/v2/users/${match.id}`).catch(() => null);
  if (!user) return null;

  const storedToken = String(user.meta.portal_magic_token ?? "");
  const expiresStr = String(user.meta.portal_magic_token_expires ?? "");

  if (!storedToken || storedToken !== token) return null;
  if (!expiresStr || Date.now() > new Date(expiresStr).getTime()) return null;

  // Consume — clear the token so it can't be reused
  wpRestFetch(`/wp/v2/users/${user.id}`, {
    method: "POST",
    body: JSON.stringify({
      meta: { portal_magic_token: "", portal_magic_token_expires: "" },
    }),
  }).catch(() => {});

  return user;
}
