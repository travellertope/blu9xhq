"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ShopPlan } from "@/types";

export function UpgradeButton({
  plan,
  provider,
  label,
}: {
  plan: "starter" | "pro";
  provider: "stripe" | "paystack";
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const endpoint = provider === "paystack" ? "/api/billing/paystack/checkout" : "/api/billing/checkout";

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing: "monthly" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) throw new Error(body.error ?? "Couldn't start checkout");
      window.location.href = body.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <Button size="sm" className="w-full" onClick={handleUpgrade} disabled={loading}>
      {loading ? "Redirecting…" : label}
    </Button>
  );
}

export function PaystackCancelButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!window.confirm("Cancel your Paystack subscription? You'll move to the Free plan.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/paystack/cancel", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Couldn't cancel subscription");
      alert("Subscription cancelled. This can take a minute to reflect here.");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" className="w-full" onClick={handleCancel} disabled={loading}>
      {loading ? "Cancelling…" : "Cancel subscription"}
    </Button>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleManage() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.url) throw new Error(body.error ?? "Couldn't open billing portal");
      window.location.href = body.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" className="w-full" onClick={handleManage} disabled={loading}>
      {loading ? "Opening…" : "Manage billing"}
    </Button>
  );
}

export function CurrentPlanBadge({ plan }: { plan: ShopPlan }) {
  const label = plan === "free" ? "Free" : plan === "starter" ? "Starter" : "Pro";
  return (
    <span className="text-xs font-bold uppercase tracking-wide text-blue bg-blue-soft rounded-full px-2.5 py-1">
      {label} plan
    </span>
  );
}
