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
): Promise<{ status: string; amount: number; currency: string }> {
  return paystackFetch(`/transaction/verify/${reference}`);
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
  const crypto = require("crypto");
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}
