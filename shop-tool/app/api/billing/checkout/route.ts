import { NextResponse } from "next/server";
import { getMyShop, getSession } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getPriceId } from "@/lib/stripe-products";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ShopPlan } from "@/types";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Create a shop first" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const plan: ShopPlan = body.plan;
  const billing: "monthly" | "annual" = body.billing === "annual" ? "annual" : "monthly";

  if (plan !== "starter" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = getPriceId(plan, billing);
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured for this plan. Add STRIPE_PRICE_* env vars." },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";

  let customerId = shop.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      name: shop.name,
      metadata: { shop_id: shop.id, shop_slug: shop.slug },
    });
    customerId = customer.id;
    const supabase = createSupabaseServerClient();
    await supabase.from("shops").update({ stripe_customer_id: customerId }).eq("id", shop.id);
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { shop_id: shop.id, target_plan: plan },
    subscription_data: { metadata: { shop_id: shop.id, target_plan: plan } },
    success_url: `${siteUrl}/dashboard/billing?upgraded=1`,
    cancel_url: `${siteUrl}/dashboard/billing`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
