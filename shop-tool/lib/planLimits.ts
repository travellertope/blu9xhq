import type { ShopThemeId } from "@/lib/theme";
import type { Shop, ShopPlan } from "@/types";

export interface PlanLimits {
  maxProducts: number; // Infinity = unlimited
  themes: ShopThemeId[]; // themes the plan can choose from
  customBranding: boolean; // custom accent color / font pairing
  customDomain: boolean;
  removeBranding: boolean; // hides "Powered by BluuShop"
}

export const PLAN_LIMITS: Record<ShopPlan, PlanLimits> = {
  free: {
    maxProducts: 20,
    themes: ["minimal", "list"],
    customBranding: false,
    customDomain: false,
    removeBranding: false,
  },
  starter: {
    maxProducts: 100,
    themes: ["minimal", "list", "boutique", "market", "gallery", "studio"],
    customBranding: true,
    customDomain: true,
    removeBranding: true,
  },
  pro: {
    maxProducts: Infinity,
    themes: ["minimal", "list", "boutique", "market", "gallery", "studio"],
    customBranding: true,
    customDomain: true,
    removeBranding: true,
  },
};

export function getPlanLimits(plan: ShopPlan | undefined): PlanLimits {
  return PLAN_LIMITS[plan ?? "free"];
}

/**
 * A free-plan shop with an unexpired referral bonus (see lib/referral.ts)
 * gets Starter-level feature gating without its `plan` column actually
 * changing — that column stays the source of truth for what's actually
 * billed. Paid plans are never affected by this.
 */
export function getEffectivePlan(shop: Pick<Shop, "plan" | "referral_bonus_expires_at">): ShopPlan {
  if (
    shop.plan === "free" &&
    shop.referral_bonus_expires_at &&
    new Date(shop.referral_bonus_expires_at) > new Date()
  ) {
    return "starter";
  }
  return shop.plan;
}
