import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUser } from "@/lib/redis";
import { TIER_SCAN_LIMITS } from "@/lib/stripe";
import { UpgradeButton } from "./upgrade-button";
import { ManageBillingButton } from "./manage-billing-button";

const TIER_LABELS = {
  free: "Free",
  monitor: "Monitor",
  monitor_pro: "Monitor Pro",
} as const;

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email || "";
  const user = await getUser(email);

  const tier = user?.tier || "free";
  const limit = TIER_SCAN_LIMITS[tier];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-ink">Billing</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <p className="text-xs text-gray-500">Current plan</p>
          <p className="text-xl font-bold text-ink">{TIER_LABELS[tier]}</p>
          {user?.tierExpiresAt && (
            <p className="text-xs text-gray-500 mt-1">
              Renews {new Date(user.tierExpiresAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500">Scans this month</p>
          <p className="text-sm font-medium text-ink">
            {user?.scansThisMonth ?? 0} {limit === Infinity ? "" : `/ ${limit}`}
          </p>
        </div>

        {tier === "free" ? (
          <div className="flex gap-3">
            <UpgradeButton plan="monitor" label="Upgrade to Monitor — $19/mo" />
            <UpgradeButton plan="monitor_pro" label="Upgrade to Monitor Pro — $39/mo" />
          </div>
        ) : (
          <ManageBillingButton />
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-ink mb-3">Plans</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <PlanCard
            name="Free"
            price="$0"
            features={["3 scans/month", "Summary results", "Email-gated full report"]}
          />
          <PlanCard
            name="Monitor"
            price="$19/mo"
            features={[
              "Unlimited scans",
              "Weekly auto re-scans",
              "Trend charts",
              "Score alerts",
              "Track up to 3 competitors",
            ]}
          />
          <PlanCard
            name="Monitor Pro"
            price="$39/mo"
            features={[
              "Everything in Monitor",
              "Daily re-scans",
              "Track up to 10 competitors",
              "Priority support",
              "API access",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function PlanCard({ name, price, features }: { name: string; price: string; features: string[] }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="font-bold text-ink">{name}</p>
      <p className="text-lg font-extrabold text-ink mb-2">{price}</p>
      <ul className="text-gray-600 space-y-1">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
    </div>
  );
}
