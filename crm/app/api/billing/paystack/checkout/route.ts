import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTenantById } from "@/lib/tenant";
import { initializePaystackSubscription } from "@/lib/paystack";
import { getPaystackPlanCode, PAYSTACK_PLAN_DETAILS, type PaidPlan } from "@/lib/paystack-products";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant on session" }, { status: 400 });

  const tenant = await getTenantById(tenantId);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const plan: PaidPlan = body.plan;

  if (plan !== "starter" && plan !== "pro" && plan !== "agency") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planCode = getPaystackPlanCode(plan);
  if (!planCode) {
    return NextResponse.json(
      { error: "Paystack plan not configured. Add PAYSTACK_PLAN_* env vars." },
      { status: 503 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const amountKobo = Math.round(PAYSTACK_PLAN_DETAILS[plan].monthlyNgn * 100);

  const txn = await initializePaystackSubscription({
    email: session.user.email,
    amountKobo,
    planCode,
    callbackUrl: `${siteUrl}/admin/billing?upgraded=1`,
    metadata: { tenant_id: tenantId, target_plan: plan },
  });

  return NextResponse.json({ url: txn.authorization_url });
}
