import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwtClaims } from "@/lib/jwt";
import { hasPermission, type Role } from "@/lib/permissions";

export const maxDuration = 30;

const GATEWAY_MAP: Record<string, string> = { stripe: "stripe", paystack: "paystack" };
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function readSessionFromCookies() {
  const all = cookies().getAll();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const ref = url.match(/\/\/([^.]+)\./)?.[1] ?? "";
  const baseName = `sb-${ref}-auth-token`;

  let raw = "";
  const chunks: { i: number; v: string }[] = [];
  for (const c of all) {
    const m = c.name.match(new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.(\\d+)$`));
    if (m) chunks.push({ i: Number(m[1]), v: c.value });
  }
  if (chunks.length > 0) {
    chunks.sort((a, b) => a.i - b.i);
    raw = chunks.map((c) => c.v).join("");
  } else {
    const base = all.find((c) => c.name === baseName);
    if (base?.value) raw = base.value;
  }

  if (!raw) return null;

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
    try { parsed = JSON.parse(decodeURIComponent(decoded)); } catch { return null; }
  }

  if (!parsed.access_token || !parsed.user) return null;

  const claims = decodeJwtClaims(parsed.access_token);
  return { user: parsed.user, claims };
}

async function supabaseRest(path: string, options: { method?: string; body?: any } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: options.method ?? "GET",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.method === "PATCH" ? "return=minimal" : "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (options.method === "PATCH") return { error: res.ok ? null : await res.text() };
  const data = await res.json();
  return { data, error: res.ok ? null : data };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = readSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized", code: "NO_SESSION" }, { status: 401 });
  }

  const { user, claims } = session;
  if ((claims.user_type ?? "") !== "team") {
    return NextResponse.json({ error: "Forbidden", code: "NOT_TEAM" }, { status: 403 });
  }
  if (!hasPermission((claims.crm_role ?? "viewer") as Role, "mark_invoices_paid")) {
    return NextResponse.json({ error: "Forbidden", code: "NO_PERMISSION" }, { status: 403 });
  }
  const tenantId: string | undefined = claims.tenant_id;
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized", code: "NO_TENANT" }, { status: 401 });
  }

  let body: { paymentMethod: string; paidAt: string; reference?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.paymentMethod || !body.paidAt) {
    return NextResponse.json({ error: "paymentMethod and paidAt are required" }, { status: 400 });
  }

  try {
    console.warn("[mark-paid] fetching invoice", params.id);
    const { data: rows, error: fetchErr } = await supabaseRest(
      `invoices?select=id,invoice_number,total,currency,client_id,clients(contact_name,company_name,contact_email)&id=eq.${params.id}&tenant_id=eq.${tenantId}`
    );
    if (fetchErr) throw new Error(typeof fetchErr === "string" ? fetchErr : JSON.stringify(fetchErr));
    const invoice = rows?.[0];
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    console.warn("[mark-paid] updating invoice");
    const { error: updateErr } = await supabaseRest(
      `invoices?id=eq.${params.id}&tenant_id=eq.${tenantId}`,
      {
        method: "PATCH",
        body: {
          status: "paid",
          paid_date: body.paidAt,
          payment_gateway: GATEWAY_MAP[body.paymentMethod] ?? "manual",
          gateway_payment_id: body.reference || null,
        },
      }
    );
    if (updateErr) throw new Error(typeof updateErr === "string" ? updateErr : JSON.stringify(updateErr));

    console.warn("[mark-paid] done, sending response");

    // Fire-and-forget email (no Supabase SDK involved)
    const clientEmail = invoice.clients?.contact_email;
    const clientName = invoice.clients?.contact_name || invoice.clients?.company_name || "there";
    if (clientEmail) {
      const { sendEmailHtml } = await import("@/lib/resend");
      void sendEmailHtml({
        to: clientEmail,
        subject: `Payment received — Invoice ${invoice.invoice_number}`,
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Payment Received</h2>
          <p>Hi ${clientName},</p>
          <p>We have received your payment for invoice ${invoice.invoice_number}. Thank you!</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;color:#64748b">Invoice Number</td><td style="padding:8px 0;font-weight:600">${invoice.invoice_number}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Amount Paid</td><td style="padding:8px 0;font-weight:600">${invoice.currency} ${invoice.total?.toLocaleString()}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Payment Date</td><td style="padding:8px 0">${body.paidAt}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Payment Method</td><td style="padding:8px 0">${body.paymentMethod.replace("_", " ")}</td></tr>
            ${body.reference ? `<tr><td style="padding:8px 0;color:#64748b">Reference</td><td style="padding:8px 0">${body.reference}</td></tr>` : ""}
          </table>
          <p style="color:#64748b;font-size:13px">This is your payment receipt. Please keep it for your records.</p>
        </div>`,
        text: `Payment received for Invoice ${invoice.invoice_number}.\n\nAmount: ${invoice.currency} ${invoice.total}\nDate: ${body.paidAt}\nMethod: ${body.paymentMethod}`,
        tags: [{ name: "type", value: "payment_receipt" }],
      }).catch((e) => console.error("[mark-paid] email error:", e));
    }

    // Fire-and-forget audit log via raw REST (no getSession dependency)
    const userName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "Unknown";
    void supabaseRest("audit_logs", {
      method: "PATCH",
      body: {
        action: "invoice.marked_paid",
        actor_name: userName,
        detail: `Marked invoice ${invoice.invoice_number} as paid via ${body.paymentMethod}`,
        client_id: invoice.client_id,
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.warn("[mark-paid] error:", err?.message);
    return NextResponse.json({ error: "Failed to mark invoice as paid", detail: err?.message }, { status: 502 });
  }
}
