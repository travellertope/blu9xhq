import { NextResponse } from "next/server";
import { getMyShop } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!shop.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found yet" }, { status: 404 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002";
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: shop.stripe_customer_id,
    return_url: `${siteUrl}/dashboard/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
