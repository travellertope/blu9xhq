"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Shop, ShopPlan } from "@/types";

const PLAN_OPTIONS: ShopPlan[] = ["free", "starter", "pro"];

export default function ShopRow({ shop, ownerEmail }: { shop: Shop; ownerEmail: string }) {
  const router = useRouter();
  const [plan, setPlan] = useState<ShopPlan>(shop.plan);
  const [active, setActive] = useState(shop.active);
  const [saving, setSaving] = useState(false);

  async function update(changes: Partial<{ plan: ShopPlan; active: boolean }>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/shops/${shop.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) throw new Error("Update failed");
      if (changes.plan) setPlan(changes.plan);
      if (changes.active !== undefined) setActive(changes.active);
      router.refresh();
    } catch {
      alert("Couldn't save that change — try again.");
    } finally {
      setSaving(false);
    }
  }

  const bonusActive =
    !!shop.referral_bonus_expires_at && new Date(shop.referral_bonus_expires_at) > new Date();

  return (
    <div className="p-3.5 flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[180px]">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`/${shop.slug}`}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ink hover:underline"
          >
            {shop.name}
          </a>
          {!active && (
            <span className="text-xs font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-coral-soft text-coral">
              Deactivated
            </span>
          )}
          {bonusActive && (
            <span className="text-xs font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 bg-blue-soft text-blue">
              Referral bonus
            </span>
          )}
        </div>
        <p className="text-xs text-ink-soft">
          {ownerEmail} · /{shop.slug} · {new Date(shop.created_at).toLocaleDateString()}
        </p>
      </div>

      <select
        value={plan}
        disabled={saving}
        onChange={(e) => update({ plan: e.target.value as ShopPlan })}
        className="text-sm border border-line rounded-md px-2 py-1.5 bg-white text-ink disabled:opacity-50"
      >
        {PLAN_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p[0].toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={saving}
        onClick={() => {
          if (active && !window.confirm(`Deactivate ${shop.name}? Its storefront stops being publicly visible.`)) {
            return;
          }
          update({ active: !active });
        }}
        className={`text-xs font-semibold rounded-md px-3 py-1.5 border disabled:opacity-50 ${
          active
            ? "border-line text-ink-soft hover:bg-bg-soft"
            : "border-blue text-blue hover:bg-blue-soft"
        }`}
      >
        {active ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}
