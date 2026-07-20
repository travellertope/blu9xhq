import { getMyShop } from "@/lib/auth";
import { PLAN_DETAILS } from "@/lib/stripe-products";
import { getPlanLimits } from "@/lib/planLimits";
import { CurrentPlanBadge, ManageBillingButton, UpgradeButton } from "@/components/dashboard/billing-actions";

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
          <p className="text-sm text-ink-soft mb-2">
            Manage your subscription, payment method, and invoices in Stripe&apos;s billing portal.
          </p>
          <ManageBillingButton />
        </div>
      )}

      <div className="space-y-3">
        {TIERS.map(({ plan, features }) => {
          const details = PLAN_DETAILS[plan];
          const isCurrent = shop.plan === plan;
          const isDowngrade = shop.plan === "pro" && plan === "starter";
          return (
            <div key={plan} className="bg-white border border-line rounded-lg p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-bold text-ink">{details.name}</h2>
                <p className="text-sm text-ink-soft">
                  <span className="text-lg font-extrabold text-ink">${details.monthlyUsd}</span>/mo
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
                <ManageBillingButton />
              ) : (
                <UpgradeButton plan={plan} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
