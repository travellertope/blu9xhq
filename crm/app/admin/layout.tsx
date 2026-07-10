import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { planAllows } from "@/lib/planLimits";
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

  const { name, email, bluuhqRole, tenantId, tenantPlan } = session.user;

  // Fetch tenant branding (only for plans that allow white-label)
  let tenantLogo: string | null = null;
  let accentColour: string = "#2F5FE0";
  if (tenantId && planAllows(tenantPlan, "whiteLabel")) {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from("tenants")
      .select("logo_url,accent_colour")
      .eq("id", tenantId)
      .single();
    tenantLogo   = data?.logo_url ?? null;
    accentColour = data?.accent_colour ?? "#2F5FE0";
  }

  return (
    <div
      className="fixed inset-0 flex overflow-hidden bg-slate-50"
      style={{ "--accent": accentColour } as React.CSSProperties}
    >
      <Sidebar
        userName={name ?? email ?? "Team Member"}
        bluuhqRole={bluuhqRole ?? "super_admin"}
        tenantLogo={tenantLogo ?? undefined}
        accentColour={accentColour}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="lg:hidden h-14 shrink-0" />
        <main className="flex-1 min-h-0 overflow-auto overscroll-none p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
