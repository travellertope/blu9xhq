import Link from "next/link";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AnalyticsEvent, Product } from "@/types";

const WINDOW_OPTIONS = [7, 30, 90] as const;
const DEFAULT_WINDOW = 30;

function pct(numerator: number, denominator: number): string {
  if (denominator === 0) return "—";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { days?: string };
}) {
  const shop = await getMyShop();
  if (!shop) return null;

  const requested = Number(searchParams.days);
  const windowDays = (WINDOW_OPTIONS as readonly number[]).includes(requested) ? requested : DEFAULT_WINDOW;

  const supabase = createSupabaseServerClient();
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

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
  const sessionDays = new Map<string, Set<string>>();

  for (const event of (events as AnalyticsEvent[] | null) ?? []) {
    totals[event.event_type] += 1;
    if (event.product_id) {
      const row = byProduct.get(event.product_id) ?? { view: 0, add_to_cart: 0, checkout_click: 0 };
      row[event.event_type] += 1;
      byProduct.set(event.product_id, row);
    }
    const day = event.created_at.slice(0, 10);
    const days = sessionDays.get(event.session_id) ?? new Set<string>();
    days.add(day);
    sessionDays.set(event.session_id, days);
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

  const totalSessions = sessionDays.size;
  const repeatSessions = Array.from(sessionDays.values()).filter((days) => days.size > 1).length;
  const repeatRatePct = totalSessions > 0 ? Math.round((repeatSessions / totalSessions) * 100) : null;

  const viewToCartRate = totals.view > 0 ? totals.add_to_cart / totals.view : null;
  const cartToCheckoutRate = totals.add_to_cart > 0 ? totals.checkout_click / totals.add_to_cart : null;
  let dropOffMessage: string | null = null;
  if (viewToCartRate !== null && cartToCheckoutRate !== null) {
    dropOffMessage =
      viewToCartRate <= cartToCheckoutRate
        ? `${Math.round((1 - viewToCartRate) * 100)}% of people who view a product never add it to cart — that's your biggest drop-off.`
        : `${Math.round((1 - cartToCheckoutRate) * 100)}% of people who add to cart never tap checkout — that's your biggest drop-off.`;
  }

  const funnelSteps = [
    { label: "Views", value: totals.view },
    { label: "Added to cart", value: totals.add_to_cart },
    { label: "Checkout clicks", value: totals.checkout_click },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Insights</h1>
        <div className="flex gap-1 bg-bg-soft rounded-full p-0.5">
          {WINDOW_OPTIONS.map((d) => (
            <Link
              key={d}
              href={`/dashboard/analytics?days=${d}`}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                d === windowDays ? "bg-white text-ink shadow-sm" : "text-ink-soft"
              }`}
            >
              {d}d
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-line rounded-lg p-3 text-center">
          <p className="text-xl font-extrabold text-ink">{totals.view}</p>
          <p className="text-xs text-ink-soft mt-0.5">Views</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-3 text-center">
          <p className="text-xl font-extrabold text-ink">{totals.checkout_click}</p>
          <p className="text-xs text-ink-soft mt-0.5">Checkout clicks</p>
        </div>
        <div className="bg-white border border-line rounded-lg p-3 text-center">
          <p className="text-xl font-extrabold text-ink">{repeatRatePct === null ? "—" : `${repeatRatePct}%`}</p>
          <p className="text-xs text-ink-soft mt-0.5">Repeat visitors</p>
        </div>
      </div>

      <div className="bg-white border border-line rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-bold text-ink">Funnel</h2>
        {funnelSteps.map((step) => (
          <div key={step.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink-soft">{step.label}</span>
              <span className="font-semibold text-ink">{step.value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-bg-soft overflow-hidden">
              <div
                className="h-full bg-blue rounded-full"
                style={{ width: `${totals.view > 0 ? Math.max(4, (step.value / totals.view) * 100) : 0}%` }}
              />
            </div>
          </div>
        ))}
        {dropOffMessage && (
          <p className="text-xs text-ink-soft pt-2 mt-1 border-t border-line">{dropOffMessage}</p>
        )}
      </div>

      {totalSessions > 0 && (
        <div className="bg-white border border-line rounded-lg p-4">
          <h2 className="text-sm font-bold text-ink mb-1">Repeat visitors</h2>
          <p className="text-xs text-ink-soft">
            {repeatSessions} of {totalSessions} visitor{totalSessions === 1 ? "" : "s"} came back on a different
            day within the last {windowDays} days.
          </p>
        </div>
      )}

      <div className="bg-white border border-line rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-bold text-ink">Top products</h2>
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
                  {p.add_to_cart} to cart ({pct(p.add_to_cart, p.view)}) · {p.checkout_click} checkout (
                  {pct(p.checkout_click, p.add_to_cart)})
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
