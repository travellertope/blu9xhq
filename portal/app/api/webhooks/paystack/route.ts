export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhook } from "@/lib/paystack";
import { listInvoices, updateInvoice } from "@/lib/wp-api";
import { sendEmail } from "@/lib/resend";

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

async function processPaystackEvent(event: {
  event: string;
  data: Record<string, unknown>;
}): Promise<void> {
  try {
    if (event.event === "charge.success") {
      const data = event.data;
      const reference = String(data.reference ?? "");
      const metadata = (data.metadata ?? {}) as Record<string, unknown>;
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

    await sendEmail({
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
