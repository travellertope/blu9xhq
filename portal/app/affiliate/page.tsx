import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import {
  MousePointerClick, TrendingUp, DollarSign, Clock, Users, ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

async function getStats(base: string, cookieHeader: string | null) {
  try {
    const res = await fetch(`${base}/api/affiliates/commissions?summary=1`, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function StatCard({
  label, value, sub, icon: Icon, iconColor, href,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconColor?: string; href?: string;
}) {
  const inner = (
    <Card className={href ? "hover:shadow-md transition-shadow" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          </div>
          <Icon className={`h-8 w-8 ${iconColor ?? "text-slate-300"}`} />
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AffiliateDashboard() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const affiliateCode = user?.affiliateCode ?? "";

  const headersList = await headers();
  const cookieHeader = headersList.get("cookie");
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const stats = await getStats(base, cookieHeader);

  const totalClicks         = stats?.totalClicks         ?? 0;
  const totalConversions    = stats?.totalConversions    ?? 0;
  const thisMonthEarnings   = stats?.thisMonthEarnings   ?? 0;
  const allTimeEarnings     = stats?.allTimeEarnings     ?? 0;
  const pendingPayout       = stats?.pendingPayout       ?? 0;
  const activeReferrals     = stats?.activeReferrals     ?? 0;

  const conversionRate = totalClicks > 0
    ? ((totalConversions / totalClicks) * 100).toFixed(1)
    : "0.0";

  const referralLink = affiliateCode
    ? `https://bluuhq.com/?ref=${affiliateCode}`
    : null;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hey, {firstName} 👋</h1>
          <p className="text-sm text-slate-500 mt-1">Here&apos;s how your affiliate account is performing.</p>
        </div>
        {referralLink && (
          <Link
            href="/affiliate/links"
            className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get links <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Quick referral link */}
      {referralLink && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Your referral link</p>
            <p className="text-sm font-mono text-blue-900 mt-0.5">{referralLink}</p>
          </div>
          <CopyButton text={referralLink} />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total clicks"      value={totalClicks}      sub={`${conversionRate}% conversion rate`} icon={MousePointerClick} iconColor="text-blue-300"   href="/affiliate/conversions" />
        <StatCard label="Conversions"       value={totalConversions}  sub="Active referrals"                    icon={TrendingUp}        iconColor="text-green-300"  href="/affiliate/conversions" />
        <StatCard label="This month"        value={`$${thisMonthEarnings.toFixed(2)}`} sub="Commissions earned" icon={DollarSign} iconColor="text-emerald-400" href="/affiliate/earnings" />
        <StatCard label="All-time earnings" value={`$${allTimeEarnings.toFixed(2)}`}   sub="Since you joined"   icon={DollarSign} iconColor="text-slate-300"   href="/affiliate/earnings" />
        <StatCard label="Pending payout"    value={`$${pendingPayout.toFixed(2)}`}     sub="Next payout cycle"  icon={Clock}      iconColor="text-amber-400"  href="/affiliate/payouts" />
        <StatCard label="Active referrals"  value={activeReferrals}   sub="Paying customers"                   icon={Users}      iconColor="text-indigo-300" href="/affiliate/conversions" />
      </div>

      {/* Empty state if no activity yet */}
      {totalClicks === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-4xl">🚀</div>
            <div>
              <p className="font-semibold text-slate-800">You&apos;re all set — start sharing</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Copy your referral link and share it with your audience. You&apos;ll see clicks and conversions here as they come in.
              </p>
            </div>
            <Link
              href="/affiliate/links"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Get your referral link <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/affiliate/assets",      label: "Browse marketing assets",     sub: "Copy packs, email templates" },
          { href: "/affiliate/earnings",     label: "View earnings breakdown",     sub: "By product and month" },
          { href: "/affiliate/settings",     label: "Set up your payout method",  sub: "Stripe, PayPal, or bank" },
        ].map(({ href, label, sub }) => (
          <Link key={href} href={href} className="block p-4 bg-white border rounded-xl hover:shadow-md transition-shadow group">
            <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Inline copy button (client island)
function CopyButton({ text }: { text: string }) {
  "use client";
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).catch(() => undefined)}
      className="shrink-0 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
    >
      Copy
    </button>
  );
}
