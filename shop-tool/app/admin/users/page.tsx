import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Shop } from "@/types";

const PAGE_SIZE = 25;

export default async function AdminUsersPage({ searchParams }: { searchParams: { page?: string } }) {
  const supabase = createSupabaseAdminClient();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
  const users = "users" in data ? data.users : [];
  const total = "total" in data ? data.total : users.length;
  const lastPage = "lastPage" in data && data.lastPage > 0 ? data.lastPage : 1;

  const userIds = users.map((u) => u.id);
  const { data: shops } = userIds.length
    ? await supabase.from("shops").select("owner_user_id, name, slug, plan, active").in("owner_user_id", userIds)
    : { data: [] as Pick<Shop, "owner_user_id" | "name" | "slug" | "plan" | "active">[] };

  const shopByOwner = new Map((shops ?? []).map((s) => [s.owner_user_id, s]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Users</h1>
        <p className="text-sm text-ink-soft">{total} total</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Couldn&apos;t load users: {error.message}
        </div>
      )}

      <div className="bg-white border border-line rounded-lg divide-y divide-line">
        {users.length === 0 ? (
          <p className="text-center text-ink-soft py-10 text-sm">No users found.</p>
        ) : (
          users.map((user) => {
            const shop = shopByOwner.get(user.id);
            return (
              <div key={user.id} className="p-3.5 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold text-ink">{user.email ?? "—"}</p>
                  <p className="text-xs text-ink-soft">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                    {!user.email_confirmed_at && (
                      <span className="text-coral font-medium"> · unverified</span>
                    )}
                  </p>
                </div>
                {shop ? (
                  <Link
                    href={`/admin/shops?q=${encodeURIComponent(shop.slug)}`}
                    className="text-sm text-blue hover:underline shrink-0"
                  >
                    {shop.name} · {shop.plan}
                    {!shop.active && " · deactivated"}
                  </Link>
                ) : (
                  <span className="text-xs text-ink-soft italic shrink-0">No shop yet</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <Link
            href={`/admin/users?page=${page - 1}`}
            className={`text-blue font-medium ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            ← Previous
          </Link>
          <span className="text-ink-soft">
            Page {page} of {lastPage}
          </span>
          <Link
            href={`/admin/users?page=${page + 1}`}
            className={`text-blue font-medium ${page >= lastPage ? "pointer-events-none opacity-40" : ""}`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
