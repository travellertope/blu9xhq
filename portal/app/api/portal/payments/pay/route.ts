import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch, findClientByWpUserId, getInvoice, updateInvoice, getSubscription } from "@/lib/wp-api";
import { createPaymentIntent, listPaymentMethods } from "@/lib/stripe";
import { chargePaystackCard } from "@/lib/paystack";
import { sendEmail } from "@/lib/resend";
import type { WPUser } from "@/lib/wp-api";
import crypto from "crypto";

// Rate limit: 3 attempts per minute per wpUserId
const payAttempts = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(wpUserId: number): boolean {
  const now = Date.now();
  const entry = payAttempts.get(wpUserId);
  if (!entry || entry.resetAt < now) {
    payAttempts.set(wpUserId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as {
    wpUserId?: number;
    email?: string | null;
    name?: string | null;
  };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  if (!checkRateLimit(wpUserId)) {
    return NextResponse.json({ error: "Too many payment attempts. Please wait a minute." }, { status: 429 });
  }

  let body: { invoiceId?: number; paymentMethodId?: string; paystackAuthCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { invoiceId, paymentMethodId, paystackAuthCode } = body;
  if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const invoice = await getInvoice(invoiceId);
    if (invoice.acf.inv_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!["sent", "overdue"].includes(invoice.acf.inv_status)) {
      return NextResponse.json({ error: "Invoice is not payable" }, { status: 400 });
    }

    let paymentGateway = "stripe";
    if (invoice.acf.inv_subscription) {
      try {
        const sub = await getSubscription(invoice.acf.inv_subscription);
        paymentGateway = sub.acf.payment_gateway ?? "stripe";
      } catch {
        // default to stripe
      }
    }

    const amountInSmallestUnit = Math.round(invoice.acf.inv_total * 100);
    const now = new Date().toISOString();

    if (paymentGateway === "paystack" && paystackAuthCode) {
      const email = user.email ?? clientPost.acf.portal_email;
      const reference = `inv_${invoiceId}_${crypto.randomBytes(6).toString("hex")}`;
      const result = await chargePaystackCard({
        authorizationCode: paystackAuthCode,
        email,
        amount: amountInSmallestUnit,
        reference,
        metadata: { invoiceId: String(invoiceId) },
      });

      if (result.status === "success") {
        await updateInvoice(invoiceId, {
          acf: {
            inv_status: "paid",
            inv_paid_at: now,
            inv_payment_method: "paystack",
            inv_payment_gateway_ref: result.reference,
          },
        });
        void sendPaymentReceiptEmail(invoice.acf.inv_number, invoice.acf.inv_total, invoice.acf.inv_currency, user.email ?? "");
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: false, error: "Payment failed" });
    }

    // Stripe path
    if (!paymentMethodId) return NextResponse.json({ error: "paymentMethodId required" }, { status: 400 });

    const wpUser = await wpRestFetch<WPUser>(`/wp/v2/users/${wpUserId}`);
    const customerId = String(wpUser.meta.client_stripe_customer_id ?? "");
    if (!customerId) return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });

    const methods = await listPaymentMethods(customerId);
    if (!methods.some((m) => m.id === paymentMethodId)) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 400 });
    }

    const result = await createPaymentIntent({
      amount: amountInSmallestUnit,
      currency: invoice.acf.inv_currency,
      customerId,
      paymentMethodId,
      invoiceId: String(invoiceId),
    });

    if (result.status === "succeeded") {
      await updateInvoice(invoiceId, {
        acf: {
          inv_status: "paid",
          inv_paid_at: now,
          inv_payment_method: "stripe",
          inv_payment_gateway_ref: result.paymentIntentId,
        },
      });
      void sendPaymentReceiptEmail(invoice.acf.inv_number, invoice.acf.inv_total, invoice.acf.inv_currency, user.email ?? "");
      return NextResponse.json({ success: true });
    }

    if (result.status === "requires_action") {
      return NextResponse.json({
        success: false,
        requiresAction: true,
        clientSecret: result.clientSecret,
      });
    }

    return NextResponse.json({ success: false, error: "Payment failed" });
  } catch (err) {
    console.error("[POST /api/portal/payments/pay]", err);
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 });
  }
}

async function sendPaymentReceiptEmail(
  invoiceNumber: string,
  amount: number,
  currency: string,
  email: string
): Promise<void> {
  if (!email) return;
  try {
    await sendEmail({
      to: email,
      subject: `Payment received — Invoice ${invoiceNumber}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#1e293b">Payment Received</h2>
        <p>Thank you — your payment of <strong>${currency} ${amount.toLocaleString()}</strong> for invoice <strong>${invoiceNumber}</strong> has been received.</p>
        <p style="color:#64748b;font-size:13px">You can view your invoice history in your <a href="${process.env.NEXTAUTH_URL}/portal/invoices">client portal</a>.</p>
      </div>`,
      text: `Payment received: ${currency} ${amount} for invoice ${invoiceNumber}.`,
      tags: [{ name: "type", value: "payment_receipt" }],
    });
  } catch (err) {
    console.error("[sendPaymentReceiptEmail]", err);
  }
}
