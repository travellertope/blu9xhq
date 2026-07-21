export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook } from "@/lib/paystack";
import { listInvoices, updateInvoice } from "@/lib/wp-api";
import { sendEmailHtml } from "@/lib/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { PaidPlan } from "@/lib/paystack-products";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifyPaystackWebhook(body, signature)) {
    console.error("[paystack-webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  void processPaystackEvent(event);
  return NextResponse.json({ received: true });
}

function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "starter" || value === "pro" || value === "agency";
}

async function processPaystackEvent(event: {
  event: string;
  data: Record<string, unknown>;
}): Promise<void> {
  try {
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = String(data.reference ?? "");
      const metadata = (data.metadata ?? {}) as Record<string, unknown>;

      // Tenant SaaS-plan subscription charge (from /api/billing/paystack/checkout).
      // Renewal charges don't carry our custom metadata (only the original
      // /transaction/initialize call does) — this naturally no-ops on
      // renewals, which is correct, since the plan is already set.
      const tenantId = metadata.tenant_id;
      const targetPlan = metadata.target_plan;
      if (typeof tenantId === "string" && isPaidPlan(targetPlan)) {
        const customer = data.customer as { customer_code?: string } | undefined;
        const supabase = createSupabaseAdminClient();
        await supabase
          .from("tenants")
          .update({
            plan: targetPlan,
            billing_provider: "paystack",
            paystack_customer_code: customer?.customer_code ?? null,
          })
          .eq("id", tenantId);
        return;
      }

      // Agency-to-client invoice charge (WP-backed invoicing system).
      const invoiceId = parseInt(String(metadata.invoiceId ?? "0"), 10);
      const paidAt = String(data.paid_at ?? new Date().toISOString());

      if (!invoiceId) {
        console.log("[paystack-webhook] charge.success with no invoiceId — may be auth charge");
        return;
      }

      await updateInvoice(invoiceId, {
        acf: {
          inv_status: "paid",
          inv_paid_at: paidAt,
          inv_payment_method: "paystack",
          inv_payment_gateway_ref: reference,
        },
      });

      await sendPaystackReceiptEmail(invoiceId, reference).catch(console.error);
    }

    if (event.event === "subscription.create") {
      const data = event.data;
      const customer = data.customer as { customer_code?: string } | undefined;
      const subscriptionCode = data.subscription_code;
      const emailToken = data.email_token;
      if (customer?.customer_code && typeof subscriptionCode === "string" && typeof emailToken === "string") {
        const supabase = createSupabaseAdminClient();
        // subscription.create's payload doesn't carry our tenant_id metadata,
        // so it's matched by the customer_code charge.success already
        // stored — if this arrives first (ordering isn't guaranteed), it's
        // a no-op and the cancel button just won't work until a later
        // renewal event fills it in.
        await supabase
          .from("tenants")
          .update({ paystack_subscription_code: subscriptionCode, paystack_email_token: emailToken })
          .eq("paystack_customer_code", customer.customer_code);
      }
    }

    if (event.event === "subscription.disable") {
      const data = event.data;
      const subscriptionCode = data.subscription_code;
      if (typeof subscriptionCode === "string") {
        const supabase = createSupabaseAdminClient();
        await supabase
          .from("tenants")
          .update({ plan: "free" })
          .eq("paystack_subscription_code", subscriptionCode);
      }
    }

    if (event.event === "charge.failed") {
      console.error("[paystack-webhook] charge failed:", event.data.reference);
    }
  } catch (err) {
    console.error("[paystack-webhook] processEvent error:", err);
  }
}

async function sendPaystackReceiptEmail(invoiceId: number, reference: string): Promise<void> {
  try {
    const { getInvoice } = await import("@/lib/wp-api");
    const { wpRestFetch } = await import("@/lib/wp-api");
    const invoice = await getInvoice(invoiceId);

    const allInvoices = await listInvoices({ clientId: invoice.acf.inv_client, per_page: 1 });
    const clientResult = allInvoices.items[0];
    if (!clientResult) return;

    const wpUser = await wpRestFetch<{ email: string }>(
      `/wp/v2/users/${invoice.acf.inv_client}`
    ).catch(() => null);
    if (!wpUser?.email) return;

    await sendEmailHtml({
      to: wpUser.email,
      subject: `Payment received — Invoice ${invoice.acf.inv_number}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2>Payment Received</h2>
        <p>Your payment of <strong>${invoice.acf.inv_currency} ${invoice.acf.inv_total.toLocaleString()}</strong> for invoice <strong>${invoice.acf.inv_number}</strong> has been received.</p>
        <p style="color:#64748b;font-size:13px">Reference: ${reference}</p>
      </div>`,
      text: `Payment received for invoice ${invoice.acf.inv_number}. Ref: ${reference}`,
      tags: [{ name: "type", value: "payment_receipt" }],
    });
  } catch (err) {
    console.error("[sendPaystackReceiptEmail]", err);
  }
}
