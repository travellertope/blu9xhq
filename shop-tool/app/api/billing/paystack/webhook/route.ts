export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { checkAndAwardReferralReward } from "@/lib/referral";
import { handlePaymentFailure } from "@/lib/payment-reminders";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { ShopPlan } from "@/types";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    console.error("[paystack-webhook] signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Respond 200 immediately; process async.
  void processEvent(event);
  return NextResponse.json({ received: true });
}

function isShopPlan(value: unknown): value is ShopPlan {
  return value === "free" || value === "starter" || value === "pro";
}

async function processEvent(event: { event: string; data: Record<string, unknown> }): Promise<void> {
  try {
    if (event.event === "charge.success") {
      const data = event.data;
      const metadata = (data.metadata ?? {}) as Record<string, unknown>;
      const shopId = metadata.shop_id;
      const plan = metadata.target_plan;
      const customer = data.customer as { customer_code?: string } | undefined;
      const supabase = createSupabaseAdminClient();

      // Renewal charges don't carry our custom metadata (only the original
      // /transaction/initialize call does) — this naturally no-ops on
      // renewals, which is correct, since the plan is already set.
      if (typeof shopId === "string" && isShopPlan(plan)) {
        await supabase
          .from("shops")
          .update({
            plan,
            branding_hidden: plan !== "free",
            billing_provider: "paystack",
            paystack_customer_code: customer?.customer_code ?? null,
            payment_failure_count: 0,
          })
          .eq("id", shopId);
      } else if (customer?.customer_code) {
        // A successful renewal charge — no custom metadata to key off, but
        // any failure streak from previous retries is now over.
        await supabase
          .from("shops")
          .update({ payment_failure_count: 0 })
          .eq("paystack_customer_code", customer.customer_code);
      }
    }

    if (event.event === "subscription.create") {
      const data = event.data;
      const customer = data.customer as { customer_code?: string } | undefined;
      const subscriptionCode = data.subscription_code;
      const emailToken = data.email_token;
      if (customer?.customer_code && typeof subscriptionCode === "string" && typeof emailToken === "string") {
        const supabase = createSupabaseAdminClient();
        // subscription.create's payload doesn't carry our shop_id metadata,
        // so it's matched by the customer_code charge.success already
        // stored — if this arrives first (ordering isn't guaranteed), it's
        // a no-op and the cancel button just won't work until a later
        // renewal event fills it in.
        await supabase
          .from("shops")
          .update({ paystack_subscription_code: subscriptionCode, paystack_email_token: emailToken })
          .eq("paystack_customer_code", customer.customer_code);
      }
    }

    if (event.event === "subscription.disable") {
      const data = event.data;
      const subscriptionCode = data.subscription_code;
      if (typeof subscriptionCode === "string") {
        const supabase = createSupabaseAdminClient();
        const { data: updated } = await supabase
          .from("shops")
          .update({ plan: "free", branding_hidden: false, payment_failure_count: 0 })
          .eq("paystack_subscription_code", subscriptionCode)
          .select("id")
          .maybeSingle();

        // Dropping back to free is the one moment a referrer's already-active
        // referrals (accrued while they were paying, so skipped at the time)
        // can become eligible for a reward — see checkAndAwardReferralReward.
        if (updated) {
          await checkAndAwardReferralReward(updated.id).catch((err) =>
            console.error("[paystack-webhook] referral reward check failed:", err)
          );
        }
      }
    }

    if (event.event === "invoice.payment_failed") {
      const data = event.data;
      const subscription = data.subscription as { subscription_code?: string } | undefined;
      const subscriptionCode = subscription?.subscription_code;
      if (typeof subscriptionCode === "string") {
        const supabase = createSupabaseAdminClient();
        const { data: shop } = await supabase
          .from("shops")
          .select("id")
          .eq("paystack_subscription_code", subscriptionCode)
          .maybeSingle();
        if (shop) {
          await handlePaymentFailure(shop.id).catch((err) =>
            console.error("[paystack-webhook] payment failure handling failed:", err)
          );
        }
      }
    }
  } catch (err) {
    console.error("[paystack-webhook] processEvent error:", err);
  }
}
