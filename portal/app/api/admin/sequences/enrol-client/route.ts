import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { getSequence, createEnrollment, updateEnrollment } from "@/lib/wp-api";
import { sendSequenceEmail } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const bodySchema = z.object({
  clientId:    z.number().int().positive(),
  sequenceId:  z.number().int().positive(),
  clientEmail: z.string().email(),
});

// ─── POST /api/admin/sequences/enrol-client ───────────────────────────────────

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
    const sequence = await getSequence(d.sequenceId);
    const now = new Date();
    const steps = sequence.acf.steps ?? [];
    const firstStep = steps[0];
    const firstStepDelay = firstStep?.delay_days ?? 0;

    const nextSendAt = firstStepDelay > 0
      ? new Date(now.getTime() + firstStepDelay * 86_400_000).toISOString()
      : now.toISOString();

    const enrollment = await createEnrollment({
      title: `Enroll: Client ${d.clientId} / Seq ${d.sequenceId}`,
      acf: {
        enr_client_id:    d.clientId,
        enr_sequence_id:  d.sequenceId,
        enr_status:       "active",
        enr_current_step: 0,
        enr_enrolled_at:  now.toISOString(),
        enr_next_send_at: nextSendAt,
        enr_client_email: d.clientEmail,
      },
    });

    // Send step 0 immediately if no delay
    if (firstStep && firstStepDelay === 0 && firstStep.subject && firstStep.body_html) {
      await sendSequenceEmail({
        to:      d.clientEmail,
        subject: firstStep.subject,
        html:    firstStep.body_html,
        tags:    [{ name: "sequence_id", value: String(d.sequenceId) }],
      });

      const nextStep = steps[1];
      await updateEnrollment(enrollment.id, {
        acf: {
          enr_current_step: 1,
          enr_next_send_at: nextStep
            ? new Date(now.getTime() + (nextStep.delay_days ?? 1) * 86_400_000).toISOString()
            : now.toISOString(),
          ...(nextStep ? {} : { enr_status: "completed" }),
        },
      });
    }

    logAuditEvent({
      action:        AUDIT_ACTIONS.CLIENT_ENROLLED_IN_SEQUENCE,
      actorName:     (actor.name as string) ?? "Unknown",
      actorWpUserId: actor.wpUserId as number,
      detail:        `Enrolled in sequence "${sequence.title.rendered}" (WP #${d.sequenceId})`,
      clientId:      d.clientId,
    }).catch(console.error);

    return NextResponse.json({ success: true, enrollmentId: enrollment.id });
  } catch (err: unknown) {
    console.error("[POST /api/admin/sequences/enrol-client]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
