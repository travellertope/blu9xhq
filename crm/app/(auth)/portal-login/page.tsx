import { headers } from "next/headers";
import { getTenantBySlug } from "@/lib/tenant";
import { planAllows, type TenantPlan } from "@/lib/planLimits";
import PortalLoginForm from "./portal-login-form";

const DEFAULT_LOGO =
  "https://mlgepubil2mw.i.optimole.com/w:742/h:157/q:mauto/g:sm/f:best/https://bluuhq.com/wp-content/uploads/2026/05/cropped-bluuhq.png";
const DEFAULT_ACCENT = "#2F5FE0";

export default async function PortalLoginPage() {
  // x-tenant-slug (set by middleware.ts for a tenant's subdomain or
  // white-label custom domain) is who this login screen is actually for —
  // brand it with their logo/colour, gated by the same whiteLabel plan
  // check the admin dashboard already uses, so a downgraded tenant's old
  // custom domain doesn't keep showing branding they no longer pay for.
  const tenantSlug = headers().get("x-tenant-slug");
  const tenant = tenantSlug ? await getTenantBySlug(tenantSlug) : null;
  const branded = !!tenant && planAllows(tenant.plan as TenantPlan, "whiteLabel");

  return (
    <PortalLoginForm
      logoUrl={ ( branded && tenant?.logo_url ) || DEFAULT_LOGO }
      tenantName={ ( branded && tenant?.name ) || "BluuHQ" }
      accentColour={ ( branded && tenant?.accent_colour ) || DEFAULT_ACCENT }
    />
  );
}
