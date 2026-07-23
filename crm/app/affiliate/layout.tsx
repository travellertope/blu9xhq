import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { planAllows } from "@/lib/planLimits";
import { getTenantById } from "@/lib/tenant";
import AffiliateNav from "./AffiliateNav";
import type { ReactNode } from "react";

export const metadata = {
  title: { default: "Bluu Affiliates", template: "%s — Bluu Affiliates" },
};

const DEFAULT_ACCENT = "#2F5FE0";

export default async function AffiliateLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || session.user.role !== "bluu_affiliate") {
    redirect("/affiliate-login");
  }

  const { name, affiliateCode, tenantId, tenantPlan } = session.user;

  // Fetch tenant branding (only for plans that allow white-label) — same
  // gate as admin/layout.tsx and the client portal, so an agency's own
  // affiliates see the same branding as everyone else in that tenant.
  let tenantLogo: string | null = null;
  let tenantName: string | null = null;
  let accentColour = DEFAULT_ACCENT;
  if (tenantId && planAllows(tenantPlan, "whiteLabel")) {
    const tenant = await getTenantById(tenantId);
    if (tenant) {
      tenantLogo = tenant.logo_url;
      tenantName = tenant.name;
      accentColour = tenant.accent_colour ?? DEFAULT_ACCENT;
    }
  }

  return (
    <div
      className="fixed inset-0 flex overflow-hidden bg-slate-50"
      style={{ "--tenant-accent": accentColour } as React.CSSProperties}
    >
      <AffiliateNav
        firstName={name?.split(" ")[0] ?? "Affiliate"}
        affiliateCode={affiliateCode ?? ""}
        tenantLogo={tenantLogo ?? undefined}
        tenantName={tenantName ?? undefined}
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
