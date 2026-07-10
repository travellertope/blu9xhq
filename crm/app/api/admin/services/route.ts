import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { listServices } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const result = await listServices();
    const services = result.items.map((s) => ({
      id:           s.id,
      name:         s.title.rendered.replace(/<[^>]+>/g, ""),
      description:  s.acf.description ?? null,
      category:     s.acf.category ?? null,
      basePrice:    s.acf.base_price ?? null,
      currency:     s.acf.currency ?? "GBP",
      billingCycle: s.acf.billing_cycle ?? null,
      isActive:     s.acf.is_active ?? true,
    }));
    return NextResponse.json({ services, total: result.total });
  } catch (err) {
    console.error("[GET /api/admin/services]", err);
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}
