import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, getInvoice, getSubscription } from "@/lib/wp-api";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const invoiceId = parseInt(params.id, 10);
  if (!invoiceId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const invoice = await getInvoice(invoiceId);
    if (invoice.acf.inv_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let paymentGateway = "stripe";
    let subscriptionName = "";
    if (invoice.acf.inv_subscription) {
      try {
        const sub = await getSubscription(invoice.acf.inv_subscription);
        paymentGateway = sub.acf.payment_gateway ?? "stripe";
        subscriptionName = sub.title?.rendered ?? "";
      } catch {
        // subscription fetch is best-effort
      }
    }

    let lineItems: { description: string; amount: number }[] = [];
    try {
      lineItems = JSON.parse(invoice.acf.inv_line_items ?? "[]");
    } catch {
      lineItems = [];
    }

    return NextResponse.json({
      id: invoice.id,
      invoiceNumber: invoice.acf.inv_number,
      status: invoice.acf.inv_status,
      total: invoice.acf.inv_total,
      currency: invoice.acf.inv_currency,
      issuedDate: invoice.acf.inv_issued_date,
      dueDate: invoice.acf.inv_due_date,
      paidAt: invoice.acf.inv_paid_at,
      notes: invoice.acf.inv_notes,
      lineItems,
      pdfKey: invoice.acf.inv_pdf_url,
      paymentGateway,
      subscriptionName,
    });
  } catch (err) {
    console.error("[GET /api/portal/invoices/[id]]", err);
    return NextResponse.json({ error: "Failed to load invoice" }, { status: 500 });
  }
}
