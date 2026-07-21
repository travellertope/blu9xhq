import type { ShopPlan } from "@/types";

export interface PlanDetails {
  name: string;
  monthlyUsd: number;
  annualUsd: number;
}

export const PLAN_DETAILS: Record<ShopPlan, PlanDetails> = {
  free: { name: "Free", monthlyUsd: 0, annualUsd: 0 },
  starter: { name: "Starter", monthlyUsd: 5, annualUsd: 50 },
  pro: { name: "Pro", monthlyUsd: 15, annualUsd: 150 },
};

const PLAN_ENV_KEY: Partial<Record<ShopPlan, string>> = {
  starter: "STARTER",
  pro: "PRO",
};

export function getPriceId(plan: ShopPlan, billing: "monthly" | "annual"): string | null {
  const key = PLAN_ENV_KEY[plan];
  if (!key) return null;
  const envKey = `STRIPE_PRICE_${key}_${billing.toUpperCase()}`;
  return process.env[envKey] ?? null;
}

export function getPlanFromPriceId(priceId: string): ShopPlan | null {
  for (const plan of Object.keys(PLAN_ENV_KEY) as ShopPlan[]) {
    const key = PLAN_ENV_KEY[plan]!;
    if (
      process.env[`STRIPE_PRICE_${key}_MONTHLY`] === priceId ||
      process.env[`STRIPE_PRICE_${key}_ANNUAL`] === priceId
    ) {
      return plan;
    }
  }
  return null;
}
