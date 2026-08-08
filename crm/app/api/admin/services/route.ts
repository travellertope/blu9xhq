import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error, count } = await supabase
      .from("services")
      .select("id,title,description,category,base_price,currency,billing_cycle,is_active", { count: "exact" })
      .eq("tenant_id", session.user.tenantId!)
      .order("title", { ascending: true });

    if (error) throw error;

    const services = (data ?? []).map((s) => ({
      id:           s.id,
      name:         s.title,
      description:  s.description ?? null,
      category:     s.category ?? null,
      basePrice:    s.base_price ?? null,
      currency:     s.currency ?? "USD",
      billingCycle: s.billing_cycle ?? null,
      isActive:     s.is_active ?? true,
    }));

    return NextResponse.json({ services, total: count ?? services.length });
  } catch (err) {
    console.error("[GET /api/admin/services]", err);
    return NextResponse.json({ error: "Failed to load services" }, { status: 500 });
  }
}
