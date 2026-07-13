import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const bodySchema = z.object({
  clientId:     z.string().uuid(),
  enrollmentId: z.string().uuid(),
});

// ─── POST /api/admin/sequences/remove-client ──────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as Record<string, unknown>;
  const tenantId = actor.tenantId as string;

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from("sequence_enrollments")
      .update({
        status:      "exited",
        exited_at:   new Date().toISOString(),
        exit_reason: "manual",
      })
      .eq("id", d.enrollmentId)
      .eq("tenant_id", tenantId);
    if (error) throw error;

    logAuditEvent({
      action:    AUDIT_ACTIONS.CLIENT_REMOVED_FROM_SEQUENCE,
      actorName: (actor.name as string) ?? "Unknown",
      detail:    `Exited enrollment #${d.enrollmentId}`,
      clientId:  d.clientId,
    }).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[POST /api/admin/sequences/remove-client]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
