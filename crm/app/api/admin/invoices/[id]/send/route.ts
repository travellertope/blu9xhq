import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendEmailHtml } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(req, "create_invoices");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const user = session.user as any;
  const tenantId = user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();

    const { data: invoice, error: fetchErr } = await supabase
      .from("invoices")
      .select("*, clients(contact_name, company_name, contact_email, portal_email)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const clientEmail = invoice.clients?.portal_email ?? invoice.clients?.contact_email;
    const clientName  = invoice.clients?.contact_name || invoice.clients?.company_name || "there";

    if (!clientEmail) {
      return NextResponse.json({ error: "Client has no email address" }, { status: 400 });
    }

    const invNumber = invoice.invoice_number;
    const total = invoice.total;
    const currency = invoice.currency;
    const dueDate = invoice.due_date;
    const portalUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    await sendEmailHtml({
      to: clientEmail,
      subject: `Invoice ${invNumber} from BluuHQ`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Invoice ${invNumber}</h2>
          <p>Hi ${clientName},</p>
          <p>Please find your invoice details below:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;color:#64748b">Invoice Number</td><td style="padding:8px 0;font-weight:600">${invNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Amount Due</td><td style="padding:8px 0;font-weight:600">${currency} ${total?.toLocaleString()}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Due Date</td><td style="padding:8px 0">${dueDate}</td></tr>
          </table>
          <p>
            <a href="${portalUrl}/portal" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
              View Invoice
            </a>
          </p>
          <p style="color:#64748b;font-size:13px">Pay via your client portal or contact us with any questions.</p>
        </div>
      `,
      text: `Invoice ${invNumber}\n\nHi ${clientName},\n\nAmount Due: ${currency} ${total}\nDue Date: ${dueDate}\n\nView your invoice at: ${portalUrl}/portal`,
      tags: [{ name: "type", value: "invoice_sent" }],
    });

    const { error: updateErr } = await supabase
      .from("invoices")
      .update({ status: "sent" })
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (updateErr) throw updateErr;

    await logAuditEvent({
      action: AUDIT_ACTIONS.INVOICE_SENT,
      actorName: user.name ?? "Unknown",
      actorWpUserId: user.wpUserId ?? 0,
      detail: `Sent invoice ${invNumber} to ${clientEmail}`,
      clientId: invoice.client_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[POST /api/admin/invoices/[id]/send]", err);
    return NextResponse.json({ error: "Failed to send invoice" }, { status: 502 });
  }
}
