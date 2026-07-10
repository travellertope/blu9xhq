import { createHmac } from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Paystack request failed");
  return json.data as T;
}

export interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
}

export interface PaystackTransaction {
  authorization_url: string;
  access_code: string;
  reference: string;
}

/** Create a Paystack customer. */
export async function createPaystackCustomer(params: {
  email: string;
  first_name: string;
  last_name: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackCustomer> {
  return paystackFetch<PaystackCustomer>("/customer", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** Initialize a Paystack transaction (one-time payment). */
export async function initializePaystackTransaction(params: {
  email: string;
  amount: number; // in kobo / pesewas / minor unit
  currency: string;
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackTransaction> {
  return paystackFetch<PaystackTransaction>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** Verify a Paystack transaction by reference. */
export async function verifyPaystackTransaction(
  reference: string
): Promise<{ status: string; amount: number; currency: string; paidAt: string }> {
  const data = await paystackFetch<{
    status: string;
    amount: number;
    currency: string;
    paid_at: string;
  }>(`/transaction/verify/${reference}`);
  return {
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    paidAt: data.paid_at,
  };
}

// ─── Saved card management ────────────────────────────────────────────────────

export interface PaystackCard {
  authorizationCode: string;
  bin: string;
  last4: string;
  expMonth: string;
  expYear: string;
  cardType: string;
  isDefault: boolean;
}

interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  card_type: string;
  channel: string;
  reusable: boolean;
}

interface PaystackCustomerDetail {
  email: string;
  customer_code: string;
  authorizations: PaystackAuthorization[];
  metadata?: { default_authorization?: string };
}

export async function listPaystackCards(customerId: string): Promise<PaystackCard[]> {
  const customer = await paystackFetch<PaystackCustomerDetail>(
    `/customer/${customerId}`
  );
  const defaultCode = customer.metadata?.default_authorization ?? null;
  return (customer.authorizations ?? [])
    .filter((a) => a.channel === "card" && a.reusable)
    .map((a) => ({
      authorizationCode: a.authorization_code,
      bin: a.bin,
      last4: a.last4,
      expMonth: a.exp_month,
      expYear: a.exp_year,
      cardType: a.card_type,
      isDefault: a.authorization_code === defaultCode,
    }));
}

export async function chargePaystackCard(params: {
  authorizationCode: string;
  email: string;
  amount: number;
  reference: string;
  metadata?: object;
}): Promise<{ status: string; reference: string }> {
  const data = await paystackFetch<{ status: string; reference: string }>(
    "/transaction/charge_authorization",
    {
      method: "POST",
      body: JSON.stringify({
        authorization_code: params.authorizationCode,
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        metadata: params.metadata ?? {},
      }),
    }
  );
  return data;
}

/** Create a Paystack subscription plan. */
export async function createPaystackPlan(params: {
  name: string;
  interval: "monthly" | "quarterly" | "annually";
  amount: number;
  currency?: string;
}): Promise<{ plan_code: string }> {
  return paystackFetch("/plan", { method: "POST", body: JSON.stringify(params) });
}

/** Subscribe a customer to a plan. */
export async function createPaystackSubscription(params: {
  customer: string; // customer_code or email
  plan: string;     // plan_code
  start_date?: string; // ISO 8601
}): Promise<{ subscription_code: string; email_token: string }> {
  return paystackFetch("/subscription", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** Verify a Paystack webhook signature. */
export function verifyPaystackWebhook(
  body: string,
  signature: string
): boolean {
  const hash = createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}
