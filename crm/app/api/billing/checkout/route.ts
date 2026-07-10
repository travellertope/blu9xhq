import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getTenantById } from "@/lib/tenant";
import { getStripe } from "@/lib/stripe";
import { getPriceId } from "@/lib/stripe-products";
import type { TenantPlan } from "@/lib/planLimits";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const plan: TenantPlan            = body.plan;
  const billing: "monthly" | "annual" = body.billing ?? "monthly";

  if (!plan || plan === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceId(plan, billing);
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured for this plan. Add STRIPE_PRICE_* env vars." },
      { status: 503 }
    );
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant on session" }, { status: 400 });

  const tenant = await getTenantById(tenantId);
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const stripe   = getStripe();
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  // Get or create Stripe customer
  let customerId = tenant.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email:    session.user.email,
      name:     tenant.name,
      metadata: { tenant_id: tenantId, tenant_slug: tenant.slug },
    });
    customerId = customer.id;
    const supabase = createSupabaseAdminClient();
    await supabase.from("tenants").update({ stripe_customer_id: customerId }).eq("id", tenantId);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode:     "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { tenant_id: tenantId, target_plan: plan },
    subscription_data: { metadata: { tenant_id: tenantId, target_plan: plan } },
    success_url: `${siteUrl}/admin/billing?upgraded=1`,
    cancel_url:  `${siteUrl}/admin/billing`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
