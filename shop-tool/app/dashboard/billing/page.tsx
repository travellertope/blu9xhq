import { headers } from "next/headers";
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

  // Vercel adds this header at the edge on every request — no geolocation
  // API or extra dependency needed. Our Paystack plans are NGN-only, so
  // only visitors physically in Nigeria right now see it; everyone else
  // (including Nigerians currently abroad — the IP reflects where they are,
  // not their nationality) sees Stripe/USD. Only one is ever shown.
  const country = headers().get("x-vercel-ip-country");
  const showPaystack = country === "NG";

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
                <p className="text-sm text-ink-soft">
                  {showPaystack ? (
                    <>
                      <span className="text-lg font-extrabold text-ink">
                        ₦{ngn.monthlyNgn.toLocaleString()}
                      </span>
                      /mo
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-extrabold text-ink">${usd.monthlyUsd}</span>/mo
                    </>
                  )}
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
              ) : showPaystack ? (
                <UpgradeButton
                  plan={plan}
                  provider="paystack"
                  label={`Pay with Paystack — ₦${ngn.monthlyNgn.toLocaleString()}/mo`}
                />
              ) : (
                <UpgradeButton plan={plan} provider="stripe" label={`Pay with card — $${usd.monthlyUsd}/mo`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
