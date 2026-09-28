"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TenantPlan } from "@/lib/planLimits";

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
  plan_override: TenantPlan | null;
  plan_override_until: string | null;
  status: string;
}

const PLANS: TenantPlan[] = ["free", "starter", "pro", "agency"];

const PLAN_COLOURS: Record<TenantPlan, string> = {
  free:    "bg-slate-100 text-slate-600",
  starter: "bg-blue-100 text-blue-700",
  pro:     "bg-purple-100 text-purple-700",
  agency:  "bg-amber-100 text-amber-700",
};

function PlanBadge({ plan }: { plan: TenantPlan }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${PLAN_COLOURS[plan]}`}>
      {plan}
    </span>
  );
}

function OverrideModal({
  tenant,
  onClose,
  onSaved,
}: {
  tenant: TenantRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const hasOverride = !!tenant.plan_override;
  const [plan, setPlan] = useState<TenantPlan>(tenant.plan_override ?? "pro");
  const [until, setUntil] = useState<string>(
    tenant.plan_override_until
      ? tenant.plan_override_until.slice(0, 10)
      : new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenant.id}/plan-override`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, until: until || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success(`Override set — ${tenant.name} is now on ${plan}`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function clear() {
    setSaving(true);
    try {
      const res = await fetch(`/api/superadmin/tenants/${tenant.id}/plan-override`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success(`Override cleared — ${tenant.name} reverts to subscription plan`);
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Plan override — {tenant.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Subscription plan: <strong>{tenant.plan}</strong>
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Override plan</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as TenantPlan)}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Expires on (leave blank = permanent)</label>
          <input
            type="date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={save}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            {saving ? "Saving…" : "Set override"}
          </button>
          {hasOverride && (
            <button
              onClick={clear}
              disabled={saving}
              className="flex-1 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Clear override
            </button>
          )}
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperadminTenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TenantRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/tenants");
      if (!res.ok) throw new Error("Forbidden or failed");
      setTenants(await res.json());
    } catch {
      toast.error("Could not load tenants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tenant plan overrides</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manually grant a tenant a paid plan for a fixed period. Expires automatically — no webhook needed.
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wide">
              <th className="pb-2 font-medium">Tenant</th>
              <th className="pb-2 font-medium">Plan</th>
              <th className="pb-2 font-medium">Override</th>
              <th className="pb-2 font-medium">Expires</th>
              <th className="pb-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((t) => {
              const overrideActive =
                t.plan_override &&
                (!t.plan_override_until || new Date(t.plan_override_until) > new Date());
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-slate-800">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.slug}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <PlanBadge plan={t.plan} />
                  </td>
                  <td className="py-3 pr-4">
                    {overrideActive ? (
                      <PlanBadge plan={t.plan_override!} />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-slate-500">
                    {t.plan_override_until
                      ? new Date(t.plan_override_until).toLocaleDateString()
                      : t.plan_override
                      ? "Permanent"
                      : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setEditing(t)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
                    >
                      {t.plan_override ? "Edit override" : "Set override"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {editing && (
        <OverrideModal
          tenant={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
