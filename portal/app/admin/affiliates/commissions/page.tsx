"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PRODUCT_LABELS: Record<string, string> = {
  scan_tool:      "Scan Tool",
  portal:         "Client Portal",
  hosting_mgmt:   "Hosting & Mgmt",
  content_ops:    "Content Ops",
  web_dev:        "Web / Mobile Dev",
  ai_integration: "AI Integration",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700",
  approved:  "bg-blue-50 text-blue-700",
  paid:      "bg-green-50 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [status, setStatus]           = useState("pending");
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/affiliates/commissions?status=${status}&per_page=100`)
      .then((r) => r.json())
      .then((d) => setCommissions(d.commissions ?? []))
      .catch(() => setCommissions([]))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id);
    await fetch("/api/admin/affiliates/commissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    setUpdating(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commission queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve commissions before they're paid out.</p>
        </div>
        <div className="flex gap-1 border rounded-lg p-1 bg-slate-50">
          {["pending", "approved", "paid", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                status === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading…</div>
          ) : commissions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-semibold text-slate-700">No {status} commissions</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Affiliate</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Period</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gross</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rate</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Commission</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c: any) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-blue-700 font-bold">{c.affiliateCode}</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{PRODUCT_LABELS[c.product] ?? c.product}</td>
                      <td className="py-3 px-4 text-slate-500">{c.period}</td>
                      <td className="py-3 px-4 text-right text-slate-600">${c.grossAmount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-slate-400">{(c.commissionRate * 100).toFixed(0)}%</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">${c.commissionAmount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {c.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              disabled={updating === c.id}
                              onClick={() => updateStatus(c.id, "approved")}
                              className="text-xs text-blue-600 hover:underline font-medium disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              disabled={updating === c.id}
                              onClick={() => updateStatus(c.id, "cancelled")}
                              className="text-xs text-slate-400 hover:underline font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {c.status === "approved" && (
                          <button
                            disabled={updating === c.id}
                            onClick={() => updateStatus(c.id, "paid")}
                            className="text-xs text-green-700 hover:underline font-medium disabled:opacity-50"
                          >
                            Mark paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
