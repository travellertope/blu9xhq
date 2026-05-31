import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch, findClientByWpUserId, listSubscriptionsByClient } from "@/lib/wp-api";
import { listPaymentMethods, createStripeCustomer } from "@/lib/stripe";
import { listPaystackCards } from "@/lib/paystack";
import type { WPUser } from "@/lib/wp-api";

async function getOrCreateStripeCustomer(
  wpUserId: number,
  email: string,
  name: string
): Promise<string> {
  const wpUser = await wpRestFetch<WPUser>(`/wp/v2/users/${wpUserId}`);
  const existing = String(wpUser.meta.client_stripe_customer_id ?? "");
  if (existing) return existing;

  const customerId = await createStripeCustomer({ email, name });
  await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
    method: "POST",
    body: JSON.stringify({ meta: { client_stripe_customer_id: customerId } }),
  });
  return customerId;
}

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as {
    wpUserId?: number;
    email?: string | null;
    name?: string | null;
    clientId?: string;
  };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const subs = await listSubscriptionsByClient(clientPost.id);
    const gateways = subs.items.map((s) => s.acf.payment_gateway ?? "stripe").filter(Boolean);
    const gateway =
      gateways.length === 0
        ? "stripe"
        : gateways
            .reduce((acc: Record<string, number>, g) => {
              acc[g] = (acc[g] ?? 0) + 1;
              return acc;
            }, {})
            [Object.keys(gateways.reduce((acc: Record<string, number>, g) => {
              acc[g] = (acc[g] ?? 0) + 1; return acc;
            }, {})).sort((a, b) => (gateways.filter(x => x === b).length - gateways.filter(x => x === a).length))[0]!] !== undefined
            ? Object.keys(
                gateways.reduce((acc: Record<string, number>, g) => {
                  acc[g] = (acc[g] ?? 0) + 1;
                  return acc;
                }, {})
              ).sort(
                (a, b) =>
                  gateways.filter((x) => x === b).length -
                  gateways.filter((x) => x === a).length
              )[0]!
            : "stripe";

    if (gateway === "paystack") {
      const wpUser = await wpRestFetch<WPUser>(`/wp/v2/users/${wpUserId}`);
      const paystackCustomerId = String(wpUser.meta.client_paystack_customer_id ?? "");
      if (!paystackCustomerId) {
        return NextResponse.json({ gateway: "paystack", methods: [] });
      }
      const cards = await listPaystackCards(paystackCustomerId);
      return NextResponse.json({ gateway: "paystack", methods: cards });
    }

    const customerId = await getOrCreateStripeCustomer(
      wpUserId,
      user.email ?? clientPost.acf.portal_email,
      user.name ?? clientPost.acf.contact_name
    );
    const methods = await listPaymentMethods(customerId);
    return NextResponse.json({ gateway: "stripe", methods });
  } catch (err) {
    console.error("[GET /api/portal/payment-methods]", err);
    return NextResponse.json({ error: "Failed to load payment methods" }, { status: 500 });
  }
}
