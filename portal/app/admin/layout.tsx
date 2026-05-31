import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { ReactNode } from "react";

export const metadata = {
  title: "BluuHQ Admin",
  description: "BluuHQ CRM — Admin Panel",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "bluu_admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b bg-card">
        <div className="flex h-14 items-center px-6 gap-6">
          <span className="font-bold text-lg tracking-tight">BluuHQ</span>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <a href="/admin" className="hover:text-foreground transition-colors">Dashboard</a>
            <a href="/admin/clients" className="hover:text-foreground transition-colors">Clients</a>
            <a href="/admin/invoices" className="hover:text-foreground transition-colors">Invoices</a>
            <a href="/admin/subscriptions" className="hover:text-foreground transition-colors">Subscriptions</a>
            <a href="/admin/files" className="hover:text-foreground transition-colors">Files</a>
            <a href="/admin/communications" className="hover:text-foreground transition-colors">Communications</a>
            <a href="/admin/sequences" className="hover:text-foreground transition-colors">Sequences</a>
          </nav>
          <div className="ml-auto text-sm text-muted-foreground">
            {session.user?.name}
          </div>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
