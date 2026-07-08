"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-700",
  processing: "bg-blue-50 text-blue-700",
  completed:  "bg-green-50 text-green-700",
  failed:     "bg-red-50 text-red-700",
};

export default function AdminPayoutsPage() {
  const [payouts, setPayouts]   = useState<any[]>([]);
  const [status, setStatus]     = useState("pending");
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<any | null>(null);
  const [transferRef, setRef]   = useState("");
  const [saving, setSaving]     = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/affiliates/payouts?status=${status}`)
      .then((r) => r.json())
      .then((d) => setPayouts(d.payouts ?? []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function markProcessing(id: string) {
    await fetch("/api/admin/affiliates/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "processing" }),
    });
    load();
  }

  async function markCompleted() {
    if (!modal) return;
    setSaving(true);
    await fetch("/api/admin/affiliates/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: modal.id, status: "completed", transferRef }),
    });
    setSaving(false);
    setModal(null);
    setRef("");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payout queue</h1>
          <p className="text-sm text-slate-500 mt-0.5">Process affiliate payout requests.</p>
        </div>
        <div className="flex gap-1 border rounded-lg p-1 bg-slate-50">
          {["pending", "processing", "completed", "failed"].map((s) => (
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
          ) : payouts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-semibold text-slate-700">No {status} payouts</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Affiliate</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requested</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ref</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p: any) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs text-blue-700 font-bold">{p.affiliateCode}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">${p.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-500 capitalize">{p.method}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(p.initiatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs font-mono">{p.transferRef ?? "—"}</td>
                      <td className="py-3 px-4">
                        {p.status === "pending" && (
                          <button
                            onClick={() => markProcessing(p.id)}
                            className="text-xs text-blue-600 hover:underline font-medium"
                          >
                            Start processing
                          </button>
                        )}
                        {p.status === "processing" && (
                          <button
                            onClick={() => { setModal(p); setRef(""); }}
                            className="text-xs text-green-700 hover:underline font-medium"
                          >
                            Mark completed
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

      {/* Complete payout modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Complete payout</h2>
            <p className="text-sm text-slate-600">
              Marking <strong>${modal.totalAmount.toFixed(2)}</strong> payout to{" "}
              <strong>{modal.affiliateCode}</strong> as completed.
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Transfer reference</label>
              <input
                value={transferRef}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. TXN-12345 or blank"
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={markCompleted}
                disabled={saving}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {saving ? "Saving…" : "Confirm completed"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
