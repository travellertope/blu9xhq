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

  const userName = session.user?.name ?? session.user?.email ?? "Admin";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar — handles both desktop fixed and mobile sheet */}
      <Sidebar userName={userName} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Spacer for mobile top bar (rendered inside Sidebar component) */}
        <div className="lg:hidden h-14 shrink-0" />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
