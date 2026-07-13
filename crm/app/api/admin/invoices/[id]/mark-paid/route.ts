import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmailHtml } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { exitEnrollmentsForClient } from "@/lib/sequenceExits";

const GATEWAY_MAP: Record<string, string> = { stripe: "stripe", paystack: "paystack" };

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(req, "mark_invoices_paid");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;
  const tenantId = user.tenantId!;

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
    const supabase = createSupabaseServerClient();

    const { data: invoice, error: fetchErr } = await supabase
      .from("invoices")
      .select("*, clients(contact_name, company_name, contact_email, portal_email)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const { error: updateErr } = await supabase
      .from("invoices")
      .update({
        status:             "paid",
        paid_date:          body.paidAt,
        payment_method:     body.paymentMethod,
        payment_gateway:    GATEWAY_MAP[body.paymentMethod] ?? "manual",
        gateway_payment_id: body.reference || null,
      })
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (updateErr) throw updateErr;

    // Send payment receipt email
    try {
      const clientEmail = invoice.clients?.portal_email ?? invoice.clients?.contact_email;
      const clientName  = invoice.clients?.contact_name || invoice.clients?.company_name || "there";

      if (clientEmail) {
        const invNumber = invoice.invoice_number;
        const total = invoice.total;
        const currency = invoice.currency;

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

    // Exit sequences with invoice_paid condition (fire and forget)
    void exitEnrollmentsForClient(invoice.client_id, "invoice_paid").catch(console.error);

    await logAuditEvent({
      action: AUDIT_ACTIONS.INVOICE_MARKED_PAID,
      actorName: user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail: `Marked invoice ${invoice.invoice_number} as paid via ${body.paymentMethod}`,
      clientId: invoice.client_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/invoices/[id]/mark-paid]", err);
    return NextResponse.json({ error: "Failed to mark invoice as paid" }, { status: 502 });
  }
}
