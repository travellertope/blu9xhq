import { NextRequest, NextResponse } from "next/server";
import { validateInvoiceToken } from "@/lib/invoiceToken";
import { decrypt } from "@/lib/encryption";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function supabaseRest(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return { data, error: res.ok ? null : data };
}

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const invoiceId = validateInvoiceToken(token);
  if (!invoiceId) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  try {
    const { data: rows, error } = await supabaseRest(
      `invoices?select=*,clients(contact_name,company_name,contact_email),tenants(name,logo_url,payment_preferred_gateway,payment_stripe_publishable_key,payment_paystack_public_key,payment_stripe_secret_key_enc,payment_paystack_secret_key_enc)&id=eq.${invoiceId}`
    );
    if (error) throw new Error(JSON.stringify(error));
    const invoice = rows?.[0];
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
    const tenant = Array.isArray(invoice.tenants) ? invoice.tenants[0] : invoice.tenants;

    const hasStripe = !!tenant?.payment_stripe_secret_key_enc;
    const hasPaystack = !!tenant?.payment_paystack_secret_key_enc;
    const pref = tenant?.payment_preferred_gateway;
    const currency = invoice.currency?.toUpperCase();

    let paymentGateway: string | null = null;
    if (invoice.status === "sent" || invoice.status === "overdue") {
      if (pref === "stripe" && hasStripe) paymentGateway = "stripe";
      else if (pref === "paystack" && hasPaystack) paymentGateway = "paystack";
      else if (["NGN", "GHS"].includes(currency)) paymentGateway = hasPaystack ? "paystack" : hasStripe ? "stripe" : null;
      else paymentGateway = hasStripe ? "stripe" : hasPaystack ? "paystack" : null;
    }

    return NextResponse.json({
      invoiceNumber: invoice.invoice_number,
      status: invoice.status,
      total: invoice.total,
      subtotal: invoice.subtotal,
      discount: invoice.discount ?? 0,
      taxRate: invoice.tax_rate,
      taxAmount: invoice.tax_amount,
      currency: invoice.currency,
      issuedDate: invoice.issued_date,
      dueDate: invoice.due_date,
      paidDate: invoice.paid_date,
      notes: invoice.notes,
      lineItems: invoice.line_items ?? [],
      clientName: client?.contact_name || client?.company_name || "",
      clientCompany: client?.company_name || "",
      tenantName: tenant?.name || "BluuHQ",
      tenantLogo: tenant?.logo_url || null,
      invoiceId: invoice.id,
      canPay: paymentGateway !== null,
      paymentGateway: paymentGateway,
      paystackPublicKey: paymentGateway === "paystack" ? (tenant?.payment_paystack_public_key || null) : null,
    });
  } catch (err: any) {
    console.error("[GET /api/invoice/view]", err?.message);
    return NextResponse.json({ error: "Failed to load invoice" }, { status: 500 });
  }
}
