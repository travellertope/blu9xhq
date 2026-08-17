import { NextRequest, NextResponse } from "next/server";
import { validateInvoiceToken } from "@/lib/invoiceToken";
import { selectGateway, getTenantStripe, getTenantPaystackKey } from "@/lib/tenantPaymentGateway";
import { decrypt } from "@/lib/encryption";

export const maxDuration = 30;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function supabaseRest(path: string, options?: RequestInit) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json();
  return { data, error: res.ok ? null : data };
}

export async function POST(req: NextRequest) {
  let body: { token: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const invoiceId = validateInvoiceToken(token);
  if (!invoiceId) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  // Fetch invoice
  const { data: rows, error } = await supabaseRest(
    `invoices?select=id,tenant_id,status,total,currency,invoice_number,clients(contact_email,contact_name)&id=eq.${invoiceId}`
  );
  if (error) {
    console.error("[POST /api/invoice/pay] fetch invoice", error);
    return NextResponse.json({ error: "Failed to load invoice" }, { status: 500 });
  }

  const invoice = rows?.[0];
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Only allow payment on sent/overdue invoices
  if (!["sent", "overdue"].includes(invoice.status)) {
    return NextResponse.json(
      { error: `Invoice cannot be paid (status: ${invoice.status})` },
      { status: 400 }
    );
  }

  const tenantId = invoice.tenant_id;
  const currency = (invoice.currency || "USD").toUpperCase();
  const gateway = await selectGateway(tenantId, currency);

  if (!gateway) {
    return NextResponse.json(
      { error: "No payment gateway configured for this tenant" },
      { status: 422 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "";
  const successUrl = `${baseUrl}/invoice/view?token=${encodeURIComponent(token)}&status=success`;
  const cancelUrl = `${baseUrl}/invoice/view?token=${encodeURIComponent(token)}&status=cancelled`;

  let paymentUrl: string;

  if (gateway === "stripe") {
    const stripe = await getTenantStripe(tenantId);
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 422 });
    }

    const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
    let email: string | undefined;
    try { if (client?.contact_email) email = decrypt(client.contact_email); } catch {}

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(invoice.total * 100),
            product_data: {
              name: `Invoice ${invoice.invoice_number}`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        invoice_id: invoice.id,
        tenant_id: tenantId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    paymentUrl = session.url!;
  } else {
    // Paystack
    const secretKey = await getTenantPaystackKey(tenantId);
    if (!secretKey) {
      return NextResponse.json({ error: "Paystack not configured" }, { status: 422 });
    }

    const client = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients;
    let psEmail = "customer@example.com";
    try { if (client?.contact_email) psEmail = decrypt(client.contact_email); } catch {}
    const amountInMinor = Math.round(invoice.total * 100);

    const psRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInMinor,
        email: psEmail,
        currency: currency,
        callback_url: successUrl,
        metadata: {
          invoice_id: invoice.id,
          tenant_id: tenantId,
        },
      }),
    });

    const psData = await psRes.json();
    if (!psData.status) {
      console.error("[POST /api/invoice/pay] Paystack error", psData);
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 502 });
    }

    paymentUrl = psData.data.authorization_url;
  }

  // Store payment link on invoice
  await supabaseRest(`invoices?id=eq.${invoiceId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      payment_link: paymentUrl,
      payment_gateway: gateway,
    }),
  });

  return NextResponse.json({ gateway, url: paymentUrl });
}
