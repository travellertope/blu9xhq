import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, listSubscriptionsByClient, listInvoices } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as { wpUserId?: number; name?: string | null; email?: string | null };
  const wpUserId = user.wpUserId;

  if (!wpUserId) {
    return NextResponse.json({ error: "No WP user ID in session" }, { status: 400 });
  }

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const [subsResult, invoicesResult] = await Promise.all([
      listSubscriptionsByClient(clientPost.id),
      listInvoices({ clientId: clientPost.id }),
    ]);

    const activeSubscriptionCount = subsResult.items.filter(
      (s) => s.acf.status === "active"
    ).length;

    const unpaidInvoiceCount = invoicesResult.items.filter(
      (inv) => inv.acf.inv_status === "sent" || inv.acf.inv_status === "overdue"
    ).length;

    return NextResponse.json({
      clientId: clientPost.id,
      name: user.name ?? clientPost.acf.contact_name,
      email: user.email ?? clientPost.acf.portal_email,
      activeSubscriptionCount,
      unpaidInvoiceCount,
    });
  } catch (err) {
    console.error("[portal/me] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
