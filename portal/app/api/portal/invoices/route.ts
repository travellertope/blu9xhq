import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost, listInvoices, getSubscription} from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; clientId?: number | string };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId && !sessionClientId) return NextResponse.json({ invoices: [] });

  try {
    let clientPostId = sessionClientId;
    if (!clientPostId) {
      const found = await resolveClientPost(sessionClientId, wpUserId).catch(() => null);
      if (!found) return NextResponse.json({ invoices: [] });
      clientPostId = found.id;
    }
    const clientPost = { id: clientPostId };

    const { items } = await listInvoices({ clientId: clientPost.id, per_page: 100 });

    const visibleItems = items.filter((inv) => inv.acf.inv_status !== "draft");

    // Fetch each unique subscription title once
    const uniqueSubIds = Array.from(
      new Set(visibleItems.map((inv) => inv.acf.inv_subscription).filter(Boolean) as number[])
    );
    const subNameMap = new Map<number, string>(
      await Promise.all(
        uniqueSubIds.map(async (id) => {
          try {
            const sub = await getSubscription(id);
            return [id, sub.title?.rendered ?? ""] as const;
          } catch {
            return [id, ""] as const;
          }
        })
      )
    );

    const visible = visibleItems.map((inv) => {
      const subscriptionName = inv.acf.inv_subscription
        ? (subNameMap.get(inv.acf.inv_subscription) ?? "")
        : "";
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
    });

    return NextResponse.json({ invoices: visible });
  } catch (err) {
    console.error("[GET /api/portal/invoices]", err);
    return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
  }
}
