import { NextResponse } from "next/server";
import { getMyShop, getSession } from "@/lib/auth";
import { initializePaystackSubscription } from "@/lib/paystack";
import { getPaystackPlanCode, PAYSTACK_PLAN_DETAILS, type PaidPlan } from "@/lib/paystack-products";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Create a shop first" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const plan: PaidPlan = body.plan;

  if (plan !== "starter" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const planCode = getPaystackPlanCode(plan);
  if (!planCode) {
    return NextResponse.json(
      { error: "Paystack plan not configured. Add PAYSTACK_PLAN_* env vars." },
      { status: 503 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
  const amountKobo = Math.round(PAYSTACK_PLAN_DETAILS[plan].monthlyNgn * 100);

  const txn = await initializePaystackSubscription({
    email: session.email,
    amountKobo,
    planCode,
    callbackUrl: `${siteUrl}/dashboard/billing?upgraded=1`,
    metadata: { shop_id: shop.id, target_plan: plan },
  });

  return NextResponse.json({ url: txn.authorization_url });
}
