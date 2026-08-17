import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { markInvoicePaid } from "@/lib/invoicePaymentWebhook";
import Stripe from "stripe";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = params;

  // Read raw body for signature verification
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Fetch tenant webhook secret
  const supabase = createSupabaseAdminClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("payment_stripe_webhook_secret_enc, payment_stripe_secret_key_enc")
    .eq("id", tenantId)
    .single();

  if (!tenant?.payment_stripe_webhook_secret_enc || !tenant?.payment_stripe_secret_key_enc) {
    return NextResponse.json({ error: "Tenant not configured" }, { status: 404 });
  }

  const webhookSecret = decrypt(tenant.payment_stripe_webhook_secret_enc);
  const secretKey = decrypt(tenant.payment_stripe_secret_key_enc);
  const stripe = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe webhook] signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;

    if (invoiceId) {
      try {
        await markInvoicePaid({
          invoiceId,
          tenantId,
          gateway: "stripe",
          gatewayRef: session.payment_intent as string || session.id,
        });
      } catch (err) {
        console.error("[Stripe webhook] markInvoicePaid failed:", err);
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
