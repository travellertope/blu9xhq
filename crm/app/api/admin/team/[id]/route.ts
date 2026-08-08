import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const patchSchema = z.object({
  role:            z.enum(["super_admin", "account_manager", "billing_manager", "support_staff", "viewer"]).optional(),
  assignedClients: z.array(z.string().uuid()).optional(),
});

// PATCH /api/admin/team/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;
  const tenantId = actor.tenantId!;

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.role            !== undefined) update.crm_role         = parsed.data.role;
  if (parsed.data.assignedClients !== undefined) update.assigned_clients = parsed.data.assignedClients;

  try {
    const supabase = createSupabaseAdminClient();
    const { data: updated, error } = await supabase
      .from("team_members")
      .update(update)
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .select("*")
      .single();

    if (error) throw error;

    await logAuditEvent({
      action:    AUDIT_ACTIONS.TEAM_MEMBER_ROLE_CHANGED,
      actorName: actor.name ?? actor.email,
      detail: parsed.data.role
        ? `Changed role to ${parsed.data.role}`
        : `Updated assigned clients`,
    });

    return NextResponse.json({ member: updated });
  } catch (err: any) {
    console.error("[PATCH /api/admin/team/[id]]", err);
    return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 502 });
  }
}
