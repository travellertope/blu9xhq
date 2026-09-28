import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BLUU_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const session = getSessionFromCookies();
  if (
    !session ||
    session.user.role !== "bluu_admin" ||
    session.user.bluuhqRole !== "super_admin" ||
    session.user.tenantId !== BLUU_TENANT_ID
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, slug, plan, plan_override, plan_override_until, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
