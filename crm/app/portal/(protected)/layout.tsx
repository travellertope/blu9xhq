import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { planAllows } from "@/lib/planLimits";
import { getTenantById } from "@/lib/tenant";
import type { ReactNode } from "react";
import PortalNav from "./PortalNav";

export const metadata = {
  title: "BluuHQ Client Portal",
  description: "Your BluuHQ client portal",
};

const DEFAULT_ACCENT = "#2F5FE0";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session || session.user.role !== "bluu_client") {
    redirect("/portal-login");
  }

  const firstName = session.user.name?.split(" ")[0] ?? "Client";

  // Fetch tenant branding (only for plans that allow white-label) — mirrors
  // admin/layout.tsx and /portal-login's own gate, so a client sees the same
  // branding their agency has actually paid for, consistently across both
  // the login screen and the portal itself.
  const { tenantId, tenantPlan } = session.user;
  let tenantLogo: string | null = null;
  let tenantName: string | null = null;
  let accentColour = DEFAULT_ACCENT;
  let whiteLabeled = false;
  if (tenantId && planAllows(tenantPlan, "whiteLabel")) {
    const tenant = await getTenantById(tenantId);
    if (tenant) {
      tenantLogo = tenant.logo_url;
      tenantName = tenant.name;
      accentColour = tenant.accent_colour ?? DEFAULT_ACCENT;
      whiteLabeled = true;
    }
  }

  return (
    <div
      className="min-h-screen bg-[#FAFAF9] flex flex-col"
      style={{ "--tenant-accent": accentColour } as React.CSSProperties}
    >
      <PortalNav firstName={firstName} tenantLogo={tenantLogo ?? undefined} tenantName={tenantName ?? undefined} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      {!whiteLabeled && (
        <footer className="border-t bg-white py-4 text-center text-sm text-slate-400">
          Powered by BluuHQ &middot;{" "}
          <a href="mailto:hello@bluuhq.com" className="hover:text-slate-600 transition-colors">
            hello@bluuhq.com
          </a>
        </footer>
      )}
    </div>
  );
}
