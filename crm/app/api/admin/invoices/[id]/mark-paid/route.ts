import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwtClaims } from "@/lib/jwt";
import { hasPermission, type Role } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendEmailHtml } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { exitEnrollmentsForClient } from "@/lib/sequenceExits";

const GATEWAY_MAP: Record<string, string> = { stripe: "stripe", paystack: "paystack" };

/**
 * Read session claims directly from the Supabase auth cookie.
 * Bypasses the Supabase SDK entirely — no network calls, no initialization.
 * The middleware already refreshes tokens; we just need to decode the JWT.
 */
function readSessionFromCookies() {
  const cookieStore = cookies();
  const all = cookieStore.getAll();

  // Extract project ref from env to know the cookie name
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ref = url.match(/\/\/([^.]+)\./)?.[1] ?? "";
  const baseName = `sb-${ref}-auth-token`;

  console.warn("[mark-paid-auth] cookies:", all.map((c) => `${c.name}(${c.value.length})`).join(", "));

  // Reassemble: try chunked first, then single cookie
  let raw = "";
  const chunks: { i: number; v: string }[] = [];
  for (const c of all) {
    const m = c.name.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.(\\d+)$`));
    if (m) chunks.push({ i: Number(m[1]), v: c.value });
  }
  if (chunks.length > 0) {
    chunks.sort((a, b) => a.i - b.i);
    raw = chunks.map((c) => c.v).join("");
    console.warn("[mark-paid-auth] reassembled", chunks.length, "chunks, len:", raw.length);
  } else {
    const base = all.find((c) => c.name === baseName);
    if (base?.value) {
      raw = base.value;
      console.warn("[mark-paid-auth] single cookie, len:", raw.length);
    }
  }

  if (!raw) {
    console.warn("[mark-paid-auth] no session cookie found");
    return null;
  }

  // @supabase/ssr v0.6+ stores cookies as "base64-<base64url-encoded-json>"
  let decoded = raw;
  if (raw.startsWith("base64-")) {
    const b64 = raw.substring(7).replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    decoded = Buffer.from(padded, "base64").toString("utf-8");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    try {
      parsed = JSON.parse(decodeURIComponent(decoded));
    } catch (e2) {
      console.warn("[mark-paid-auth] JSON parse failed, first 80 chars:", decoded.slice(0, 80));
      return null;
    }
  }

  const accessToken: string | undefined = parsed.access_token;
  const user: any = parsed.user;
  if (!accessToken || !user) {
    console.warn("[mark-paid-auth] missing access_token or user in parsed session");
    return null;
  }

  const claims = decodeJwtClaims(accessToken);
  console.warn("[mark-paid-auth] decoded claims: user_type=", claims.user_type, "crm_role=", claims.crm_role, "tenant_id=", claims.tenant_id);

  return { user, claims, accessToken };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // ── Auth: read session directly from cookies (no Supabase SDK) ──────────────
  const session = readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "NO_SESSION" }, { status: 401 });
  }

  const { user, claims } = session;
  const userType: string = claims.user_type ?? "";
  if (userType !== "team") {
    return NextResponse.json({ error: "Forbidden", code: "NOT_TEAM" }, { status: 403 });
  }

  const crmRole = (claims.crm_role ?? "viewer") as Role;
  if (!hasPermission(crmRole, "mark_invoices_paid")) {
    return NextResponse.json({ error: "Forbidden", code: "NO_PERMISSION" }, { status: 403 });
  }

  const tenantId: string | undefined = claims.tenant_id;
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized", code: "NO_TENANT" }, { status: 401 });
  }

  const userName: string = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "Unknown";
  const userId: string = user.id ?? "";

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: { paymentMethod: string; paidAt: string; reference?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.paymentMethod || !body.paidAt) {
    return NextResponse.json({ error: "paymentMethod and paidAt are required" }, { status: 400 });
  }

  // ── DB operations ───────────────────────────────────────────────────────────
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

    // Fire-and-forget: receipt email
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

    // Fire-and-forget: sequence exits and audit log
    void exitEnrollmentsForClient(invoice.client_id, "invoice_paid").catch(console.error);
    void logAuditEvent({
      action: AUDIT_ACTIONS.INVOICE_MARKED_PAID,
      actorName: userName,
      actorWpUserId: 0,
      detail: `Marked invoice ${invoice.invoice_number} as paid via ${body.paymentMethod}`,
      clientId: invoice.client_id,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.warn("[mark-paid] DB error:", err?.code, err?.message, err?.details, err?.hint);
    return NextResponse.json({ error: "Failed to mark invoice as paid", detail: err?.message }, { status: 502 });
  }
}
