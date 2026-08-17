import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function GET() {
  try {
    const session = getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    const { data: memberships, error } = await supabase
      .from("team_members")
      .select("tenant_id, crm_role, tenants(id, name, slug, logo_url)")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (error) {
      throw new Error(error.message);
    }

    const currentTenantId = session.user.tenantId;

    const tenants = (memberships ?? []).map((m: any) => ({
      id: m.tenants.id,
      name: m.tenants.name,
      slug: m.tenants.slug,
      logoUrl: m.tenants.logo_url,
      role: m.crm_role,
      isCurrent: m.tenant_id === currentTenantId,
    }));

    return NextResponse.json({ tenants });
  } catch (err: any) {
    console.error("[GET /api/admin/tenants]", err);
    return NextResponse.json({ error: err.message ?? "Failed to list tenants" }, { status: 500 });
  }
}
