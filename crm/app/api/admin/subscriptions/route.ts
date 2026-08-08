import { NextRequest, NextResponse } from "next/server";
import { requireSession, requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendNewService } from "@/lib/resend";
import { z } from "zod";

// Admin UI billing-cycle values ("annual") vs the Supabase check constraint
// ("annually") — same remap-in-the-route-layer pattern used for file categories.
const BILLING_CYCLE_IN: Record<string, string> = {
  monthly: "monthly", quarterly: "quarterly", annual: "annually", one_time: "one_time",
};
const BILLING_CYCLE_OUT: Record<string, string> = {
  monthly: "monthly", quarterly: "quarterly", annually: "annual", one_time: "one_time",
};

const postSchema = z.object({
  clientId:       z.string().uuid(),
  serviceId:      z.string().uuid(),
  status:         z.enum(["active", "paused", "cancelled", "pending"]).default("active"),
  amount:         z.number().min(0),
  currency:       z.string().min(1),
  billingCycle:   z.enum(["monthly", "quarterly", "annual", "one_time"]),
  startDate:      z.string().optional(),
  nextBillingDate: z.string().optional(),
  notes:          z.string().optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const tenantId = session.user.tenantId!;

  const { searchParams } = new URL(req.url);
  const page       = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage    = 50;
  const statusFilter = searchParams.get("status") ?? null;

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("subscriptions")
      .select("*, clients(company_name,contact_name), services(title)", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (statusFilter) query = query.eq("status", statusFilter);

    const from = (page - 1) * perPage;
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;

    const enriched = (data ?? []).map((s: any) => ({
      id:              s.id,
      clientId:        s.client_id,
      clientName:      s.clients?.company_name || s.clients?.contact_name || `Client #${s.client_id}`,
      serviceId:       s.service_id,
      serviceName:     s.services?.title || `Service #${s.service_id}`,
      status:          s.status,
      amount:          s.amount,
      currency:        s.currency,
      billingCycle:    BILLING_CYCLE_OUT[s.billing_cycle] ?? s.billing_cycle,
      nextBillingDate: s.next_billing_date ?? null,
      startDate:       s.start_date ?? null,
      createdAt:       s.created_at,
    }));

    const total = count ?? 0;
    return NextResponse.json({
      subscriptions: enriched,
      total,
      totalPages: Math.max(Math.ceil(total / perPage), 1),
      page,
    });
  } catch (err) {
    console.error("[GET /api/admin/subscriptions]", err);
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }
}

// ─── POST /api/admin/subscriptions ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "assign_subscriptions");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const tenantId = session.user.tenantId!;

  const body = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  try {
    const supabase = createSupabaseAdminClient();

    const [{ data: client }, { data: service }] = await Promise.all([
      supabase.from("clients").select("company_name,contact_name,contact_email,portal_email").eq("id", d.clientId).eq("tenant_id", tenantId).maybeSingle(),
      supabase.from("services").select("title").eq("id", d.serviceId).eq("tenant_id", tenantId).maybeSingle(),
    ]);

    const clientLabel  = client?.company_name || client?.contact_name || `Client #${d.clientId}`;
    const serviceLabel = service?.title || `Service #${d.serviceId}`;

    const { data: inserted, error } = await supabase
      .from("subscriptions")
      .insert({
        tenant_id:         tenantId,
        client_id:         d.clientId,
        service_id:        d.serviceId,
        status:            d.status,
        amount:            d.amount,
        currency:          d.currency,
        billing_cycle:     BILLING_CYCLE_IN[d.billingCycle] ?? d.billingCycle,
        start_date:        d.startDate || undefined,
        next_billing_date: d.nextBillingDate || undefined,
        notes:             d.notes || null,
      })
      .select("*")
      .single();

    if (error) throw error;

    // Notify client of new service (fire and forget)
    const clientEmail = client?.portal_email ?? client?.contact_email;
    const portalUrl    = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal/subscriptions`;
    if (clientEmail && d.status === "active") {
      void sendNewService(clientEmail, {
        clientName: clientLabel,
        serviceName: serviceLabel,
        portalUrl,
      }).catch((err) => console.error("[subscriptions] sendNewService failed:", err));
    }

    return NextResponse.json({ subscription: inserted }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/subscriptions]", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
