import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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

/**
 * Owner emails live in Supabase Auth, not a public table this admin client
 * can query with a WHERE/join — the Auth Admin API's listUsers has no
 * search filter either, only page/perPage. So this pages through every
 * user (capped at 20k) and matches in memory. Fine at shop-tool's current
 * scale; would need a real search index (or denormalizing owner email onto
 * `shops`) if the user base grows enough for this to get slow.
 */
export async function findUserIdsByEmail(query: string): Promise<string[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];

  const supabase = createSupabaseAdminClient();
  const ids: string[] = [];
  const perPage = 1000;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) break;
    const users = "users" in data ? data.users : [];
    for (const user of users) {
      if (user.email?.toLowerCase().includes(needle)) ids.push(user.id);
    }
    if (users.length < perPage) break; // last page
  }

  return ids;
}
