"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Building2, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS, type TenantPlan } from "@/lib/planLimits";
import { PLAN_DETAILS } from "@/lib/stripe-products";
import { PAYSTACK_PLAN_DETAILS, type PaidPlan } from "@/lib/paystack-products";

interface Props {
  plan: TenantPlan;
  clientCount: number;
  teamCount: number;
  hasStripeCustomer: boolean;
  billingProvider: string | null;
  showPaystack: boolean;
}

const PLAN_ORDER: TenantPlan[] = ["free", "starter", "pro", "agency"];

const PLAN_COLOR: Record<TenantPlan, string> = {
  free:    "bg-slate-100 text-slate-700",
  starter: "bg-blue-100 text-blue-700",
  pro:     "bg-violet-100 text-violet-700",
  agency:  "bg-emerald-100 text-emerald-700",
};

function UsageBar({ used, max, label }: { used: number; max: number; label: string }) {
  const pct = max === Infinity ? 0 : Math.min((used / max) * 100, 100);
  const over = max !== Infinity && used >= max;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className={over ? "text-red-600 font-semibold" : ""}>
          {used} / {max === Infinity ? "∞" : max}
        </span>
      </div>
      {max !== Infinity && (
        <div className="h-1.5 rounded-full bg-slate-100">
          <div
            className={cn("h-1.5 rounded-full transition-all", over ? "bg-red-500" : "bg-blue-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function BillingClient({
  plan,
  clientCount,
  teamCount,
  hasStripeCustomer,
  billingProvider,
  showPaystack,
}: Props) {
  const searchParams  = useSearchParams();
  const justUpgraded  = searchParams.get("upgraded") === "1";
  // Paystack is monthly-only (annual/discounted billing stays a Stripe/USD
  // option), so a Nigerian visitor never sees the annual toggle.
  const [billing, setBilling]   = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading]   = useState<TenantPlan | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const limits = PLAN_LIMITS[plan];

  async function upgrade(targetPlan: TenantPlan) {
    if (targetPlan === "free") return;
    setLoading(targetPlan);
    try {
      const endpoint = showPaystack ? "/api/billing/paystack/checkout" : "/api/billing/checkout";
      const res  = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan, billing }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Couldn't start checkout");
      window.location.href = data.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("free"); // borrow free as a "busy" sentinel
    try {
      const res  = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(null);
    }
  }

  async function cancelPaystack() {
    if (!window.confirm("Cancel your Paystack subscription? You'll move to the Free plan.")) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/billing/paystack/cancel", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't cancel subscription");
      alert("Subscription cancelled. This can take a minute to reflect here.");
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCancelling(false);
    }
  }

  const planIndex = PLAN_ORDER.indexOf(plan);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing & Plan</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your subscription and usage.</p>
        </div>
        {billingProvider === "paystack" ? (
          <Button variant="outline" onClick={cancelPaystack} disabled={cancelling}>
            {cancelling ? "Cancelling…" : "Cancel subscription"}
          </Button>
        ) : (
          hasStripeCustomer && (
            <Button variant="outline" onClick={openPortal} disabled={loading !== null}>
              Manage billing
            </Button>
          )
        )}
      </div>

      {justUpgraded && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Plan upgraded successfully! Your new limits are now active.
        </div>
      )}

      {/* Current plan + usage */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Current plan</span>
            <Badge className={PLAN_COLOR[plan]}>{PLAN_DETAILS[plan].name}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <UsageBar used={clientCount} max={limits.maxClients}     label="Clients" />
            <UsageBar used={teamCount}   max={limits.maxTeamMembers}  label="Team members" />
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Sequences</span>
                <span>{limits.sequences ? "Enabled" : "Not included"}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> AI mood analysis</span>
                <span>{limits.aiMoodAnalysis ? "Enabled" : "Not included"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing cycle toggle — Paystack is monthly-only, so Nigerian
          visitors never see the annual option (annual/discounted billing
          stays a Stripe/USD option for diaspora users). */}
      {!showPaystack && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Plans</span>
          <div className="flex items-center rounded-lg border bg-white p-0.5 gap-0.5">
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                  billing === b ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {b === "monthly" ? "Monthly" : "Annual (2 months free)"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_ORDER.map((p, i) => {
          const details = PLAN_DETAILS[p];
          const lims    = PLAN_LIMITS[p];
          const isCurrent = p === plan;
          const isUpgrade = i > planIndex;
          const price = billing === "monthly" ? details.monthlyUsd : Math.round(details.annualUsd / 12);

          return (
            <Card
              key={p}
              className={cn(
                "relative flex flex-col",
                isCurrent && "ring-2 ring-blue-500"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Current
                  </span>
                </div>
              )}
              <CardContent className="p-4 flex flex-col flex-1 gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{details.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{details.description}</p>
                </div>

                <div>
                  {details.monthlyUsd === 0 ? (
                    <span className="text-2xl font-bold text-slate-900">Free</span>
                  ) : showPaystack ? (
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        ₦{PAYSTACK_PLAN_DETAILS[p as PaidPlan].monthlyNgn.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 mb-0.5">/mo</span>
                    </div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-slate-900">${price}</span>
                      <span className="text-sm text-slate-500 mb-0.5">/mo</span>
                    </div>
                  )}
                  {!showPaystack && billing === "annual" && details.annualUsd > 0 && (
                    <p className="text-xs text-emerald-600 mt-0.5">${details.annualUsd}/year</p>
                  )}
                </div>

                <ul className="space-y-1.5 flex-1">
                  {[
                    { icon: Building2, text: lims.maxClients === Infinity ? "Unlimited clients" : `${lims.maxClients} clients` },
                    { icon: Users,     text: lims.maxTeamMembers === Infinity ? "Unlimited team members" : `${lims.maxTeamMembers} team member${lims.maxTeamMembers === 1 ? "" : "s"}` },
                    { icon: HardDrive, text: lims.fileStorageMB === Infinity ? "Unlimited storage" : `${lims.fileStorageMB >= 1000 ? lims.fileStorageMB / 1000 + " GB" : lims.fileStorageMB + " MB"} storage` },
                    { icon: CheckCircle2, text: "Sequences", disabled: !lims.sequences },
                    { icon: CheckCircle2, text: "AI mood analysis", disabled: !lims.aiMoodAnalysis },
                    { icon: CheckCircle2, text: "White-label branding", disabled: !lims.whiteLabel },
                  ].map(({ icon: Icon, text, disabled }) => (
                    <li key={text} className={cn("flex items-center gap-1.5 text-xs", disabled ? "text-slate-300 line-through" : "text-slate-600")}>
                      <Icon className="h-3 w-3 shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" size="sm" disabled className="w-full">
                    Current plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => upgrade(p)}
                    disabled={loading !== null}
                  >
                    {loading === p ? "Redirecting…" : showPaystack ? "Pay with Paystack" : "Upgrade"}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full text-slate-400" disabled>
                    Downgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
