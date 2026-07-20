import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AnalyticsEvent, Product } from "@/types";

const WINDOW_DAYS = 30;

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export default async function AnalyticsPage() {
  const shop = await getMyShop();
  if (!shop) return null;

  const supabase = createSupabaseServerClient();
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: events }, { data: products }] = await Promise.all([
    supabase
      .from("analytics_events")
      .select("*")
      .eq("shop_id", shop.id)
      .gte("created_at", since),
    supabase.from("products").select("*").eq("shop_id", shop.id),
  ]);

  const productNames = new Map((products as Product[] | null ?? []).map((p) => [p.id, p.name]));

  const totals = { view: 0, add_to_cart: 0, checkout_click: 0 };
  const byProduct = new Map<string, { view: number; add_to_cart: number; checkout_click: number }>();

  for (const event of (events as AnalyticsEvent[] | null) ?? []) {
    totals[event.event_type] += 1;
    if (event.product_id) {
      const row = byProduct.get(event.product_id) ?? { view: 0, add_to_cart: 0, checkout_click: 0 };
      row[event.event_type] += 1;
      byProduct.set(event.product_id, row);
    }
  }

  const topProducts = Array.from(byProduct.entries())
    .map(([productId, counts]) => ({
      productId,
      name: productNames.get(productId) ?? "Deleted product",
      ...counts,
    }))
    .sort((a, b) => b.view - a.view)
    .slice(0, 8);

  const maxViews = Math.max(1, ...topProducts.map((p) => p.view));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-ink">Insights</h1>
        <p className="text-sm text-ink-soft -mt-0.5">Last {WINDOW_DAYS} days.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-line rounded-lg p-3 text-center">
          <p className="text-xl font-extrabold text-ink">{totals.view}</p>
          <p className="text-xs text-ink-soft mt-0.5">Views</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-3 text-center">
          <p className="text-xl font-extrabold text-ink">{totals.add_to_cart}</p>
          <p className="text-xs text-ink-soft mt-0.5">Added to cart</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-3 text-center">
          <p className="text-xl font-extrabold text-ink">{totals.checkout_click}</p>
          <p className="text-xs text-ink-soft mt-0.5">Checkout clicks</p>
        </div>
      </div>

      <div className="bg-white border border-line rounded-lg p-4 space-y-2.5">
        <h2 className="text-sm font-bold text-ink">Funnel</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-soft">View → add to cart</span>
          <span className="font-semibold text-ink">{pct(totals.add_to_cart, totals.view)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-soft">Add to cart → checkout</span>
          <span className="font-semibold text-ink">{pct(totals.checkout_click, totals.add_to_cart)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink-soft">View → checkout</span>
          <span className="font-semibold text-ink">{pct(totals.checkout_click, totals.view)}</span>
        </div>
      </div>

      <div className="bg-white border border-line rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-bold text-ink">Top products by views</h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-ink-soft py-6 text-center">No product views yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {topProducts.map((p) => (
              <li key={p.productId}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ink font-medium truncate pr-2">{p.name}</span>
                  <span className="text-ink-soft shrink-0">
                    {p.view} view{p.view === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-soft overflow-hidden">
                  <div
                    className="h-full bg-blue rounded-full"
                    style={{ width: `${Math.max(4, (p.view / maxViews) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-ink-soft mt-1">
                  {p.add_to_cart} added to cart · {p.checkout_click} checkout click
                  {p.checkout_click === 1 ? "" : "s"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
