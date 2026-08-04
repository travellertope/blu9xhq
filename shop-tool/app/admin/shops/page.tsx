import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
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

  let query = supabase
    .from("shops")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    query = query.or(`name.ilike.%${escaped}%,slug.ilike.%${escaped}%,owner_email.ilike.%${escaped}%`);
  }

  const { data: shops, count } = await query;
  const rows = (shops ?? []) as Shop[];

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Shops</h1>
        <p className="text-sm text-ink-soft">{count ?? 0} total</p>
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
          rows.map((shop) => <ShopRow key={shop.id} shop={shop} ownerEmail={shop.owner_email ?? "—"} />)
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
