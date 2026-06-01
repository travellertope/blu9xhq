import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SetupChecklist } from "@/components/admin/SetupChecklist";
import {
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Clock,
  Activity,
  XCircle,
  Bell,
} from "lucide-react";
import { format, parseISO } from "date-fns";

async function getDashboardData(base: string, cookieHeader: string | null) {
  try {
    const res = await fetch(`${base}/api/admin/dashboard`, {
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconColor?: string;
}) {
  return (
    <Card>
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
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-slate-400 py-4 text-center">{message}</p>
  );
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin-login");

  const user = session.user as any;
  const role = user.bluuhqRole ?? "viewer";
  const hideMetrics = role === "support_staff" || role === "viewer";

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cookie = headers().get("cookie") ?? "";
  const data = await getDashboardData(base, cookie);

  const metrics = data?.metrics;
  const setupChecklist = data?.setupChecklist;
  const upcomingRenewals: any[] = data?.upcomingRenewals ?? [];
  const overdueInvoices: any[] = data?.overdueInvoices ?? [];
  const atRiskClients: any[] = data?.atRiskClients ?? [];
  const followUpsToday: any[] = data?.followUpsToday ?? [];
  const recentActivity: any[] = data?.recentActivity ?? [];
  const cancellationQueue: any[] = data?.cancellationQueue ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Welcome back, {session.user?.name}
        </p>
      </div>

      {/* Setup Checklist */}
      {setupChecklist && !Object.values(setupChecklist).every(Boolean) && (
        <SetupChecklist checklist={setupChecklist} />
      )}

      {/* Metric Cards */}
      {!hideMetrics && metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Outstanding"
            value={`${metrics.outstandingCount ?? 0}`}
            sub={`Total: $${(metrics.outstandingTotal ?? 0).toLocaleString()}`}
            icon={DollarSign}
            iconColor="text-blue-300"
          />
          <MetricCard
            label="Overdue"
            value={`${metrics.overdueCount ?? 0}`}
            sub={`Total: $${(metrics.overdueTotal ?? 0).toLocaleString()}`}
            icon={AlertTriangle}
            iconColor="text-red-300"
          />
          <MetricCard
            label="Active Clients"
            value={metrics.activeClients ?? 0}
            icon={Users}
            iconColor="text-green-300"
          />
          <MetricCard
            label="Est. MRR"
            value={`$${(metrics.mrr ?? 0).toLocaleString()}`}
            icon={TrendingUp}
            iconColor="text-indigo-300"
          />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Renewals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Renewals (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingRenewals.length === 0 ? (
              <EmptyState message="No renewals due in the next 7 days" />
            ) : (
              <ul className="space-y-2">
                {upcomingRenewals.map((inv: any) => (
                  <li key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800">{inv.number}</span>
                    <div className="text-right">
                      <p className="text-slate-600">{inv.currency} {inv.total?.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">{inv.dueDate}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              Overdue Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueInvoices.length === 0 ? (
              <EmptyState message="No overdue invoices" />
            ) : (
              <ul className="space-y-2">
                {overdueInvoices.map((inv: any) => (
                  <li key={inv.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-800">{inv.number}</p>
                      <p className="text-xs text-slate-400">Due: {inv.dueDate}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <p className="text-red-600 font-medium">
                        {inv.currency} {inv.total?.toLocaleString()}
                      </p>
                      <a href={`/admin/invoices/${inv.id}/send`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Remind
                        </Button>
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* At-Risk Clients */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              At-Risk Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {atRiskClients.length === 0 ? (
              <EmptyState message="No at-risk clients" />
            ) : (
              <ul className="space-y-2">
                {atRiskClients.map((client: any) => (
                  <li key={client.id} className="text-sm">
                    <a
                      href={`/admin/clients/${client.id}`}
                      className="flex items-start justify-between hover:bg-slate-50 rounded p-1 -mx-1"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{client.name}</p>
                        {client.company && <p className="text-xs text-slate-400">{client.company}</p>}
                      </div>
                      {client.healthNote && (
                        <p className="text-xs text-orange-500 max-w-[150px] text-right">{client.healthNote}</p>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Follow-ups Due Today */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Follow-ups Due Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {followUpsToday.length === 0 ? (
              <EmptyState message="No follow-ups due today" />
            ) : (
              <ul className="space-y-2">
                {followUpsToday.map((f: any) => (
                  <li key={f.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-800 truncate max-w-[200px]">{f.subject}</p>
                      {f.clientId && (
                        <a href={`/admin/clients/${f.clientId}`} className="text-xs text-indigo-500 hover:underline">
                          View client →
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <EmptyState message="No recent activity" />
            ) : (
              <ul className="space-y-2">
                {recentActivity.slice(0, 8).map((a: any) => (
                  <li key={a.id} className="text-sm">
                    <p className="text-slate-700 truncate">{a.subject}</p>
                    <p className="text-xs text-slate-400">
                      {a.date ? format(parseISO(a.date), "MMM d, h:mm a") : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Cancellation Queue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              Cancellation Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cancellationQueue.length === 0 ? (
              <EmptyState message="No pending cancellations" />
            ) : (
              <ul className="space-y-2">
                {cancellationQueue.map((s: any) => (
                  <li key={s.id} className="flex items-center justify-between text-sm">
                    <p className="font-medium text-slate-800">{s.title}</p>
                    <a href={`/admin/clients/${s.clientId}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
