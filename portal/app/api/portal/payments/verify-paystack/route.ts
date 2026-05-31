import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, listInvoices, updateInvoice } from "@/lib/wp-api";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { sendEmailHtml } from "@/lib/resend";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; email?: string | null };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const tx = await verifyPaystackTransaction(reference);
    if (tx.status !== "success") {
      return NextResponse.json({ success: false, error: "Payment not successful" });
    }

    // Find the invoice by payment gateway ref
    const invoicesResult = await listInvoices({ clientId: clientPost.id, per_page: 100 });
    const invoice = invoicesResult.items.find(
      (inv) =>
        inv.acf.inv_payment_gateway_ref === reference ||
        ["sent", "overdue"].includes(inv.acf.inv_status)
    );

    if (!invoice) return NextResponse.json({ success: true, invoiceId: null });

    await updateInvoice(invoice.id, {
      acf: {
        inv_status: "paid",
        inv_paid_at: tx.paidAt,
        inv_payment_method: "paystack",
        inv_payment_gateway_ref: reference,
      },
    });

    try {
      await sendEmailHtml({
        to: user.email ?? "",
        subject: `Payment received — Invoice ${invoice.acf.inv_number}`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Payment Received</h2>
          <p>Your payment of <strong>${invoice.acf.inv_currency} ${invoice.acf.inv_total.toLocaleString()}</strong> for invoice <strong>${invoice.acf.inv_number}</strong> has been received.</p>
        </div>`,
        text: `Payment received for invoice ${invoice.acf.inv_number}.`,
        tags: [{ name: "type", value: "payment_receipt" }],
      });
    } catch {
      // receipt email failure is non-fatal
    }

    return NextResponse.json({ success: true, invoiceId: invoice.id });
  } catch (err) {
    console.error("[GET /api/portal/payments/verify-paystack]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
