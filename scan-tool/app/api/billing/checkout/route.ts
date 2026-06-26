import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getStripe, TIER_PRICE_IDS } from "@/lib/stripe";
import { getUser, setUserTier } from "@/lib/redis";

const CheckoutSchema = z.object({
  plan: z.enum(["monitor", "monitor_pro"]),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const priceId = TIER_PRICE_IDS[parsed.data.plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "not_configured", message: "This plan isn't configured yet." },
      { status: 503 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://scan.bluuhq.com";

  try {
    const stripe = getStripe();
    const user = await getUser(email);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: user?.stripeCustomerId || undefined,
      customer_email: user?.stripeCustomerId ? undefined : email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/billing?success=1`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
      client_reference_id: email,
      metadata: { email, plan: parsed.data.plan },
    });

    if (checkoutSession.customer && typeof checkoutSession.customer === "string") {
      await setUserTier(email, { stripeCustomerId: checkoutSession.customer });
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    return NextResponse.json(
      { error: "stripe_error", message: err instanceof Error ? err.message : "Checkout failed." },
      { status: 502 }
    );
  }
}
