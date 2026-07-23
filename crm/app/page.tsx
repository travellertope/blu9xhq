import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default function Home() {
  // middleware.ts resolves x-tenant-slug for a tenant's subdomain or
  // white-label custom domain — that's a tenant's own client-facing portal,
  // so its root should land clients on /portal-login. The bare crm.bluuhq.com
  // domain resolves no tenant, so it's the agency's own shared admin login.
  const tenantSlug = headers().get("x-tenant-slug");
  redirect(tenantSlug ? "/portal-login" : "/admin-login");
}
