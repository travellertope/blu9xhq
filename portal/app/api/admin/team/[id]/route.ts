import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const patchSchema = z.object({
  role:            z.enum(["super_admin", "account_manager", "billing_manager", "support_staff", "viewer"]).optional(),
  assignedClients: z.array(z.number()).optional(),
});

// PATCH /api/admin/team/[id]
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await requirePermission(req, "manage_team");
    if (result instanceof NextResponse) return result;
    const { session } = result;
    const actor = session.user as any;

    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
    }

    const meta: Record<string, unknown> = {};
    if (parsed.data.role            !== undefined) meta.bluuhq_role             = parsed.data.role;
    // WP stores this meta as a JSON-encoded string; send it as such to satisfy type validation
    if (parsed.data.assignedClients !== undefined) meta.bluuhq_assigned_clients = JSON.stringify(parsed.data.assignedClients);

    const updated = await wpRestFetch<any>(`/wp/v2/users/${userId}`, {
      method: "POST",
      body: JSON.stringify({ meta }),
    });

    await logAuditEvent({
      action:        AUDIT_ACTIONS.TEAM_MEMBER_ROLE_CHANGED,
      actorName:     actor.name ?? actor.email,
      actorWpUserId: actor.wpUserId,
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
