import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { AdminDashboardStats } from "@/types";

// Placeholder — replace with real WPGraphQL queries when CPTs are live
async function getAdminStats(): Promise<AdminDashboardStats> {
  return {
    totalClients: 0,
    activeClients: 0,
    totalMRR: 0,
    openInvoices: 0,
    overdueInvoices: 0,
    overdueAmount: 0,
    highChurnRiskClients: 0,
    recentCommunications: 0,
  };
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-lg p-5 bg-card space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={stats.totalClients} />
        <StatCard label="Active Clients" value={stats.activeClients} />
        <StatCard label="Monthly Recurring Revenue" value={`$${stats.totalMRR.toLocaleString()}`} />
        <StatCard label="Open Invoices" value={stats.openInvoices} />
        <StatCard label="Overdue Invoices" value={stats.overdueInvoices} />
        <StatCard label="Overdue Amount" value={`$${stats.overdueAmount.toLocaleString()}`} />
        <StatCard label="High Churn Risk" value={stats.highChurnRiskClients} />
        <StatCard label="Recent Communications" value={stats.recentCommunications} />
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <h2 className="font-semibold mb-4">Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Complete the WordPress setup (see <code>wordpress-setup.md</code>)</li>
          <li>Register custom post types via the bluuhq-cpts plugin</li>
          <li>Configure WPGraphQL and set your environment variables</li>
          <li>Create your first client in the Clients section</li>
        </ol>
      </div>
    </div>
  );
}
