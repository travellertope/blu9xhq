import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { encrypt, decrypt } from "@/lib/encryption";

export const maxDuration = 30;

function maskKey(enc: string | null): string {
  if (!enc) return "";
  try {
    const raw = decrypt(enc);
    return raw.length > 4 ? `...${raw.slice(-4)}` : "****";
  } catch {
    return "****";
  }
}

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "access_settings")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tenantId = session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tenants")
      .select(
        "payment_stripe_secret_key_enc, payment_stripe_publishable_key, payment_stripe_webhook_secret_enc, payment_paystack_secret_key_enc, payment_paystack_public_key, payment_preferred_gateway"
      )
      .eq("id", tenantId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      stripeSecretKey: maskKey(data.payment_stripe_secret_key_enc),
      stripePublishableKey: data.payment_stripe_publishable_key ?? "",
      stripeWebhookSecret: maskKey(data.payment_stripe_webhook_secret_enc),
      paystackSecretKey: maskKey(data.payment_paystack_secret_key_enc),
      paystackPublicKey: data.payment_paystack_public_key ?? "",
      preferredGateway: data.payment_preferred_gateway ?? "auto",
    });
  } catch (err) {
    console.error("[GET /api/admin/settings/payment-gateways]", err);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.role, "access_settings")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tenantId = session.user.tenantId!;

  if (session.user.tenantPlan === "free") {
    return NextResponse.json({ error: "Upgrade to a paid plan to configure online payments" }, { status: 403 });
  }

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const update: Record<string, string> = {};

  if ("stripeSecretKey" in body && body.stripeSecretKey && !body.stripeSecretKey.startsWith("...")) {
    update.payment_stripe_secret_key_enc = encrypt(body.stripeSecretKey);
  }
  if ("stripePublishableKey" in body) {
    update.payment_stripe_publishable_key = body.stripePublishableKey;
  }
  if ("stripeWebhookSecret" in body && body.stripeWebhookSecret && !body.stripeWebhookSecret.startsWith("...")) {
    update.payment_stripe_webhook_secret_enc = encrypt(body.stripeWebhookSecret);
  }
  if ("paystackSecretKey" in body && body.paystackSecretKey && !body.paystackSecretKey.startsWith("...")) {
    update.payment_paystack_secret_key_enc = encrypt(body.paystackSecretKey);
  }
  if ("paystackPublicKey" in body) {
    update.payment_paystack_public_key = body.paystackPublicKey;
  }
  if ("preferredGateway" in body) {
    const allowed = ["stripe", "paystack", "auto"];
    if (!allowed.includes(body.preferredGateway)) {
      return NextResponse.json({ error: "Invalid preferredGateway" }, { status: 400 });
    }
    update.payment_preferred_gateway = body.preferredGateway;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("tenants")
      .update(update)
      .eq("id", tenantId);

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/settings/payment-gateways]", err);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
