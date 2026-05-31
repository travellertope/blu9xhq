import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

// POST /api/admin/team/[id]/reactivate
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const user = await wpRestFetch<any>(`/wp/v2/users/${userId}`);

    await wpRestFetch(`/wp/v2/users/${userId}`, {
      method: "POST",
      body: JSON.stringify({ meta: { bluuhq_status: "active" } }),
    });

    await logAuditEvent({
      action:        AUDIT_ACTIONS.TEAM_MEMBER_REACTIVATED,
      actorName:     actor.name ?? actor.email,
      actorWpUserId: actor.wpUserId,
      detail:        `Reactivated ${user.name} (${user.email})`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/admin/team/[id]/reactivate]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
