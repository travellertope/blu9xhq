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

  return (
    <BillingClient
      plan={plan}
      clientCount={clientCount ?? 0}
      teamCount={teamCount ?? 0}
      hasStripeCustomer={!!tenant.stripe_customer_id}
    />
  );
}
