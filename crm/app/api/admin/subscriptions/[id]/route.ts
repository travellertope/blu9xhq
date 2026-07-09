import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { getSubscription, updateSubscription } from "@/lib/wp-api";
import { exitEnrollmentsForClient } from "@/lib/sequenceExits";
import { z } from "zod";

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
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

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

  try {
    const existing = await getSubscription(id);
    const clientId = existing.acf.client_id;

    await updateSubscription(id, {
      acf: {
        ...(d.status           !== undefined ? { status:             d.status }           : {}),
        ...(d.amount           !== undefined ? { amount:             d.amount }           : {}),
        ...(d.currency         !== undefined ? { currency:           d.currency }         : {}),
        ...(d.billingCycle     !== undefined ? { billing_cycle:      d.billingCycle }     : {}),
        ...(d.nextBillingDate  !== undefined ? { next_billing_date:  d.nextBillingDate }  : {}),
        ...(d.notes            !== undefined ? { notes:              d.notes }            : {}),
      },
    });

    // Exit sequences with subscription_cancelled condition when subscription is confirmed cancelled
    if (d.status === "cancelled") {
      void exitEnrollmentsForClient(clientId, "subscription_cancelled").catch(console.error);
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
