import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";

// Cache Stripe instances per tenant to avoid re-creating
const stripeCache = new Map<string, Stripe>();

export async function getTenantStripe(tenantId: string): Promise<Stripe | null> {
  if (stripeCache.has(tenantId)) return stripeCache.get(tenantId)!;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("tenants")
    .select("payment_stripe_secret_key_enc")
    .eq("id", tenantId)
    .single();
  if (!data?.payment_stripe_secret_key_enc) return null;
  const secretKey = decrypt(data.payment_stripe_secret_key_enc);
  const stripe = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });
  stripeCache.set(tenantId, stripe);
  return stripe;
}

export async function getTenantPaystackKey(tenantId: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("tenants")
    .select("payment_paystack_secret_key_enc")
    .eq("id", tenantId)
    .single();
  if (!data?.payment_paystack_secret_key_enc) return null;
  return decrypt(data.payment_paystack_secret_key_enc);
}

export async function selectGateway(tenantId: string, currency: string): Promise<"stripe" | "paystack" | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("tenants")
    .select("payment_preferred_gateway, payment_stripe_secret_key_enc, payment_paystack_secret_key_enc")
    .eq("id", tenantId)
    .single();
  if (!data) return null;
  const hasStripe = !!data.payment_stripe_secret_key_enc;
  const hasPaystack = !!data.payment_paystack_secret_key_enc;
  const pref = data.payment_preferred_gateway;
  if (pref === "stripe" && hasStripe) return "stripe";
  if (pref === "paystack" && hasPaystack) return "paystack";
  // Auto: Paystack for NGN/GHS, Stripe for others
  if (["NGN", "GHS"].includes(currency.toUpperCase())) {
    return hasPaystack ? "paystack" : hasStripe ? "stripe" : null;
  }
  return hasStripe ? "stripe" : hasPaystack ? "paystack" : null;
}

export async function getTenantPaymentConfig(tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("tenants")
    .select("payment_preferred_gateway, payment_stripe_publishable_key, payment_paystack_public_key, payment_stripe_secret_key_enc, payment_paystack_secret_key_enc")
    .eq("id", tenantId)
    .single();
  if (!data) return null;
  return {
    preferredGateway: data.payment_preferred_gateway ?? "auto",
    hasStripe: !!data.payment_stripe_secret_key_enc,
    hasPaystack: !!data.payment_paystack_secret_key_enc,
    stripePublishableKey: data.payment_stripe_publishable_key ?? null,
    paystackPublicKey: data.payment_paystack_public_key ?? null,
  };
}
