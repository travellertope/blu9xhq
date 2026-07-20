import type { ShopThemeId } from "@/lib/theme";
import type { ShopPlan } from "@/types";

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
    themes: ["minimal"],
    customBranding: false,
    customDomain: false,
    removeBranding: false,
  },
  starter: {
    maxProducts: 100,
    themes: ["minimal", "boutique", "market"],
    customBranding: true,
    customDomain: true,
    removeBranding: true,
  },
  pro: {
    maxProducts: Infinity,
    themes: ["minimal", "boutique", "market"],
    customBranding: true,
    customDomain: true,
    removeBranding: true,
  },
};

export function getPlanLimits(plan: ShopPlan | undefined): PlanLimits {
  return PLAN_LIMITS[plan ?? "free"];
}
