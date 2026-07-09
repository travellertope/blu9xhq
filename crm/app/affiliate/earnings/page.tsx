import { getSession } from "@/lib/auth";


import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AffiliateCommission, AffiliateProduct } from "@/types";

const PRODUCT_LABELS: Record<AffiliateProduct, string> = {
  scan_tool:      "Scan Tool",
  portal:         "Client Portal",
  hosting_mgmt:   "Hosting & Management",
  content_ops:    "Content Operations",
  web_dev:        "Web / Mobile Dev",
  ai_integration: "AI Integration",
};

const STATUS_COLORS: Record<string, string> = {
  pending:   "text-amber-600 bg-amber-50",
  approved:  "text-blue-700 bg-blue-50",
  paid:      "text-green-700 bg-green-50",
  cancelled: "text-slate-500 bg-slate-100",
};

async function getCommissions(base: string, cookieHeader: string | null): Promise<AffiliateCommission[]> {
  try {
    const res = await fetch(`${base}/api/affiliates/commissions`, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.commissions ?? [];
  } catch {
    return [];
  }
}

function groupByProduct(commissions: AffiliateCommission[]) {
  return commissions.reduce<Record<string, number>>((acc, c) => {
    const key = PRODUCT_LABELS[c.product] ?? c.product;
    acc[key] = (acc[key] ?? 0) + c.commissionAmount;
    return acc;
  }, {});
}

export default async function EarningsPage() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const commissions = await getCommissions(base, cookieHeader);

  const totalEarned = commissions.reduce((s, c) => s + c.commissionAmount, 0);
  const totalPaid   = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.commissionAmount, 0);
  const totalPending = commissions.filter((c) => c.status === "pending" || c.status === "approved").reduce((s, c) => s + c.commissionAmount, 0);

  const byProduct = groupByProduct(commissions);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500 mt-1">Your full commission history, broken down by product and period.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "All-time earned", value: `$${totalEarned.toFixed(2)}`, color: "text-slate-900" },
          { label: "Pending / approved", value: `$${totalPending.toFixed(2)}`, color: "text-amber-600" },
          { label: "Total paid out",  value: `$${totalPaid.toFixed(2)}`, color: "text-green-700" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* By product breakdown */}
      {Object.keys(byProduct).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Earnings by product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(byProduct)
              .sort(([, a], [, b]) => b - a)
              .map(([product, amount]) => (
                <div key={product} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{product}</span>
                  <span className="text-sm font-bold text-slate-900">${amount.toFixed(2)}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Full commission log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Commission log</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="font-semibold text-slate-700">No commissions yet</p>
              <p className="text-sm text-slate-400 mt-1">Commissions appear here when your referrals convert and pay.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Period</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gross</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rate</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Commission</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-600">{c.period}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">{PRODUCT_LABELS[c.product] ?? c.product}</td>
                      <td className="py-3 px-3 text-slate-500 capitalize">{c.type}</td>
                      <td className="py-3 px-3 text-right text-slate-600">${c.grossAmount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{(c.commissionRate * 100).toFixed(0)}%</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">${c.commissionAmount.toFixed(2)}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? "text-slate-500 bg-slate-100"}`}>
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
    </div>
  );
}
