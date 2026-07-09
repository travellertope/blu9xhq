import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import type { ReactNode } from "react";

export const metadata = {
  title: { default: "BluuHQ Admin", template: "%s — BluuHQ Admin" },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || session.user.role !== "bluu_admin") {
    redirect("/admin-login");
  }

  const { name, email, bluuhqRole } = session.user;

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-slate-50">
      <Sidebar userName={name ?? email ?? "Team Member"} bluuhqRole={bluuhqRole ?? "super_admin"} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="lg:hidden h-14 shrink-0" />
        <main className="flex-1 min-h-0 overflow-auto overscroll-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
