import type { TenantPlan } from "@/lib/planLimits";

export interface PlanDetails {
  name: string;
  description: string;
  monthlyUsd: number;
  annualUsd: number;
}

export const PLAN_DETAILS: Record<TenantPlan, PlanDetails> = {
  free:    { name: "Free",    description: "Try BluuCRM with up to 5 clients",       monthlyUsd: 0,  annualUsd: 0 },
  starter: { name: "Starter", description: "For freelancers and small agencies",     monthlyUsd: 14, annualUsd: 140 },
  pro:     { name: "Pro",     description: "AI insights + more team members",        monthlyUsd: 39, annualUsd: 390 },
  agency:  { name: "Agency",  description: "Unlimited clients, team, and storage",   monthlyUsd: 99, annualUsd: 990 },
};

const PLAN_ENV_KEY: Partial<Record<TenantPlan, string>> = {
  starter: "STARTER",
  pro:     "PRO",
  agency:  "AGENCY",
};

export function getPriceId(plan: TenantPlan, billing: "monthly" | "annual"): string | null {
  const key = PLAN_ENV_KEY[plan];
  if (!key) return null;
  const envKey = `STRIPE_PRICE_${key}_${billing.toUpperCase()}`;
  return process.env[envKey] ?? null;
}

export function getPlanFromPriceId(priceId: string): TenantPlan | null {
  for (const plan of Object.keys(PLAN_ENV_KEY) as TenantPlan[]) {
    const key = PLAN_ENV_KEY[plan]!;
    if (
      process.env[`STRIPE_PRICE_${key}_MONTHLY`] === priceId ||
      process.env[`STRIPE_PRICE_${key}_ANNUAL`]  === priceId
    ) {
      return plan;
    }
  }
  return null;
}
