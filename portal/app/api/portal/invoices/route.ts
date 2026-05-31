import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, listInvoices, getSubscription } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ invoices: [] });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ invoices: [] });

    const { items } = await listInvoices({ clientId: clientPost.id, per_page: 100 });

    const visible = await Promise.all(
      items
        .filter((inv) => inv.acf.inv_status !== "draft")
        .map(async (inv) => {
          let subscriptionName = "";
          if (inv.acf.inv_subscription) {
            try {
              const sub = await getSubscription(inv.acf.inv_subscription);
              subscriptionName = sub.title?.rendered ?? "";
            } catch {
              // best-effort
            }
          }
          return {
            id: inv.id,
            invoiceNumber: inv.acf.inv_number,
            status: inv.acf.inv_status,
            total: inv.acf.inv_total,
            currency: inv.acf.inv_currency,
            issuedDate: inv.acf.inv_issued_date,
            dueDate: inv.acf.inv_due_date,
            paidAt: inv.acf.inv_paid_at,
            hasPdf: !!inv.acf.inv_pdf_url,
            subscriptionName,
          };
        })
    );

    return NextResponse.json({ invoices: visible });
  } catch (err) {
    console.error("[GET /api/portal/invoices]", err);
    return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
  }
}
