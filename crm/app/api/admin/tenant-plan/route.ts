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

    const tenantId = session.user.tenantId;
    if (!tenantId) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tenants")
      .select("plan")
      .eq("id", tenantId)
      .single();

    if (error || !data) {
      return NextResponse.json({ plan: "free" });
    }

    return NextResponse.json({ plan: data.plan ?? "free" });
  } catch (err: any) {
    console.error("[GET /api/admin/tenant-plan]", err);
    return NextResponse.json({ plan: "free" });
  }
}
