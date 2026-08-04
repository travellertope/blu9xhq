export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { constructStripeWebhookEvent } from "@/lib/stripe";
import { getPlanFromPriceId } from "@/lib/stripe-products";
import { checkAndAwardReferralReward } from "@/lib/referral";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ShopPlan } from "@/types";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const payload = Buffer.from(body);
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[shop-billing-webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Respond 200 immediately; process async.
  void processEvent(event);
  return NextResponse.json({ received: true });
}

function isShopPlan(value: string | null | undefined): value is ShopPlan {
  return value === "free" || value === "starter" || value === "pro";
}

async function setShopPlan(shopId: string, plan: ShopPlan, stripeCustomerId?: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("shops")
    .update({
      plan,
      branding_hidden: plan !== "free",
      ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
    })
    .eq("id", shopId);

  // Dropping back to free is the one moment a referrer's already-active
  // referrals (accrued while they were paying, so skipped at the time) can
  // become eligible for a reward — see checkAndAwardReferralReward.
  if (plan === "free") {
    await checkAndAwardReferralReward(shopId).catch((err) =>
      console.error("[shop-billing-webhook] referral reward check failed:", err)
    );
  }
}

async function processEvent(event: Stripe.Event): Promise<void> {
  try {
    if (event.type === "checkout.session.completed") {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.mode === "subscription") {
        const shopId = cs.metadata?.shop_id;
        const plan = cs.metadata?.target_plan;
        if (shopId && isShopPlan(plan)) {
          await setShopPlan(shopId, plan, cs.customer as string);
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;
      const shopId = sub.metadata?.shop_id;
      if (shopId) {
        // Prefer metadata plan; fall back to reverse-lookup of current price.
        let plan: string | null = sub.metadata?.target_plan ?? null;
        if (!isShopPlan(plan)) {
          const priceId = sub.items.data[0]?.price?.id;
          plan = priceId ? getPlanFromPriceId(priceId) : null;
        }
        if (isShopPlan(plan)) await setShopPlan(shopId, plan);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const shopId = sub.metadata?.shop_id;
      if (shopId) await setShopPlan(shopId, "free");
    }
  } catch (err) {
    console.error("[shop-billing-webhook] processEvent error:", err);
  }
}
