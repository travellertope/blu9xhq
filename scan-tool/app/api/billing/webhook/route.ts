import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, TIER_PRICE_IDS } from "@/lib/stripe";
import { getUserByStripeCustomerId, setUserTier } from "@/lib/redis";

export const runtime = "nodejs";

function tierForPriceId(priceId: string | undefined): "monitor" | "monitor_pro" | null {
  if (!priceId) return null;
  if (priceId === TIER_PRICE_IDS.monitor) return "monitor";
  if (priceId === TIER_PRICE_IDS.monitor_pro) return "monitor_pro";
  return null;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: "invalid_signature", message: err instanceof Error ? err.message : "Signature verification failed." },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.email || session.client_reference_id;
      const customerId = typeof session.customer === "string" ? session.customer : null;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

      if (email && customerId) {
        const stripe = getStripe();
        const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
        const priceId = subscription?.items.data[0]?.price.id;
        const tier = tierForPriceId(priceId);

        await setUserTier(email, {
          tier: tier || "monitor",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          tierExpiresAt: subscription
            ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
            : null,
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByStripeCustomerId(subscription.customer as string);
      if (user) {
        const priceId = subscription.items.data[0]?.price.id;
        const tier = tierForPriceId(priceId) || "free";
        await setUserTier(user.email, {
          tier,
          stripeSubscriptionId: subscription.id,
          tierExpiresAt: new Date(subscription.items.data[0].current_period_end * 1000).toISOString(),
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByStripeCustomerId(subscription.customer as string);
      if (user) {
        await setUserTier(user.email, { tier: "free", stripeSubscriptionId: null, tierExpiresAt: null });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;
      if (!subscriptionId) break;

      const stripe = getStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const affiliateCode = subscription.metadata?.affiliate_code;

      if (affiliateCode && invoice.amount_paid > 0) {
        const grossAmount = invoice.amount_paid / 100;
        await notifyPortalAffiliateEvent({
          affiliateCode,
          product:        "scan_tool",
          conversionType: invoice.billing_reason === "subscription_create" ? "paid_subscription" : "paid_subscription",
          grossAmount,
          currency:       invoice.currency.toUpperCase(),
          externalRef:    invoice.id,
        }).catch((err) => console.error("[billing/invoice.paid] affiliate event failed:", err));
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
      if (customerId) {
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          console.error(`[billing] payment failed for ${user.email} — grace period applies until tierExpiresAt`);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function notifyPortalAffiliateEvent(payload: {
  affiliateCode:  string;
  product:        string;
  conversionType: string;
  grossAmount:    number;
  currency:       string;
  externalRef:    string;
}): Promise<void> {
  const portalUrl  = process.env.PORTAL_URL ?? "https://crm.bluuhq.com";
  const internalSecret = process.env.BLUU_INTERNAL_SECRET;
  if (!internalSecret) {
    console.warn("[billing] BLUU_INTERNAL_SECRET not set — skipping affiliate event");
    return;
  }
  const res = await fetch(`${portalUrl}/api/affiliates/event`, {
    method:  "POST",
    headers: { "Content-Type": "application/json", "x-bluu-internal-secret": internalSecret },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Portal event API responded ${res.status}: ${text}`);
  }
}
