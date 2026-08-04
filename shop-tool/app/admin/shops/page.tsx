import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { findUserIdsByEmail } from "@/lib/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ShopRow from "@/components/admin/shop-row";
import type { Shop } from "@/types";

const PAGE_SIZE = 25;

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const supabase = createSupabaseAdminClient();
  const q = searchParams.q?.trim() ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let rows: Shop[];
  let count: number;

  if (q) {
    const escaped = q.replace(/[%_,]/g, "");

    // Two separate lookups merged in memory: shop name/slug is a normal
    // Postgres ilike, but owner email lives in Supabase Auth, which
    // findUserIdsByEmail already had to page through in full — no way to
    // push that into the same query as the shops filter. Search results
    // are paginated client-side (JS slice) rather than via range(), since
    // the merged set can't be split across two DB-level range queries.
    const [{ data: nameMatches }, ownerIds] = await Promise.all([
      supabase.from("shops").select("*").or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%`),
      findUserIdsByEmail(escaped),
    ]);
    const { data: emailMatches } = ownerIds.length
      ? await supabase.from("shops").select("*").in("owner_user_id", ownerIds)
      : { data: [] as Shop[] };

    const merged = new Map<string, Shop>();
    for (const shop of [...(nameMatches ?? []), ...(emailMatches ?? [])] as Shop[]) {
      merged.set(shop.id, shop);
    }
    const all = Array.from(merged.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    count = all.length;
    rows = all.slice(from, to + 1);
  } else {
    const { data, count: totalCount } = await supabase
      .from("shops")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    rows = (data ?? []) as Shop[];
    count = totalCount ?? 0;
  }

  // Owner emails live in Supabase Auth, not the public schema — resolved
  // per row via the Auth Admin API rather than a SQL join. Fine at 25
  // rows/page.
  const emailEntries = await Promise.all(
    rows.map(async (shop) => {
      const { data } = await supabase.auth.admin.getUserById(shop.owner_user_id);
      return [shop.id, data.user?.email ?? "—"] as const;
    })
  );
  const emailByShopId = new Map(emailEntries);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Shops</h1>
        <p className="text-sm text-ink-soft">{count} total</p>
      </div>

      <form className="flex gap-2" action="/admin/shops">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by shop name, link, or owner email…"
          className="flex-1"
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="bg-white border border-line rounded-lg divide-y divide-line">
        {rows.length === 0 ? (
          <p className="text-center text-ink-soft py-10 text-sm">No shops found.</p>
        ) : (
          rows.map((shop) => (
            <ShopRow key={shop.id} shop={shop} ownerEmail={emailByShopId.get(shop.id) ?? "—"} />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <Link
            href={`/admin/shops?q=${encodeURIComponent(q)}&page=${page - 1}`}
            className={`text-blue font-medium ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          >
            ← Previous
          </Link>
          <span className="text-ink-soft">
            Page {page} of {totalPages}
          </span>
          <Link
            href={`/admin/shops?q=${encodeURIComponent(q)}&page=${page + 1}`}
            className={`text-blue font-medium ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
