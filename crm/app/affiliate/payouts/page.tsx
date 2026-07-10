"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AffiliatePayout } from "@/types";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending:    "secondary",
  processing: "default",
  completed:  "default",
  failed:     "destructive",
};

const PAYOUT_MIN = 50;

export default function PayoutsPage() {
  const [payouts, setPayouts]     = useState<AffiliatePayout[]>([]);
  const [pending, setPending]     = useState(0);
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage]     = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch("/api/affiliates/commissions?summary=1")
      .then((r) => r.json())
      .then((d) => { setPending(d.pendingPayout ?? 0); })
      .catch(() => undefined);

    fetch("/api/affiliates/payout")
      .then((r) => r.json())
      .then((d) => { setPayouts(d.payouts ?? []); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function requestPayout() {
    setRequesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/affiliates/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((body as any).error ?? "Payout request failed.");
      setMessage({ type: "success", text: "Payout requested! We'll process it within 3 business days." });
      setPending(0);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setRequesting(false);
    }
  }

  const canRequestPayout = pending >= PAYOUT_MIN;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
        <p className="text-sm text-slate-500 mt-1">Your payout history and balance. Minimum payout is $50.</p>
      </div>

      {/* Balance card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Available for payout</p>
              <p className="text-4xl font-bold text-slate-900 mt-1">${pending.toFixed(2)}</p>
              {!canRequestPayout && pending > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ${(PAYOUT_MIN - pending).toFixed(2)} more needed to reach the $50 minimum
                </p>
              )}
              {pending === 0 && (
                <p className="text-xs text-slate-400 mt-1">Earn commissions to build your balance</p>
              )}
            </div>
            <button
              onClick={requestPayout}
              disabled={!canRequestPayout || requesting}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {requesting ? "Requesting…" : "Request payout"}
            </button>
          </div>

          {message && (
            <div className={`mt-4 text-sm px-3 py-2.5 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout info */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        {[
          { label: "Minimum payout", value: "$50" },
          { label: "Payout cycle", value: "Monthly" },
          { label: "Cooling period", value: "30 days" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border rounded-lg p-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="font-semibold text-slate-800 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Payout history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payout history</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading…</div>
          ) : payouts.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-3xl mb-3">💸</p>
              <p className="font-semibold text-slate-700">No payouts yet</p>
              <p className="text-sm text-slate-400 mt-1">Your first payout will appear here once processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(p.initiatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">${p.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-slate-500 capitalize">{p.method}</td>
                      <td className="py-3 px-3">
                        <Badge variant={STATUS_VARIANT[p.status] ?? "secondary"}>{p.status}</Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs font-mono">{p.transferRef ?? "—"}</td>
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
