import { createSupabaseAdminClient } from "@/lib/supabase/server";

// Skips 0/O/1/I so a shared code never gets misread when read aloud or typed.
const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const REFERRALS_PER_REWARD = 2;
const BONUS_DAYS_PER_REWARD = 30;

function randomReferralCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += REFERRAL_CODE_ALPHABET[Math.floor(Math.random() * REFERRAL_CODE_ALPHABET.length)];
  }
  return code;
}

/**
 * Assigns a unique referral code to a newly created shop, retrying on the
 * rare collision the same way shop slugs do (see lib/onboarding.ts).
 */
export async function assignReferralCode(shopId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase
      .from("shops")
      .update({ referral_code: randomReferralCode() })
      .eq("id", shopId);
    if (!error) return;
    if (error.code !== "23505") return; // not a collision — no point retrying
  }
}

/** Looks up the shop a raw ?ref= code points at, if any. */
export async function resolveReferrerShopId(code: string | null | undefined): Promise<string | null> {
  if (!code?.trim()) return null;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("shops")
    .select("id")
    .eq("referral_code", code.trim().toUpperCase())
    .maybeSingle();
  return data?.id ?? null;
}

/** Records that `referredShopId` signed up via `referrerShopId`'s link. */
export async function recordReferral(referrerShopId: string, referredShopId: string): Promise<void> {
  if (referrerShopId === referredShopId) return; // can't refer yourself
  const supabase = createSupabaseAdminClient();
  await supabase.from("referrals").insert({
    referrer_shop_id: referrerShopId,
    referred_shop_id: referredShopId,
    status: "pending",
  });
}

/**
 * Tallies a shop's 'active' (not yet 'rewarded') referrals and, if it's
 * crossed another REFERRALS_PER_REWARD threshold, credits a free month of
 * Starter-level access per threshold crossed. No-ops for shops on a paid
 * plan — the bonus exists to nudge free-tier owners toward Starter, not to
 * discount an existing subscription.
 *
 * Called from two places: right after a referral activates (the common
 * case), and from the Stripe/Paystack webhook handlers whenever a shop's
 * plan drops back to 'free' — a referrer who accrued active referrals
 * while paying wouldn't otherwise get counted until their next referral
 * activates, which could be a long wait or never.
 */
export async function checkAndAwardReferralReward(shopId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data: referrer } = await supabase
    .from("shops")
    .select("id, plan, referral_bonus_expires_at")
    .eq("id", shopId)
    .maybeSingle();
  if (!referrer || referrer.plan !== "free") return;

  const { data: eligible } = await supabase
    .from("referrals")
    .select("id, activated_at")
    .eq("referrer_shop_id", referrer.id)
    .eq("status", "active")
    .order("activated_at", { ascending: true });

  const rows = eligible ?? [];
  const rewardCount = Math.floor(rows.length / REFERRALS_PER_REWARD);
  if (rewardCount < 1) return;

  const toReward = rows.slice(0, rewardCount * REFERRALS_PER_REWARD).map((r) => r.id);
  const currentExpiry = referrer.referral_bonus_expires_at ? new Date(referrer.referral_bonus_expires_at) : null;
  const base = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = new Date(base.getTime() + rewardCount * BONUS_DAYS_PER_REWARD * 24 * 60 * 60 * 1000);

  await supabase.from("referrals").update({ status: "rewarded" }).in("id", toReward);
  await supabase.from("shops").update({ referral_bonus_expires_at: newExpiry.toISOString() }).eq("id", referrer.id);
}

/**
 * Called when a shop creates its first product — the bar for "active"
 * business, not just a signup. Marks this shop's referral (if any) as
 * active, then runs the reward tally for its referrer.
 */
export async function activateReferralAndMaybeReward(referredShopId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { data: referral } = await supabase
    .from("referrals")
    .select("id, referrer_shop_id")
    .eq("referred_shop_id", referredShopId)
    .eq("status", "pending")
    .maybeSingle();
  if (!referral) return;

  await supabase
    .from("referrals")
    .update({ status: "active", activated_at: new Date().toISOString() })
    .eq("id", referral.id);

  await checkAndAwardReferralReward(referral.referrer_shop_id);
}
