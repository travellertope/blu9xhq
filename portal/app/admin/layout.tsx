import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import type { ReactNode } from "react";

export const metadata = {
  title: { default: "BluuHQ Admin", template: "%s — BluuHQ Admin" },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== "bluu_admin") {
    redirect("/login");
  }

  const user = session.user as any;
  const userName   = user?.name ?? user?.email ?? "Team Member";
  const bluuhqRole = user?.bluuhqRole ?? "super_admin";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userName={userName} bluuhqRole={bluuhqRole} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Spacer for mobile top bar rendered inside Sidebar */}
        <div className="lg:hidden h-14 shrink-0" />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
