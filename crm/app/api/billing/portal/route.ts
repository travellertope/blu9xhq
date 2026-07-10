import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getTenantById } from "@/lib/tenant";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) return NextResponse.json({ error: "No tenant on session" }, { status: 400 });

  const tenant = await getTenantById(tenantId);
  if (!tenant?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe billing account found" }, { status: 404 });
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer:   tenant.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}
