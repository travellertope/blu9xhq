import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Affiliates" };

async function fetchAffiliates(search: string, status: string) {
  const base   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookie = headers().get("cookie") ?? "";
  const qs = new URLSearchParams({ per_page: "50" });
  if (search) qs.set("search", search);
  if (status) qs.set("status", status);
  try {
    const res = await fetch(`${base}/api/admin/affiliates?${qs.toString()}`, {
      cache: "no-store", headers: { cookie },
    });
    if (!res.ok) return { affiliates: [], total: 0 };
    return res.json();
  } catch {
    return { affiliates: [], total: 0 };
  }
}

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green-50 text-green-700",
  suspended: "bg-red-50 text-red-700",
  pending:   "bg-amber-50 text-amber-700",
};

export default async function AffiliatesPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const search = searchParams.search ?? "";
  const status = searchParams.status ?? "";
  const { affiliates, total } = await fetchAffiliates(search, status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Affiliates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} registered affiliate{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/affiliates/commissions"
            className="text-sm font-medium px-4 py-2 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            Commission queue
          </Link>
          <Link
            href="/admin/affiliates/payouts"
            className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Payout queue
          </Link>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search name or email…"
          className="border rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="status"
          defaultValue={status}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          Search
        </button>
      </form>

      <Card>
        <CardContent className="p-0">
          {affiliates.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">🤝</p>
              <p className="font-semibold text-slate-700">No affiliates yet</p>
              <p className="text-sm text-slate-400 mt-1">Affiliates appear here once they register.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Affiliate</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Payout method</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((a: any) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900">{a.name}</p>
                        <p className="text-xs text-slate-400">{a.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-blue-700 text-xs tracking-wider">{a.affiliateCode}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 capitalize">{a.payoutMethod || "—"}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {a.registered ? new Date(a.registered).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/affiliates/${a.id}`}
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          View →
                        </Link>
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
