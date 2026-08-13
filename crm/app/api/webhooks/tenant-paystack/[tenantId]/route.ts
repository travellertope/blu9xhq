import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { markInvoicePaid } from "@/lib/invoicePaymentWebhook";

export const maxDuration = 30;
export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  const { tenantId } = params;

  const rawBody = await req.text();
  const sig = req.headers.get("x-paystack-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Fetch tenant Paystack secret key
  const supabase = createSupabaseAdminClient();
  const { data: tenant } = await supabase
    .from("tenants")
    .select("payment_paystack_secret_key_enc")
    .eq("id", tenantId)
    .single();

  if (!tenant?.payment_paystack_secret_key_enc) {
    return NextResponse.json({ error: "Tenant not configured" }, { status: 404 });
  }

  const secretKey = decrypt(tenant.payment_paystack_secret_key_enc);

  // Verify HMAC signature
  const expectedSig = createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  if (sig !== expectedSig) {
    console.error("[Paystack webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const invoiceId = event.data?.metadata?.invoice_id;

    if (invoiceId) {
      try {
        await markInvoicePaid({
          invoiceId,
          tenantId,
          gateway: "paystack",
          gatewayRef: event.data.reference || event.data.id?.toString() || "",
        });
      } catch (err) {
        console.error("[Paystack webhook] markInvoicePaid failed:", err);
        return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
