import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CopyReferralLink from "@/components/dashboard/copy-referral-link";
import type { Referral, ReferralStatus } from "@/types";

const REFERRALS_PER_REWARD = 2;

const STATUS_LABEL: Record<ReferralStatus, string> = {
  pending: "Signed up",
  active: "Active",
  rewarded: "Rewarded",
};

const STATUS_STYLES: Record<ReferralStatus, string> = {
  pending: "bg-ink-soft/10 text-ink-soft",
  active: "bg-blue-soft text-blue",
  rewarded: "bg-green/10 text-green",
};

export default async function ReferralsPage() {
  const shop = await getMyShop();
  if (!shop) return null;

  const supabase = createSupabaseServerClient();
  const { data: referralRows } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_shop_id", shop.id)
    .order("created_at", { ascending: false });

  const referrals = (referralRows ?? []) as Referral[];
  const referredShopIds = referrals.map((r) => r.referred_shop_id);
  const { data: referredShops } = referredShopIds.length
    ? await supabase.from("shops").select("id, name").in("id", referredShopIds)
    : { data: [] as { id: string; name: string }[] };

  const nameById = new Map((referredShops ?? []).map((s) => [s.id, s.name]));

  const activeCount = referrals.filter((r) => r.status === "active").length;
  const rewardedCount = referrals.filter((r) => r.status === "rewarded").length;
  const towardNext = activeCount % REFERRALS_PER_REWARD;
  const rewardsEarned = Math.floor(rewardedCount / REFERRALS_PER_REWARD);
  const bonusExpires = shop.referral_bonus_expires_at ? new Date(shop.referral_bonus_expires_at) : null;
  const bonusActive = bonusExpires && bonusExpires > new Date();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const referralLink = shop.referral_code ? `${appUrl}/create?ref=${shop.referral_code}` : "";

  return (
    <div className="space-y-5 max-w-sm mx-auto pb-8">
      <h1 className="text-lg font-bold text-ink">Refer & earn</h1>

      <div className="bg-white border border-line rounded-lg p-4 space-y-3">
        <p className="text-sm text-ink-soft">
          Share your link with other business owners. For every <b>2 shops</b> that sign up
          and add their first product, you get <b>1 month of Starter free</b> — no limit on
          how many times.
        </p>
        {shop.referral_code && <CopyReferralLink link={referralLink} code={shop.referral_code} />}
      </div>

      {bonusActive && (
        <div className="bg-blue-soft border border-blue/20 rounded-lg p-4 text-sm text-ink">
          Free Starter access active until <b>{bonusExpires!.toLocaleDateString()}</b>.
        </div>
      )}

      <div className="bg-white border border-line rounded-lg p-4 space-y-1">
        <p className="text-sm text-ink-soft">
          Progress to next reward: <b className="text-ink">{towardNext} / {REFERRALS_PER_REWARD}</b> active referrals
        </p>
        {rewardsEarned > 0 && (
          <p className="text-xs text-ink-soft">
            {rewardsEarned} free {rewardsEarned === 1 ? "month" : "months"} earned so far
          </p>
        )}
      </div>

      <div className="space-y-2">
        {referrals.length === 0 ? (
          <p className="text-center text-ink-soft py-10 text-sm">No referrals yet — share your link above.</p>
        ) : (
          referrals.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-line rounded-lg p-3 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-ink">{nameById.get(r.referred_shop_id) ?? "A shop"}</span>
              <span className={`text-xs font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${STATUS_STYLES[r.status]}`}>
                {STATUS_LABEL[r.status]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
