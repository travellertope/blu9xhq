import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { listInvoices } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as any;
  const clientId = parseInt(user.clientId ?? "0", 10);

  if (!clientId) {
    return NextResponse.json({ invoices: [] });
  }

  try {
    const { items } = await listInvoices({ clientId, per_page: 50 });

    // Only expose non-draft invoices; strip admin-only fields
    const visible = items
      .filter((inv) => inv.acf.inv_status !== "draft")
      .map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.acf.inv_number,
        status: inv.acf.inv_status,
        total: inv.acf.inv_total,
        currency: inv.acf.inv_currency,
        issuedDate: inv.acf.inv_issued_date,
        dueDate: inv.acf.inv_due_date,
        paidAt: inv.acf.inv_paid_at,
        pdfUrl: inv.acf.inv_pdf_url,
        lineItems: (() => {
          try {
            return JSON.parse(inv.acf.inv_line_items ?? "[]");
          } catch {
            return [];
          }
        })(),
      }));

    return NextResponse.json({ invoices: visible });
  } catch (err) {
    console.error("[GET /api/portal/invoices]", err);
    return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
  }
}
