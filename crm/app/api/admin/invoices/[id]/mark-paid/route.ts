import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendEmailHtml } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { exitEnrollmentsForClient } from "@/lib/sequenceExits";

const GATEWAY_MAP: Record<string, string> = { stripe: "stripe", paystack: "paystack" };

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.warn("[mark-paid] A: pre-requirePermission");
  const auth = await requirePermission(req, "mark_invoices_paid");
  console.warn("[mark-paid] B: post-requirePermission, isNextResponse=", auth instanceof NextResponse);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;
  const tenantId = user.tenantId!;

  let body: {
    paymentMethod: string;
    paidAt: string;
    reference?: string;
  };

  console.warn("[mark-paid] C: pre-req.json");
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  console.warn("[mark-paid] D: post-req.json, method=", body.paymentMethod, "paidAt=", body.paidAt);

  if (!body.paymentMethod || !body.paidAt) {
    return NextResponse.json({ error: "paymentMethod and paidAt are required" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[mark-paid] SUPABASE_SERVICE_ROLE_KEY is not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    console.warn("[mark-paid] step1 tenantId=", tenantId, "invoiceId=", params.id);
    const supabase = createSupabaseAdminClient();

    console.warn("[mark-paid] step2 fetching invoice");
    const { data: invoice, error: fetchErr } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, currency, client_id, clients(contact_name, company_name, contact_email)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    console.warn("[mark-paid] step3 fetch done", !!invoice, fetchErr?.code, fetchErr?.message);
    if (fetchErr) throw fetchErr;
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    console.warn("[mark-paid] step4 updating invoice");
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
    console.warn("[mark-paid] step5 update done", updateErr?.code, updateErr?.message);
    if (updateErr) throw updateErr;

    // Send payment receipt email — fire and forget so a slow/failing email
    // never blocks the invoice from being marked paid.
    const clientEmail = invoice.clients?.contact_email;
    const clientName  = invoice.clients?.contact_name || invoice.clients?.company_name || "there";
    if (clientEmail) {
      const invNumber = invoice.invoice_number;
      const total = invoice.total;
      const currency = invoice.currency;
      void sendEmailHtml({
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
      }).catch((emailErr) => console.error("[mark-paid] Failed to send receipt email:", emailErr));
    }

    // Exit sequences with invoice_paid condition (fire and forget)
    void exitEnrollmentsForClient(invoice.client_id, "invoice_paid").catch(console.error);

    void logAuditEvent({
      action: AUDIT_ACTIONS.INVOICE_MARKED_PAID,
      actorName: user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail: `Marked invoice ${invoice.invoice_number} as paid via ${body.paymentMethod}`,
      clientId: invoice.client_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // warn-level so it surfaces in Vercel log exports (error-level is filtered out)
    console.warn("[mark-paid] DB error:", err?.code, err?.message, err?.details, err?.hint);
    return NextResponse.json({ error: "Failed to mark invoice as paid", detail: err?.message }, { status: 502 });
  }
}
