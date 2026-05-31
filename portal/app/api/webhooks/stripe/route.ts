export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { constructStripeWebhookEvent } from "@/lib/stripe";
import { listInvoices, updateInvoice } from "@/lib/wp-api";
import { sendEmailHtml } from "@/lib/resend";
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
  } catch (err) {
    console.error("[stripe-webhook] processEvent error:", err);
  }
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
