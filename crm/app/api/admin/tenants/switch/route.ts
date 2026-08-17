import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const tenantId: string = body.tenantId ?? "";

    if (!tenantId) {
      return NextResponse.json({ error: "tenantId is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Verify the user belongs to this tenant
    const { data: membership, error } = await supabase
      .from("team_members")
      .select("crm_role")
      .eq("user_id", session.user.id)
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!membership) {
      return NextResponse.json({ error: "You do not belong to this tenant" }, { status: 403 });
    }

    const crmRole = membership.crm_role;

    // Set the active tenant cookie
    cookies().set("bluu_active_tenant", JSON.stringify({ tenantId, crmRole }), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 365 days
    });

    return NextResponse.json({ ok: true, tenantId, role: crmRole });
  } catch (err: any) {
    console.error("[POST /api/admin/tenants/switch]", err);
    return NextResponse.json({ error: err.message ?? "Failed to switch tenant" }, { status: 500 });
  }
}
