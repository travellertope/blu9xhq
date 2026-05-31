import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import type { ReactNode } from "react";

export const metadata = {
  title: "BluuHQ Client Portal",
  description: "Your BluuHQ client portal",
};

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "bluu_client") {
    redirect("/portal-login");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-14 items-center px-6 gap-6">
          <span className="font-bold text-lg tracking-tight">BluuHQ Portal</span>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <a href="/portal" className="hover:text-foreground transition-colors">Overview</a>
            <a href="/portal/invoices" className="hover:text-foreground transition-colors">Invoices</a>
            <a href="/portal/files" className="hover:text-foreground transition-colors">Files</a>
            <a href="/portal/subscriptions" className="hover:text-foreground transition-colors">Services</a>
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            <span>{session.user?.name}</span>
            <a href="/api/auth/signout" className="hover:text-foreground transition-colors">Sign out</a>
          </div>
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
