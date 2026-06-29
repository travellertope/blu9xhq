import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
    _stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  }
  return _stripe;
}

export const TIER_PRICE_IDS: Record<"monitor" | "monitor_pro", string | undefined> = {
  monitor: process.env.STRIPE_MONITOR_PRICE_ID,
  monitor_pro: process.env.STRIPE_MONITOR_PRO_PRICE_ID,
};

export const TIER_SCAN_LIMITS: Record<"free" | "monitor" | "monitor_pro", number> = {
  free: 3,
  monitor: Infinity,
  monitor_pro: Infinity,
};

export const TIER_COMPETITOR_LIMITS: Record<"free" | "monitor" | "monitor_pro", number> = {
  free: 0,
  monitor: 3,
  monitor_pro: 10,
};

export const TIER_SCHEDULE_FREQUENCIES: Record<"free" | "monitor" | "monitor_pro", Array<"weekly" | "daily">> = {
  free: [],
  monitor: ["weekly"],
  monitor_pro: ["weekly", "daily"],
};
