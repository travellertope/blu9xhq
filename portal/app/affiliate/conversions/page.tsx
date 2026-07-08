import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AffiliateConversion, AffiliateProduct } from "@/types";

const PRODUCT_LABELS: Record<AffiliateProduct, string> = {
  scan_tool:     "Scan Tool",
  portal:        "Client Portal",
  hosting_mgmt:  "Hosting & Management",
  content_ops:   "Content Operations",
  web_dev:       "Web / Mobile Dev",
  ai_integration:"AI Integration",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending:  "secondary",
  approved: "default",
  rejected: "destructive",
};

async function getConversions(base: string, cookieHeader: string | null): Promise<AffiliateConversion[]> {
  try {
    const res = await fetch(`${base}/api/affiliates/commissions?type=conversions`, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.conversions ?? [];
  } catch {
    return [];
  }
}

export default async function ConversionsPage() {
  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const conversions = await getConversions(base, cookieHeader);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Conversions</h1>
        <p className="text-sm text-slate-500 mt-1">Every customer who signed up through your referral link.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All conversions</CardTitle>
        </CardHeader>
        <CardContent>
          {conversions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">🎯</p>
              <p className="font-semibold text-slate-700">No conversions yet</p>
              <p className="text-sm text-slate-400 mt-1">Share your referral link to get your first conversion.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Commission</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {conversions.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-3 text-slate-600">
                        {new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {PRODUCT_LABELS[c.product] ?? c.product}
                      </td>
                      <td className="py-3 px-3 text-slate-500 capitalize">
                        {c.conversionType.replace("_", " ")}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {c.commissionAmount != null ? `$${c.commissionAmount.toFixed(2)}` : "—"}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={STATUS_VARIANT[c.status] ?? "secondary"}>
                          {c.status}
                        </Badge>
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
