import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});

/** Create a Stripe customer for a client. */
export async function createStripeCustomer(params: {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata ?? {},
  });
  return customer.id;
}

/** Create a one-time payment link for an invoice. */
export async function createInvoicePaymentLink(params: {
  invoiceId: string;
  invoiceNumber: string;
  clientEmail: string;
  amount: number; // in smallest currency unit (cents)
  currency: string;
  description: string;
}): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.clientEmail,
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: { name: `Invoice ${params.invoiceNumber}`, description: params.description },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    metadata: { bluuhq_invoice_id: params.invoiceId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices/${params.invoiceId}?paid=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/invoices/${params.invoiceId}`,
  });
  return session.url!;
}

/** Create a recurring subscription in Stripe. */
export async function createStripeSubscription(params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    metadata: params.metadata ?? {},
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
}

/** Construct and validate a Stripe webhook event. */
export function constructStripeWebhookEvent(
  payload: Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
