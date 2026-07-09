import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

// POST /api/admin/team/[id]/deactivate
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  // Prevent self-deactivation
  if (userId === actor.wpUserId) {
    return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
  }

  try {
    // Fetch current user for the audit log name
    const user = await wpRestFetch<any>(`/wp/v2/users/${userId}`);

    await wpRestFetch(`/wp/v2/users/${userId}`, {
      method: "POST",
      body: JSON.stringify({ meta: { bluuhq_status: "deactivated" } }),
    });

    await logAuditEvent({
      action:        AUDIT_ACTIONS.TEAM_MEMBER_DEACTIVATED,
      actorName:     actor.name ?? actor.email,
      actorWpUserId: actor.wpUserId,
      detail:        `Deactivated ${user.name} (${user.email})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/admin/team/[id]/deactivate]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
