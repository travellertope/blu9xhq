import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";
import { setDefaultPaymentMethod, listPaymentMethods } from "@/lib/stripe";
import type { WPUser } from "@/lib/wp-api";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const wpUser = await wpRestFetch<WPUser>(`/wp/v2/users/${wpUserId}`);
    const customerId = String(wpUser.meta.client_stripe_customer_id ?? "");
    if (!customerId) return NextResponse.json({ error: "No payment methods" }, { status: 400 });

    const methods = await listPaymentMethods(customerId);
    const owned = methods.some((m) => m.id === params.id);
    if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await setDefaultPaymentMethod(customerId, params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/portal/payment-methods/[id]/set-default]", err);
    return NextResponse.json({ error: "Failed to set default" }, { status: 500 });
  }
}
