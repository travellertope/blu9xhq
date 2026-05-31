import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { getInvoice, updateInvoice, getClientPost } from "@/lib/wp-api";
import { sendEmailHtml } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let invoice;
  try {
    invoice = await getInvoice(postId);
  } catch {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const clientId = invoice.acf.inv_client;
  const auth = await requirePermission(req, "mark_invoices_paid", clientId);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;

  let body: {
    paymentMethod: string;
    paidAt: string;
    reference?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.paymentMethod || !body.paidAt) {
    return NextResponse.json({ error: "paymentMethod and paidAt are required" }, { status: 400 });
  }

  try {
    await updateInvoice(postId, {
      acf: {
        inv_status: "paid",
        inv_paid_at: body.paidAt,
        inv_payment_method: body.paymentMethod,
        inv_payment_gateway_ref: body.reference,
      },
    });

    // Send payment receipt email
    try {
      const clientPost = await getClientPost(clientId);
      const clientEmail = clientPost.acf.portal_email ?? clientPost.acf.contact_email;
      const clientName = clientPost.acf.contact_name || clientPost.title.rendered;

      if (clientEmail) {
        const invNumber = invoice.acf.inv_number;
        const total = invoice.acf.inv_total;
        const currency = invoice.acf.inv_currency;

        await sendEmailHtml({
          to: clientEmail,
          subject: `Payment received — Invoice ${invNumber}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
              <h2>Payment Received</h2>
              <p>Hi ${clientName},</p>
              <p>We have received your payment for invoice ${invNumber}. Thank you!</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px 0;color:#64748b">Invoice Number</td><td style="padding:8px 0;font-weight:600">${invNumber}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">Amount Paid</td><td style="padding:8px 0;font-weight:600">${currency} ${total?.toLocaleString()}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">Payment Date</td><td style="padding:8px 0">${body.paidAt}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b">Payment Method</td><td style="padding:8px 0">${body.paymentMethod.replace("_", " ")}</td></tr>
                ${body.reference ? `<tr><td style="padding:8px 0;color:#64748b">Reference</td><td style="padding:8px 0">${body.reference}</td></tr>` : ""}
              </table>
              <p style="color:#64748b;font-size:13px">This is your payment receipt. Please keep it for your records.</p>
            </div>
          `,
          text: `Payment received for Invoice ${invNumber}.\n\nAmount: ${currency} ${total}\nDate: ${body.paidAt}\nMethod: ${body.paymentMethod}`,
          tags: [{ name: "type", value: "payment_receipt" }],
        });
      }
    } catch (emailErr) {
      console.error("[mark-paid] Failed to send receipt email:", emailErr);
    }

    await logAuditEvent({
      action: AUDIT_ACTIONS.INVOICE_MARKED_PAID,
      actorName: user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail: `Marked invoice ${invoice.acf.inv_number} as paid via ${body.paymentMethod}`,
      clientId,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/invoices/[id]/mark-paid]", err);
    return NextResponse.json({ error: "Failed to mark invoice as paid" }, { status: 502 });
  }
}
