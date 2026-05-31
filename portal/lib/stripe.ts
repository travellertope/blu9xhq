import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-05-27.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

/** Create a Stripe customer for a client. */
export async function createStripeCustomer(params: {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}): Promise<string> {
  const customer = await getStripe().customers.create({
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
  const session = await getStripe().checkout.sessions.create({
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
  return getStripe().subscriptions.create({
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
  return getStripe().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}

// ─── Payment method management ────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export async function createSetupIntent(
  customerId: string
): Promise<{ clientSecret: string }> {
  const si = await getStripe().setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });
  return { clientSecret: si.client_secret! };
}

export async function listPaymentMethods(
  customerId: string
): Promise<PaymentMethod[]> {
  const [methods, customer] = await Promise.all([
    getStripe().paymentMethods.list({ customer: customerId, type: "card" }),
    getStripe().customers.retrieve(customerId),
  ]);
  const defaultPmId =
    !customer.deleted &&
    typeof customer.invoice_settings?.default_payment_method === "string"
      ? customer.invoice_settings.default_payment_method
      : null;
  return methods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? "card",
    last4: pm.card?.last4 ?? "****",
    expMonth: pm.card?.exp_month ?? 0,
    expYear: pm.card?.exp_year ?? 0,
    isDefault: pm.id === defaultPmId,
  }));
}

export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<void> {
  await getStripe().customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
  });
}

export async function detachPaymentMethod(paymentMethodId: string): Promise<void> {
  await getStripe().paymentMethods.detach(paymentMethodId);
}

/** Charge an existing saved payment method against an invoice. */
export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId: string;
  invoiceId: string;
}): Promise<{ clientSecret: string; paymentIntentId: string; status: string }> {
  const pi = await getStripe().paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    customer: params.customerId,
    payment_method: params.paymentMethodId,
    confirm: true,
    metadata: { invoiceId: params.invoiceId },
    return_url:
      (process.env.NEXTAUTH_URL ?? "") + "/portal/invoices/" + params.invoiceId,
  });
  return { clientSecret: pi.client_secret!, paymentIntentId: pi.id, status: pi.status };
}

/** Create a PaymentIntent for new-card flow (client confirms via Stripe.js). */
export async function createPaymentIntentForNewCard(params: {
  amount: number;
  currency: string;
  customerId: string;
  invoiceId: string;
}): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const pi = await getStripe().paymentIntents.create({
    amount: params.amount,
    currency: params.currency.toLowerCase(),
    customer: params.customerId,
    metadata: { invoiceId: params.invoiceId },
    setup_future_usage: "off_session",
  });
  return { clientSecret: pi.client_secret!, paymentIntentId: pi.id };
}
