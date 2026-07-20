"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ShopPlan } from "@/types";

export function UpgradeButton({ plan }: { plan: "starter" | "pro" }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
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
      {loading ? "Redirecting…" : "Upgrade"}
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
