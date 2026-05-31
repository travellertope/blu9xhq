import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ClientDashboardStats } from "@/types";

async function getClientStats(
  // clientId: string
): Promise<ClientDashboardStats> {
  // TODO: fetch real data from WPGraphQL using clientId
  return {
    activeSubscriptions: 0,
    openInvoices: 0,
    totalDue: 0,
    recentFiles: 0,
  };
}

function StatCard({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const card = (
    <div className="border rounded-lg p-5 bg-card space-y-1 hover:border-primary/50 transition-colors">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
  if (href) return <a href={href}>{card}</a>;
  return card;
}

export default async function ClientPortalDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getClientStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {session?.user?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-sm">Here's a summary of your account</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Services" value={stats.activeSubscriptions} href="/portal/subscriptions" />
        <StatCard label="Open Invoices" value={stats.openInvoices} href="/portal/invoices" />
        <StatCard label="Total Due" value={`$${stats.totalDue.toLocaleString()}`} href="/portal/invoices" />
        <StatCard label="Recent Files" value={stats.recentFiles} href="/portal/files" />
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold mb-2">Need help?</h2>
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
