import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { listClientSubscriptions, listInvoices, listClientFiles } from "@/lib/wp-api";

interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
  sub?: string;
}

function StatCard({ label, value, href, sub }: StatCardProps) {
  const card = (
    <div className="border rounded-lg p-5 bg-card space-y-1 hover:border-primary/40 transition-colors">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
  if (href) return <a href={href}>{card}</a>;
  return card;
}

async function getPortalStats(clientId: number) {
  const [subsResult, invoicesResult, filesResult] = await Promise.allSettled([
    listClientSubscriptions(clientId),
    listInvoices({ clientId, per_page: 100 }),
    listClientFiles(clientId),
  ]);

  const subscriptions = subsResult.status === "fulfilled" ? subsResult.value.items : [];
  const invoices = invoicesResult.status === "fulfilled" ? invoicesResult.value.items : [];
  const files = filesResult.status === "fulfilled" ? filesResult.value.items : [];

  const activeSubscriptions = subscriptions.filter((s) => s.acf.status === "active").length;

  const openInvoices = invoices.filter(
    (i) => i.acf.inv_status === "sent" || i.acf.inv_status === "overdue"
  );
  const openInvoiceCount = openInvoices.length;
  const totalDue = openInvoices.reduce((sum, i) => sum + (i.acf.inv_total ?? 0), 0);
  const primaryCurrency = openInvoices[0]?.acf.inv_currency ?? "USD";

  const sharedFiles = files.filter((f) => f.acf.file_visibility === "shared").length;

  const recentSubs = subscriptions.slice(0, 3).map((sub) => ({
    id: sub.id,
    title: sub.title.rendered,
    status: sub.acf.status,
    amount: sub.acf.amount,
    currency: sub.acf.currency,
    billingCycle: sub.acf.billing_cycle,
  }));

  return {
    activeSubscriptions,
    openInvoiceCount,
    totalDue,
    primaryCurrency,
    sharedFiles,
    recentSubs,
  };
}

export default async function ClientPortalDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "bluu_client") {
    redirect("/portal-login");
  }

  const user = session.user as any;
  const clientId = parseInt(user.clientId ?? "0", 10);
  const firstName = session.user?.name?.split(" ")[0] ?? "there";

  const stats = clientId
    ? await getPortalStats(clientId).catch(() => null)
    : null;

  const totalDueDisplay = stats
    ? `${stats.primaryCurrency} ${stats.totalDue.toLocaleString()}`
    : "—";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-muted-foreground text-sm">Here's a summary of your account</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Services"
          value={stats?.activeSubscriptions ?? 0}
          href="/portal/subscriptions"
        />
        <StatCard
          label="Open Invoices"
          value={stats?.openInvoiceCount ?? 0}
          href="/portal/invoices"
        />
        <StatCard
          label="Total Due"
          value={totalDueDisplay}
          href="/portal/invoices"
        />
        <StatCard
          label="Shared Files"
          value={stats?.sharedFiles ?? 0}
          href="/portal/files"
        />
      </div>

      {stats && stats.recentSubs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your Services</h2>
            <a href="/portal/subscriptions" className="text-sm text-muted-foreground hover:text-foreground">
              View all →
            </a>
          </div>
          <div className="space-y-2">
            {stats.recentSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between border rounded-lg px-4 py-3 bg-card text-sm"
              >
                <span className="font-medium">{sub.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {sub.currency} {sub.amount?.toLocaleString()}
                    {sub.billingCycle === "monthly"
                      ? "/mo"
                      : sub.billingCycle === "annually"
                      ? "/yr"
                      : ""}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sub.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold mb-1">Need help?</h2>
        <p className="text-sm text-muted-foreground">
          Reach out to your account manager at{" "}
          <a href="mailto:hello@bluuhq.com" className="text-foreground underline underline-offset-2">
            hello@bluuhq.com
          </a>
        </p>
      </div>
    </div>
  );
}
