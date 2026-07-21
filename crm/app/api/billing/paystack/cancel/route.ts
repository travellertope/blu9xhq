import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTenantById } from "@/lib/tenant";
import { disablePaystackSubscription } from "@/lib/paystack";

export async function POST() {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant on session" }, { status: 400 });

  const tenant = await getTenantById(tenantId);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  if (!tenant.paystack_subscription_code || !tenant.paystack_email_token) {
    return NextResponse.json({ error: "No active Paystack subscription found" }, { status: 404 });
  }

  await disablePaystackSubscription(tenant.paystack_subscription_code, tenant.paystack_email_token);

  return NextResponse.json({ ok: true });
}
