"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const PRODUCT_LABELS: Record<string, string> = {
  scan_tool:      "Scan Tool",
  portal:         "Client Portal",
  hosting_mgmt:   "Hosting & Mgmt",
  content_ops:    "Content Ops",
  web_dev:        "Web / Mobile Dev",
  ai_integration: "AI Integration",
};

const COMMISSION_STATUS_COLOR: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700",
  approved:  "bg-blue-50 text-blue-700",
  paid:      "bg-green-50 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const PAYOUT_STATUS_COLOR: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  completed:  "bg-green-50 text-green-700",
  failed:     "bg-red-50 text-red-700",
};

export default function AffiliateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetch(`/api/admin/affiliates/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(status: string) {
    setSaving(true);
    await fetch(`/api/admin/affiliates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    const res = await fetch(`/api/admin/affiliates/${id}`).then((r) => r.json());
    setData(res);
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-400">Loading…</div>;
  }
  if (!data?.affiliate) {
    return <div className="py-12 text-center text-sm text-slate-500">Affiliate not found.</div>;
  }

  const { affiliate, stats, commissions, payouts } = data;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/affiliates" className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{affiliate.name}</h1>
          <p className="text-sm text-slate-500">{affiliate.email}</p>
        </div>
      </div>

      {/* Profile + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Affiliate code", value: affiliate.affiliateCode, mono: true },
              { label: "Status",         value: affiliate.status },
              { label: "Payout method",  value: affiliate.payoutMethod || "—" },
              { label: "Website",        value: affiliate.website || "—" },
              { label: "Agreed to terms", value: affiliate.agreedAt ? new Date(affiliate.agreedAt).toLocaleDateString("en-GB") : "—" },
              { label: "Registered",     value: affiliate.registered ? new Date(affiliate.registered).toLocaleDateString("en-GB") : "—" },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className={`text-sm font-medium text-slate-800 ${mono ? "font-mono font-bold text-blue-700" : ""}`}>{value}</span>
              </div>
            ))}

            {/* Status controls */}
            <div className="pt-2 space-y-2">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Change status</p>
              <div className="flex gap-2">
                <button
                  disabled={saving || affiliate.status === "active"}
                  onClick={() => updateStatus("active")}
                  className="flex-1 text-xs py-1.5 border rounded-md font-medium text-green-700 border-green-200 hover:bg-green-50 disabled:opacity-40 transition-colors"
                >
                  Activate
                </button>
                <button
                  disabled={saving || affiliate.status === "suspended"}
                  onClick={() => updateStatus("suspended")}
                  className="flex-1 text-xs py-1.5 border rounded-md font-medium text-red-700 border-red-200 hover:bg-red-50 disabled:opacity-40 transition-colors"
                >
                  Suspend
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total clicks",      value: stats.totalClicks,          color: "text-slate-900" },
            { label: "Conversions",       value: stats.totalConversions,      color: "text-slate-900" },
            { label: "All-time earnings", value: `$${stats.allTimeEarnings.toFixed(2)}`, color: "text-slate-900" },
            { label: "Pending payout",    value: `$${stats.pendingPayout.toFixed(2)}`,   color: "text-amber-600" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Commission history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Commission history</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No commissions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Period</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Gross</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Commission</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c: any) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-400 text-xs">
                        {new Date(c.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{PRODUCT_LABELS[c.product] ?? c.product}</td>
                      <td className="py-3 px-3 text-slate-500">{c.period}</td>
                      <td className="py-3 px-3 text-right text-slate-600">${c.grossAmount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">${c.commissionAmount.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COMMISSION_STATUS_COLOR[c.status] ?? ""}`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout history */}
      {payouts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Payout history</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Method</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-400 text-xs">
                        {new Date(p.initiatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">${p.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-500 capitalize">{p.method}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PAYOUT_STATUS_COLOR[p.status] ?? ""}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs font-mono">{p.transferRef ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
