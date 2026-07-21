import { NextResponse } from "next/server";
import { getMyShop } from "@/lib/auth";
import { disablePaystackSubscription } from "@/lib/paystack";

export async function POST() {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!shop.paystack_subscription_code || !shop.paystack_email_token) {
    return NextResponse.json({ error: "No active Paystack subscription found" }, { status: 404 });
  }

  await disablePaystackSubscription(shop.paystack_subscription_code, shop.paystack_email_token);

  return NextResponse.json({ ok: true });
}
