import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwtClaims } from "@/lib/jwt";
import { hasPermission, type Role } from "@/lib/permissions";
import { sendEmailHtml } from "@/lib/resend";

export const maxDuration = 30;

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
  if (options.method === "PATCH") return { data: null, error: res.ok ? null : await res.text() };
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
  if (!hasPermission((claims.crm_role ?? "viewer") as Role, "create_invoices")) {
    return NextResponse.json({ error: "Forbidden", code: "NO_PERMISSION" }, { status: 403 });
  }
  const tenantId: string | undefined = claims.tenant_id;
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized", code: "NO_TENANT" }, { status: 401 });
  }

  try {
    const { data: rows, error: fetchErr } = await supabaseRest(
      `invoices?select=*,clients(contact_name,company_name,contact_email)&id=eq.${params.id}&tenant_id=eq.${tenantId}`
    );
    if (fetchErr) throw new Error(typeof fetchErr === "string" ? fetchErr : JSON.stringify(fetchErr));
    const invoice = rows?.[0];
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const clientEmail = invoice.clients?.contact_email;
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

    const { error: updateErr } = await supabaseRest(
      `invoices?id=eq.${params.id}&tenant_id=eq.${tenantId}`,
      { method: "PATCH", body: { status: "sent" } }
    );
    if (updateErr) throw new Error(typeof updateErr === "string" ? updateErr : JSON.stringify(updateErr));

    const userName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "Unknown";
    void supabaseRest("audit_logs", {
      method: "PATCH",
      body: {
        action: "invoice.sent",
        actor_name: userName,
        detail: `Sent invoice ${invNumber} to ${clientEmail}`,
        client_id: invoice.client_id,
        tenant_id: tenantId,
        created_at: new Date().toISOString(),
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[POST /api/admin/invoices/[id]/send]", err?.message);
    return NextResponse.json({ error: "Failed to send invoice", detail: err?.message }, { status: 502 });
  }
}
