import { createSupabaseAdminClient } from "@/lib/supabase/server";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-line rounded-lg p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="text-2xl font-extrabold text-ink mt-1">{value}</p>
      {sub && <p className="text-xs text-ink-soft mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{children}</div>
    </section>
  );
}

export default async function AdminAnalyticsPage() {
  const supabase = createSupabaseAdminClient();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalShops,
    activeShops,
    freeShops,
    starterShops,
    proShops,
    shopsBonusActive,
    shopsLast7d,
    shopsLast30d,
    totalProducts,
    ordersNew,
    ordersContacted,
    ordersConfirmed,
    ordersFulfilled,
    ordersCancelled,
    referralsPending,
    referralsActive,
    referralsRewarded,
  ] = await Promise.all([
    supabase.from("shops").select("id", { count: "exact", head: true }),
    supabase.from("shops").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("shops").select("id", { count: "exact", head: true }).eq("plan", "free"),
    supabase.from("shops").select("id", { count: "exact", head: true }).eq("plan", "starter"),
    supabase.from("shops").select("id", { count: "exact", head: true }).eq("plan", "pro"),
    supabase.from("shops").select("id", { count: "exact", head: true }).gt("referral_bonus_expires_at", now.toISOString()),
    supabase.from("shops").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("shops").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("order_intents").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("order_intents").select("id", { count: "exact", head: true }).eq("status", "contacted"),
    supabase.from("order_intents").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
    supabase.from("order_intents").select("id", { count: "exact", head: true }).eq("status", "fulfilled"),
    supabase.from("order_intents").select("id", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("referrals").select("id", { count: "exact", head: true }).eq("status", "rewarded"),
  ]);

  const totalOrderIntents =
    (ordersNew.count ?? 0) +
    (ordersContacted.count ?? 0) +
    (ordersConfirmed.count ?? 0) +
    (ordersFulfilled.count ?? 0) +
    (ordersCancelled.count ?? 0);

  const totalReferrals =
    (referralsPending.count ?? 0) + (referralsActive.count ?? 0) + (referralsRewarded.count ?? 0);

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-bold text-ink">Platform analytics</h1>

      <Section title="Shops">
        <StatCard label="Total shops" value={totalShops.count ?? 0} />
        <StatCard
          label="Active"
          value={activeShops.count ?? 0}
          sub={`${(totalShops.count ?? 0) - (activeShops.count ?? 0)} deactivated`}
        />
        <StatCard label="New (7d)" value={shopsLast7d.count ?? 0} />
        <StatCard label="New (30d)" value={shopsLast30d.count ?? 0} />
      </Section>

      <Section title="Plans">
        <StatCard label="Free" value={freeShops.count ?? 0} />
        <StatCard label="Starter" value={starterShops.count ?? 0} />
        <StatCard label="Pro" value={proShops.count ?? 0} />
        <StatCard
          label="Referral bonus active"
          value={shopsBonusActive.count ?? 0}
          sub="Free shops with comped Starter"
        />
      </Section>

      <Section title="Referral program">
        <StatCard label="Pending" value={referralsPending.count ?? 0} sub="Signed up, no product yet" />
        <StatCard label="Active" value={referralsActive.count ?? 0} sub="First product created" />
        <StatCard
          label="Rewarded"
          value={referralsRewarded.count ?? 0}
          sub={`${Math.floor((referralsRewarded.count ?? 0) / 2)} months granted`}
        />
        <StatCard label="Total referrals" value={totalReferrals} />
      </Section>

      <Section title="Products & orders">
        <StatCard label="Total products" value={totalProducts.count ?? 0} />
        <StatCard label="Order intents" value={totalOrderIntents} />
        <StatCard label="Confirmed" value={ordersConfirmed.count ?? 0} />
        <StatCard label="Fulfilled" value={ordersFulfilled.count ?? 0} />
      </Section>
    </div>
  );
}
