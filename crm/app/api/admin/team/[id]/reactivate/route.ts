import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

// POST /api/admin/team/[id]/reactivate
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;
  const tenantId = actor.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: member, error: fetchErr } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!member) return NextResponse.json({ error: "Team member not found" }, { status: 404 });

    const { error } = await supabase
      .from("team_members")
      .update({ status: "active" })
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (error) throw error;

    const admin = createSupabaseAdminClient();
    const { data: userData } = await admin.auth.admin.getUserById(member.user_id);
    const label = userData?.user?.email ?? member.user_id;

    await logAuditEvent({
      action:    AUDIT_ACTIONS.TEAM_MEMBER_REACTIVATED,
      actorName: actor.name ?? actor.email,
      detail:    `Reactivated ${label}`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/admin/team/[id]/reactivate]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
