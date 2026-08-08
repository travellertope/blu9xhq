import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { exitEnrollmentsForClient } from "@/lib/sequenceExits";
import { z } from "zod";

const BILLING_CYCLE_IN: Record<string, string> = {
  monthly: "monthly", quarterly: "quarterly", annual: "annually", one_time: "one_time",
};

const patchSchema = z.object({
  status:             z.enum(["active", "paused", "cancelled", "pending", "cancellation_pending"]).optional(),
  amount:             z.number().min(0).optional(),
  currency:           z.string().min(1).optional(),
  billingCycle:       z.enum(["monthly", "quarterly", "annual", "one_time"]).optional(),
  nextBillingDate:    z.string().optional(),
  notes:              z.string().optional(),
});

// ─── PATCH /api/admin/subscriptions/[id] ─────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Cancelling requires approve_cancellations; other edits require assign_subscriptions
  const rawBody = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  const requiredPermission =
    d.status === "cancelled" ? "approve_cancellations" : "assign_subscriptions";

  const auth = await requirePermission(req, requiredPermission);
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();

    const { data: existing, error: fetchErr } = await supabase
      .from("subscriptions")
      .select("client_id")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) return NextResponse.json({ error: "Subscription not found" }, { status: 404 });

    const update: Record<string, unknown> = {
      ...(d.status          !== undefined ? { status:             d.status } : {}),
      ...(d.amount          !== undefined ? { amount:             d.amount } : {}),
      ...(d.currency        !== undefined ? { currency:           d.currency } : {}),
      ...(d.billingCycle    !== undefined ? { billing_cycle:      BILLING_CYCLE_IN[d.billingCycle] ?? d.billingCycle } : {}),
      ...(d.nextBillingDate !== undefined ? { next_billing_date:  d.nextBillingDate } : {}),
      ...(d.notes           !== undefined ? { notes:              d.notes } : {}),
    };

    const { error: updateErr } = await supabase
      .from("subscriptions")
      .update(update)
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (updateErr) throw updateErr;

    // Exit sequences with subscription_cancelled condition when subscription is confirmed cancelled
    if (d.status === "cancelled") {
      void exitEnrollmentsForClient(existing.client_id, "subscription_cancelled").catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[PATCH /api/admin/subscriptions/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update subscription" },
      { status: 502 }
    );
  }
}
