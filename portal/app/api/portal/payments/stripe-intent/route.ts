import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {wpRestFetch, resolveClientPost, getInvoice} from "@/lib/wp-api";
import { createStripeCustomer as createStripeCustomerFn } from "@/lib/stripe";
import { createPaymentIntentForNewCard } from "@/lib/stripe";
import type { WPUser } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as {
    wpUserId?: number;
    clientId?: number | string;
    email?: string | null;
    name?: string | null;
  };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  const invoiceId = parseInt(req.nextUrl.searchParams.get("invoiceId") ?? "0", 10);
  if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

  try {
    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const invoice = await getInvoice(invoiceId);
    if (invoice.acf.inv_client !== clientPost.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!["sent", "overdue"].includes(invoice.acf.inv_status)) {
      return NextResponse.json({ error: "Invoice is not payable" }, { status: 400 });
    }

    const wpUser = await wpRestFetch<WPUser>(`/wp/v2/users/${wpUserId}`);
    let customerId = String(wpUser.meta.client_stripe_customer_id ?? "");

    if (!customerId) {
      customerId = await createStripeCustomerFn({
        email: user.email ?? clientPost.acf.portal_email,
        name: user.name ?? clientPost.acf.contact_name,
      });
      await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
        method: "POST",
        body: JSON.stringify({ meta: { client_stripe_customer_id: customerId } }),
      });
    }

    const amountInSmallestUnit = Math.round(invoice.acf.inv_total * 100);
    const { clientSecret, paymentIntentId } = await createPaymentIntentForNewCard({
      amount: amountInSmallestUnit,
      currency: invoice.acf.inv_currency,
      customerId,
      invoiceId: String(invoiceId),
    });

    return NextResponse.json({ clientSecret, paymentIntentId });
  } catch (err) {
    console.error("[GET /api/portal/payments/stripe-intent]", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
