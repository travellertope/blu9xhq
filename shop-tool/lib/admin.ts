import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Whether the signed-in user's email is in the ADMIN_EMAILS allowlist.
 * shop-tool has no roles table — it's a single-role, single-owner-per-shop
 * model everywhere else (see lib/auth.ts) — so a plain env-var allowlist is
 * the right size for "one operator needs a platform-wide view," rather than
 * standing up crm/'s full bluu_admin role system for a different product.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.email) return false;
  return adminEmails().includes(session.email.toLowerCase());
}

/** For admin Server Components/layouts — bounces non-admins to their own dashboard. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/dashboard");
}
