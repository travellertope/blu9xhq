import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenantById } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { TenantPlan } from "@/lib/planLimits";
import { BillingClient } from "./BillingClient";

export default async function BillingPage() {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") redirect("/admin-login");

  const tenantId = session.user.tenantId;
  if (!tenantId) redirect("/admin-login");

  const tenant = await getTenantById(tenantId);
  if (!tenant) redirect("/admin-login");

  const plan = (tenant.plan as TenantPlan) ?? "free";

  const supabase = createSupabaseAdminClient();
  const [{ count: clientCount }, { count: teamCount }] = await Promise.all([
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabase
      .from("team_members")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "active"),
  ]);

  // Cloudflare's cf-ipcountry reflects the visitor's real connection even
  // when shop/crm domains sit behind Cloudflare's proxy (orange-cloud DNS),
  // which otherwise makes Vercel's x-vercel-ip-country see Cloudflare's edge
  // instead of the visitor — see the same fix applied to shop-tool's billing
  // page. Fall back to Vercel's header when Cloudflare isn't in front.
  const requestHeaders = headers();
  const country = requestHeaders.get("cf-ipcountry") || requestHeaders.get("x-vercel-ip-country");
  const showPaystack = country === "NG";

  return (
    <BillingClient
      plan={plan}
      clientCount={clientCount ?? 0}
      teamCount={teamCount ?? 0}
      hasStripeCustomer={!!tenant.stripe_customer_id}
      billingProvider={tenant.billing_provider}
      showPaystack={showPaystack}
    />
  );
}
