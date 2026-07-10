export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { constructStripeWebhookEvent, getStripe } from "@/lib/stripe";
import { listInvoices, updateInvoice, wpRestFetch } from "@/lib/wp-api";
import { sendEmailHtml } from "@/lib/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getPlanFromPriceId } from "@/lib/stripe-products";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const payload = Buffer.from(body);
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = constructStripeWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Respond 200 immediately; process async
  void processEvent(event);
  return NextResponse.json({ received: true });
}

async function processEvent(event: Stripe.Event): Promise<void> {
  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const invoiceId = parseInt(pi.metadata?.invoiceId ?? "0", 10);
      if (!invoiceId) return;

      await updateInvoice(invoiceId, {
        acf: {
          inv_status: "paid",
          inv_paid_at: new Date().toISOString(),
          inv_payment_method: "stripe",
          inv_payment_gateway_ref: pi.id,
        },
      });

      // Fetch invoice for receipt email
      const inv = await listInvoices({ per_page: 1 }).catch(() => null);
      if (inv?.items[0]) {
        const invoice = inv.items[0];
        if (invoice.acf.inv_client) {
          await sendReceiptEmail(invoiceId, pi.id).catch(console.error);
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;
      console.error("[stripe-webhook] payment failed:", pi.id, pi.last_payment_error?.message);
    }

    // ── Tenant plan lifecycle ────────────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const cs = event.data.object as Stripe.Checkout.Session;
      if (cs.mode === "subscription") {
        const tenantId = cs.metadata?.tenant_id;
        const plan     = cs.metadata?.target_plan;
        if (tenantId && plan) {
          const supabase = createSupabaseAdminClient();
          await supabase
            .from("tenants")
            .update({ plan, stripe_customer_id: cs.customer as string })
            .eq("id", tenantId);
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const sub      = event.data.object as Stripe.Subscription;
      const tenantId = sub.metadata?.tenant_id;
      if (tenantId) {
        // Prefer metadata plan; fall back to reverse-lookup of current price
        let plan: string | null = sub.metadata?.target_plan ?? null;
        if (!plan) {
          const priceId = sub.items.data[0]?.price?.id;
          plan = priceId ? getPlanFromPriceId(priceId) : null;
        }
        if (plan) {
          const supabase = createSupabaseAdminClient();
          await supabase.from("tenants").update({ plan }).eq("id", tenantId);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub      = event.data.object as Stripe.Subscription;
      const tenantId = sub.metadata?.tenant_id;
      if (tenantId) {
        const supabase = createSupabaseAdminClient();
        await supabase.from("tenants").update({ plan: "free" }).eq("id", tenantId);
      }
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : null;
      if (subscriptionId && invoice.amount_paid > 0) {
        try {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const affiliateCode = subscription.metadata?.affiliate_code;
          if (affiliateCode) {
            await recordAffiliateCommission({
              affiliateCode,
              product:        subscription.metadata?.bluu_product ?? "hosting_mgmt",
              conversionType: "paid_subscription",
              grossAmount:    invoice.amount_paid / 100,
              currency:       invoice.currency.toUpperCase(),
              externalRef:    invoice.id,
            });
          }
        } catch (err) {
          console.error("[stripe-webhook] affiliate commission error:", err);
        }
      }
    }
  } catch (err) {
    console.error("[stripe-webhook] processEvent error:", err);
  }
}

const COMMISSION_RATES: Record<string, number> = {
  scan_tool: 0.30, portal: 0.30, hosting_mgmt: 0.30, content_ops: 0.15, web_dev: 0.10, ai_integration: 0.10,
};

async function recordAffiliateCommission(params: {
  affiliateCode:  string;
  product:        string;
  conversionType: string;
  grossAmount:    number;
  currency:       string;
  externalRef:    string;
}): Promise<void> {
  const { affiliateCode, product, grossAmount, externalRef } = params;
  const rate = COMMISSION_RATES[product] ?? 0.10;
  const commissionAmount = parseFloat((grossAmount * rate).toFixed(2));
  const period = new Date().toISOString().slice(0, 7); // YYYY-MM

  await wpRestFetch("/wp/v2/bluu_aff_commission", {
    method: "POST",
    body: JSON.stringify({
      status: "publish",
      title:  `Commission — ${affiliateCode} — ${product} — ${period}`,
      meta: {
        affiliate_code:    affiliateCode,
        product,
        commission_type:   "recurring",
        period,
        gross_amount:      grossAmount,
        commission_rate:   rate,
        commission_amount: commissionAmount,
        commission_status: "pending",
        external_ref:      externalRef,
      },
    }),
  });
}

async function sendReceiptEmail(invoiceId: number, paymentRef: string): Promise<void> {
  try {
    const { getInvoice } = await import("@/lib/wp-api");
    const { wpRestFetch } = await import("@/lib/wp-api");
    const invoice = await getInvoice(invoiceId);
    const wpUser = await wpRestFetch<{ email: string }>(`/wp/v2/users/${invoice.acf.inv_client}`).catch(() => null);
    if (!wpUser?.email) return;

    await sendEmailHtml({
      to: wpUser.email,
      subject: `Payment received — Invoice ${invoice.acf.inv_number}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#1e293b">Payment Received</h2>
        <p>Thank you — your payment of <strong>${invoice.acf.inv_currency} ${invoice.acf.inv_total.toLocaleString()}</strong> for invoice <strong>${invoice.acf.inv_number}</strong> has been received.</p>
        <p style="color:#64748b;font-size:13px">Reference: ${paymentRef}</p>
      </div>`,
      text: `Payment received for invoice ${invoice.acf.inv_number}. Ref: ${paymentRef}`,
      tags: [{ name: "type", value: "payment_receipt" }],
    });
  } catch (err) {
    console.error("[sendReceiptEmail]", err);
  }
}
