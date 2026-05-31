import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { getSequence, updateSequence } from "@/lib/wp-api";
import { createOrUpdateSequence } from "@/lib/loops";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";

// ─── POST /api/admin/sequences/[id]/sync ─────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as Record<string, unknown>;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const sequence = await getSequence(id);

    const loopsId = await createOrUpdateSequence({
      wpSequenceId: id,
      name:         sequence.title.rendered,
      trigger:      sequence.acf.trigger,
    });

    await updateSequence(id, {
      acf: {
        seq_loops_id:       loopsId,
        seq_loops_synced_at: new Date().toISOString(),
      },
    });

    logAuditEvent({
      action:         AUDIT_ACTIONS.SEQUENCE_SYNCED,
      actorName:      (actor.name as string) ?? "Unknown",
      actorWpUserId:  actor.wpUserId as number,
      detail:         `Synced sequence "${sequence.title.rendered}" → Loops ID ${loopsId}`,
    }).catch(console.error);

    return NextResponse.json({ success: true, loopsId });
  } catch (err: unknown) {
    console.error("[POST /api/admin/sequences/[id]/sync]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
