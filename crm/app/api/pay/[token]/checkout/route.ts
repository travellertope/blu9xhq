export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

interface InvoiceLineItemRow {
  description: string;
  amount: number;
}

/**
 * Public — no session required. Authorization is the opaque public_token
 * itself (see supabase/schema.sql); anyone with the token can start a
 * checkout for that one invoice, which is the point of the link.
 */
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createSupabaseAdminClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, invoice_number, line_items, total, currency, status, clients(contact_email)")
    .eq("public_token", params.token)
    .maybeSingle();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
  if (invoice.status === "paid") {
    return NextResponse.json({ error: "This invoice has already been paid" }, { status: 409 });
  }
  if (invoice.status === "void") {
    return NextResponse.json({ error: "This invoice has been voided" }, { status: 409 });
  }

  const lineItems: InvoiceLineItemRow[] =
    Array.isArray(invoice.line_items) && invoice.line_items.length > 0
      ? invoice.line_items
      : [{ description: `Invoice ${invoice.invoice_number}`, amount: invoice.total }];

  const client = invoice.clients as { contact_email?: string } | null;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: client?.contact_email || undefined,
    line_items: lineItems.map((item) => ({
      price_data: {
        currency: invoice.currency.toLowerCase(),
        product_data: { name: item.description || `Invoice ${invoice.invoice_number}` },
        unit_amount: Math.round((item.amount || 0) * 100),
      },
      quantity: 1,
    })),
    metadata: { supabase_invoice_id: invoice.id },
    success_url: `${siteUrl}/pay/${params.token}?paid=1`,
    cancel_url: `${siteUrl}/pay/${params.token}`,
  });

  return NextResponse.json({ url: session.url });
}
