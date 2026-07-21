export type PaidPlan = "starter" | "pro" | "agency";

export interface PaystackPlanDetails {
  name: string;
  monthlyNgn: number;
}

export const PAYSTACK_PLAN_DETAILS: Record<PaidPlan, PaystackPlanDetails> = {
  starter: { name: "Starter", monthlyNgn: 17000 },
  pro: { name: "Pro", monthlyNgn: 47000 },
  agency: { name: "Agency", monthlyNgn: 117000 },
};

const PLAN_ENV_KEY: Record<PaidPlan, string> = {
  starter: "STARTER",
  pro: "PRO",
  agency: "AGENCY",
};

/** Paystack's recurring-billing unit is a Plan (created once, in the
 *  dashboard or via the API), referenced here by its plan_code — mirrors
 *  how lib/stripe-products.ts reads Stripe price IDs from env vars.
 *  Monthly-only: annual billing stays a Stripe/USD option (Naira pricing
 *  here targets Nigerian tenants who pay monthly). */
export function getPaystackPlanCode(plan: PaidPlan): string | null {
  return process.env[`PAYSTACK_PLAN_${PLAN_ENV_KEY[plan]}`] ?? null;
}

export function getPlanFromPaystackPlanCode(planCode: string): PaidPlan | null {
  for (const plan of Object.keys(PLAN_ENV_KEY) as PaidPlan[]) {
    if (process.env[`PAYSTACK_PLAN_${PLAN_ENV_KEY[plan]}`] === planCode) return plan;
  }
  return null;
}
