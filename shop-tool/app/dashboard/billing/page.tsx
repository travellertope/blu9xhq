import { getMyShop } from "@/lib/auth";
import { PLAN_DETAILS } from "@/lib/stripe-products";
import { PAYSTACK_PLAN_DETAILS } from "@/lib/paystack-products";
import { getPlanLimits } from "@/lib/planLimits";
import {
  CurrentPlanBadge,
  ManageBillingButton,
  PaystackCancelButton,
  UpgradeButton,
} from "@/components/dashboard/billing-actions";

const TIERS: { plan: "starter" | "pro"; features: string[] }[] = [
  {
    plan: "starter",
    features: [
      `${getPlanLimits("starter").maxProducts} products`,
      "Custom accent color & fonts",
      "Boutique & Market themes",
      "Custom domain",
      "Remove BluuShop branding",
    ],
  },
  {
    plan: "pro",
    features: ["Unlimited products", "Everything in Starter", "Priority support"],
  },
];

export default async function BillingPage() {
  const shop = await getMyShop();
  if (!shop) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink">Billing</h1>
        <CurrentPlanBadge plan={shop.plan} />
      </div>

      {shop.plan !== "free" && (
        <div className="bg-white border border-line rounded-lg p-4">
          {shop.billing_provider === "paystack" ? (
            <>
              <p className="text-sm text-ink-soft mb-2">
                Billed via Paystack. Cancel here to move back to the Free plan.
              </p>
              <PaystackCancelButton />
            </>
          ) : (
            <>
              <p className="text-sm text-ink-soft mb-2">
                Manage your subscription, payment method, and invoices in Stripe&apos;s billing portal.
              </p>
              <ManageBillingButton />
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {TIERS.map(({ plan, features }) => {
          const usd = PLAN_DETAILS[plan];
          const ngn = PAYSTACK_PLAN_DETAILS[plan];
          const isCurrent = shop.plan === plan;
          const isDowngrade = shop.plan === "pro" && plan === "starter";
          return (
            <div key={plan} className="bg-white border border-line rounded-lg p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-bold text-ink">{usd.name}</h2>
                <p className="text-sm text-ink-soft text-right">
                  <span className="text-lg font-extrabold text-ink">${usd.monthlyUsd}</span>/mo
                  <br />
                  <span className="text-xs">or ₦{ngn.monthlyNgn.toLocaleString()}/mo</span>
                </p>
              </div>
              <ul className="text-sm text-ink-soft space-y-1">
                {features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              {isCurrent ? (
                <p className="text-center text-xs font-semibold text-ink-soft py-2">Current plan</p>
              ) : isDowngrade ? (
                shop.billing_provider === "paystack" ? (
                  <PaystackCancelButton />
                ) : (
                  <ManageBillingButton />
                )
              ) : (
                // Stacked, not side by side — "Pay with card" and "Pay with
                // Paystack" need to read as two different payment methods,
                // not just two numbers, and a 2-column row gets tight on
                // narrow phones once both labels are legible.
                <div className="space-y-2">
                  <UpgradeButton plan={plan} provider="stripe" label={`Pay with card — $${usd.monthlyUsd}/mo`} />
                  <UpgradeButton
                    plan={plan}
                    provider="paystack"
                    label={`Pay with Paystack — ₦${ngn.monthlyNgn.toLocaleString()}/mo`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
