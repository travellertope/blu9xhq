export const runtime = "nodejs";

import fs from "fs";
import path from "path";
import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeJwtClaims } from "@/lib/jwt";
import { hasPermission, type Role } from "@/lib/permissions";
import { decrypt } from "@/lib/encryption";
import { createInvoiceToken } from "@/lib/invoiceToken";
import { Document, Page, Text, View, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement, JSXElementConstructor } from "react";
import { Resend } from "resend";

export const maxDuration = 30;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ─── Cookie-based auth (bypasses Supabase SDK cold-start hang) ───────────────

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

// ─── Raw Supabase REST ───────────────────────────────────────────────────────

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

// ─── PDF Template ────────────────────────────────────────────────────────────

const pdfStyles = StyleSheet.create({
  page:            { fontFamily: "Helvetica", fontSize: 10, padding: 48, color: "#1e293b" },
  header:          { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  logoImage:       { width: 100, objectFit: "contain" },
  brandName:       { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  invoiceLabel:    { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#64748b", textAlign: "right" },
  metaBlock:       { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  metaLabel:       { color: "#64748b", marginBottom: 2 },
  metaValue:       { fontFamily: "Helvetica-Bold" },
  separator:       { borderBottomWidth: 1, borderBottomColor: "#e2e8f0", marginBottom: 16 },
  tableHeader:     { flexDirection: "row", backgroundColor: "#f8fafc", padding: "6 8", marginBottom: 4 },
  tableHeaderDesc: { flex: 1, fontFamily: "Helvetica-Bold", color: "#64748b" },
  tableHeaderAmt:  { width: 100, textAlign: "right", fontFamily: "Helvetica-Bold", color: "#64748b" },
  tableRow:        { flexDirection: "row", padding: "6 8", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableRowDesc:    { flex: 1 },
  tableRowAmt:     { width: 100, textAlign: "right" },
  totalRow:        { flexDirection: "row", padding: "8 8", marginTop: 8 },
  totalLabel:      { flex: 1, fontFamily: "Helvetica-Bold", fontSize: 12 },
  totalAmt:        { width: 100, textAlign: "right", fontFamily: "Helvetica-Bold", fontSize: 12 },
  notes:           { marginTop: 24, padding: 12, backgroundColor: "#f8fafc", borderRadius: 4 },
  notesLabel:      { fontFamily: "Helvetica-Bold", marginBottom: 4, color: "#64748b" },
  footer:          { position: "absolute", bottom: 32, left: 48, right: 48, textAlign: "center", color: "#94a3b8", fontSize: 9, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 8 },
});

interface LineItem { description: string; amount: number }

function InvoicePDF(props: {
  invNumber: string; issuedDate: string; dueDate: string;
  clientName: string; clientCompany?: string;
  lineItems: LineItem[]; total: number; currency: string;
  notes?: string; logoSrc?: string;
}) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          {props.logoSrc
            ? <Image src={props.logoSrc} style={pdfStyles.logoImage} />
            : <Text style={pdfStyles.brandName}>BluuHQ</Text>}
          <Text style={pdfStyles.invoiceLabel}>TAX INVOICE</Text>
        </View>
        <View style={pdfStyles.metaBlock}>
          <View>
            <Text style={pdfStyles.metaLabel}>Bill To</Text>
            <Text style={pdfStyles.metaValue}>{props.clientName}</Text>
            {props.clientCompany ? <Text>{props.clientCompany}</Text> : null}
          </View>
          <View>
            <Text style={pdfStyles.metaLabel}>Invoice Number</Text>
            <Text style={pdfStyles.metaValue}>{props.invNumber}</Text>
            <Text style={[pdfStyles.metaLabel, { marginTop: 8 }]}>Issue Date</Text>
            <Text>{props.issuedDate}</Text>
            <Text style={[pdfStyles.metaLabel, { marginTop: 8 }]}>Due Date</Text>
            <Text style={pdfStyles.metaValue}>{props.dueDate}</Text>
          </View>
        </View>
        <View style={pdfStyles.separator} />
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.tableHeaderDesc}>Description</Text>
          <Text style={pdfStyles.tableHeaderAmt}>Amount ({props.currency})</Text>
        </View>
        {props.lineItems.map((item, i) => (
          <View key={i} style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableRowDesc}>{item.description}</Text>
            <Text style={pdfStyles.tableRowAmt}>{item.amount?.toLocaleString()}</Text>
          </View>
        ))}
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>Total</Text>
          <Text style={pdfStyles.totalAmt}>{props.currency} {props.total?.toLocaleString()}</Text>
        </View>
        {props.notes ? (
          <View style={pdfStyles.notes}>
            <Text style={pdfStyles.notesLabel}>Notes</Text>
            <Text>{props.notes}</Text>
          </View>
        ) : null}
        <Text style={pdfStyles.footer}>Pay via your client portal or contact us with any questions.</Text>
      </Page>
    </Document>
  );
}

// ─── POST handler ────────────────────────────────────────────────────────────

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

    const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
    let rawEmail = client?.contact_email ?? "";
    if (rawEmail.includes(":")) {
      try { rawEmail = decrypt(rawEmail); } catch {}
    }
    const clientEmail = rawEmail.trim();
    const clientName  = client?.contact_name || client?.company_name || "there";
    const clientCompany = client?.company_name || undefined;

    if (!clientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail)) {
      return NextResponse.json(
        { error: `Client has no valid email address (got: "${clientEmail || ""}")` },
        { status: 400 }
      );
    }

    const invNumber = invoice.invoice_number;
    const total     = invoice.total;
    const currency  = invoice.currency;
    const dueDate   = invoice.due_date;
    const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Generate signed view link (valid 90 days, no login required)
    const viewToken = createInvoiceToken(params.id);
    const viewUrl   = `${appUrl}/invoice/view?token=${encodeURIComponent(viewToken)}`;

    // Generate PDF
    let logoSrc: string | undefined;
    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        logoSrc = `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`;
      }
    } catch {}

    const pdfElement = React.createElement(InvoicePDF, {
      invNumber,
      issuedDate: invoice.issued_date,
      dueDate,
      clientName,
      clientCompany,
      lineItems: invoice.line_items ?? [],
      total,
      currency,
      notes: invoice.notes,
      logoSrc,
    }) as unknown as ReactElement<DocumentProps, string | JSXElementConstructor<DocumentProps>>;

    const pdfBuffer = await renderToBuffer(pdfElement);

    // Send email with PDF attachment via Resend directly (to pass attachments)
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const fromName  = process.env.RESEND_FROM_NAME ?? "BluuHQ";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "hello@bluuhq.com";
    const replyTo   = process.env.RESEND_REPLY_TO ?? "hello@bluuhq.com";

    const pdfFilename = `invoice-${invNumber.replace(/[^a-zA-Z0-9-]/g, "-")}.pdf`;

    const { error: emailErr } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [clientEmail],
      replyTo,
      subject: `Invoice ${invNumber} from ${fromName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Invoice ${invNumber}</h2>
          <p>Hi ${clientName},</p>
          <p>Please find your invoice attached and details below:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;color:#64748b">Invoice Number</td><td style="padding:8px 0;font-weight:600">${invNumber}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Amount Due</td><td style="padding:8px 0;font-weight:600">${currency} ${total?.toLocaleString()}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Due Date</td><td style="padding:8px 0">${dueDate}</td></tr>
          </table>
          <p>
            <a href="${viewUrl}" style="background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
              View Invoice Online
            </a>
          </p>
          <p style="color:#64748b;font-size:13px">A PDF copy is attached to this email. Contact us with any questions.</p>
        </div>
      `,
      text: `Invoice ${invNumber}\n\nHi ${clientName},\n\nAmount Due: ${currency} ${total}\nDue Date: ${dueDate}\n\nView your invoice online: ${viewUrl}\n\nA PDF copy is attached to this email.`,
      attachments: [
        {
          filename: pdfFilename,
          content: Buffer.from(pdfBuffer),
        },
      ],
      tags: [{ name: "type", value: "invoice_sent" }],
    });
    if (emailErr) {
      throw new Error(`Resend error: ${emailErr.message ?? JSON.stringify(emailErr)}`);
    }

    // Update status to sent
    const { error: updateErr } = await supabaseRest(
      `invoices?id=eq.${params.id}&tenant_id=eq.${tenantId}`,
      { method: "PATCH", body: { status: "sent" } }
    );
    if (updateErr) throw new Error(typeof updateErr === "string" ? updateErr : JSON.stringify(updateErr));

    // Fire-and-forget audit log
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
