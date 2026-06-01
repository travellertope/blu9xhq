import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {wpRestFetch, resolveClientPost} from "@/lib/wp-api";
import { createSetupIntent, listPaymentMethods, createStripeCustomer } from "@/lib/stripe";
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

  try {
    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const wpUser = await wpRestFetch<WPUser>(`/wp/v2/users/${wpUserId}`);
    let customerId = String(wpUser.meta.client_stripe_customer_id ?? "");

    if (!customerId) {
      customerId = await createStripeCustomer({
        email: user.email ?? clientPost.acf.portal_email,
        name: user.name ?? clientPost.acf.contact_name,
      });
      await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
        method: "POST",
        body: JSON.stringify({ meta: { client_stripe_customer_id: customerId } }),
      });
    }

    const { clientSecret } = await createSetupIntent(customerId);
    return NextResponse.json({ clientSecret });
  } catch (err) {
    console.error("[GET /api/portal/payment-methods/setup]", err);
    return NextResponse.json({ error: "Failed to create setup intent" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const wpUser = await wpRestFetch<WPUser>(`/wp/v2/users/${wpUserId}`);
    const customerId = String(wpUser.meta.client_stripe_customer_id ?? "");
    if (!customerId) return NextResponse.json({ error: "No Stripe customer" }, { status: 400 });

    const methods = await listPaymentMethods(customerId);
    return NextResponse.json({ methods });
  } catch (err) {
    console.error("[POST /api/portal/payment-methods/setup]", err);
    return NextResponse.json({ error: "Failed to get payment methods" }, { status: 500 });
  }
}
