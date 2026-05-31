import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { removeFromSequence } from "@/lib/loops";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const bodySchema = z.object({
  clientId:        z.number().int().positive(),
  sequenceLoopsId: z.string().min(1),
  clientEmail:     z.string().email(),
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

  const result = await requirePermission(req, "build_sequences", d.clientId);
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as Record<string, unknown>;

  try {
    await removeFromSequence(d.clientEmail, d.sequenceLoopsId);

    logAuditEvent({
      action:        AUDIT_ACTIONS.CLIENT_REMOVED_FROM_SEQUENCE,
      actorName:     (actor.name as string) ?? "Unknown",
      actorWpUserId: actor.wpUserId as number,
      detail:        `Removed from sequence ${d.sequenceLoopsId}`,
      clientId:      d.clientId,
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
