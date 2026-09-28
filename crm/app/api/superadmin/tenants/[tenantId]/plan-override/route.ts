import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { TenantPlan } from "@/lib/planLimits";

const BLUU_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const VALID_PLANS: TenantPlan[] = ["free", "starter", "pro", "agency"];

function isBluuSuperAdmin(session: ReturnType<typeof getSessionFromCookies>): boolean {
  return (
    !!session &&
    session.user.role === "bluu_admin" &&
    session.user.bluuhqRole === "super_admin" &&
    session.user.tenantId === BLUU_TENANT_ID
  );
}

type Params = { params: { tenantId: string } };

/** Set a plan override for a tenant */
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = getSessionFromCookies();
  if (!isBluuSuperAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { plan, until } = body as { plan?: string; until?: string | null };

  if (!plan || !VALID_PLANS.includes(plan as TenantPlan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const overrideUntil = until ? new Date(until) : null;
  if (overrideUntil && isNaN(overrideUntil.getTime())) {
    return NextResponse.json({ error: "Invalid until date" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tenants")
    .update({
      plan_override:       plan,
      plan_override_until: overrideUntil ? overrideUntil.toISOString() : null,
      updated_at:          new Date().toISOString(),
    })
    .eq("id", params.tenantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Clear the plan override, reverting to the subscription-driven plan */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = getSessionFromCookies();
  if (!isBluuSuperAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tenants")
    .update({
      plan_override:       null,
      plan_override_until: null,
      updated_at:          new Date().toISOString(),
    })
    .eq("id", params.tenantId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
