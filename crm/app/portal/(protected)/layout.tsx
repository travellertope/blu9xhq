import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { planAllows } from "@/lib/planLimits";
import { getTenantById, type TenantRow } from "@/lib/tenant";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import PortalNav from "./PortalNav";

const DEFAULT_ACCENT = "#2F5FE0";

// cache() dedupes this within a single request, so generateMetadata() and
// the layout component below share one actual DB call instead of two.
const getBrandingTenant = cache(async (): Promise<TenantRow | null> => {
  const session = await getSession();
  if (!session) return null;
  const { tenantId, tenantPlan } = session.user;
  if (!tenantId || !planAllows(tenantPlan, "whiteLabel")) return null;
  return getTenantById(tenantId);
});

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getBrandingTenant();
  const name = tenant?.name || "BluuHQ";
  return {
    title: `${name} Client Portal`,
    description: `Your ${name} client portal`,
  };
}

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
  const tenant = await getBrandingTenant();
  const tenantLogo = tenant?.logo_url ?? null;
  const tenantName = tenant?.name ?? null;
  const accentColour = tenant?.accent_colour ?? DEFAULT_ACCENT;
  const whiteLabeled = !!tenant;

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
