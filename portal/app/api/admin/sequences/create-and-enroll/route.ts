import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSequence, createEnrollment, updateEnrollment } from "@/lib/wp-api";
import { sendSequenceEmail } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const stepSchema = z.object({
  delayDays: z.number().int().min(0),
  subject:   z.string().min(1),
  bodyHtml:  z.string().min(1),
});

const bodySchema = z.object({
  clientId:    z.number().int().positive(),
  clientEmail: z.string().email(),
  clientName:  z.string().optional(),
  title:       z.string().min(1),
  steps:       z.array(stepSchema).min(1),
});

// ─── POST /api/admin/sequences/create-and-enroll ──────────────────────────────

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
    // 1. Create sequence (client-specific, manual trigger, private)
    const sequence = await createSequence({
      title: d.title,
      acf: {
        trigger:         "manual",
        description:     `Client-specific sequence for ${d.clientName ?? d.clientEmail}`,
        exit_conditions: JSON.stringify(["client_replied"]),
        is_active:       "1",
        steps: d.steps.map((s, i) => ({
          step_number: i + 1,
          delay_days:  s.delayDays,
          subject:     s.subject,
          body_html:   s.bodyHtml,
        })),
      },
    });

    // 2. Enroll client
    const now = new Date();
    const firstStep = d.steps[0];
    const nextSendAt = firstStep.delayDays > 0
      ? new Date(now.getTime() + firstStep.delayDays * 86_400_000).toISOString()
      : now.toISOString();

    const enrollment = await createEnrollment({
      title: `Enroll: Client ${d.clientId} / Seq ${sequence.id}`,
      acf: {
        enr_client_id:    d.clientId,
        enr_sequence_id:  sequence.id,
        enr_status:       "active",
        enr_current_step: 0,
        enr_enrolled_at:  now.toISOString(),
        enr_next_send_at: nextSendAt,
        enr_client_email: d.clientEmail,
        enr_client_name:  d.clientName,
      },
    });

    // 3. Send step 0 immediately if no delay
    if (firstStep.delayDays === 0) {
      await sendSequenceEmail({
        to:      d.clientEmail,
        subject: firstStep.subject,
        html:    firstStep.bodyHtml,
        tags:    [{ name: "sequence_id", value: String(sequence.id) }],
      });

      const nextStep = d.steps[1];
      await updateEnrollment(enrollment.id, {
        acf: {
          enr_current_step: 1,
          enr_next_send_at: nextStep
            ? new Date(now.getTime() + (nextStep.delayDays ?? 1) * 86_400_000).toISOString()
            : now.toISOString(),
          ...(nextStep ? {} : { enr_status: "completed" }),
        },
      });
    }

    logAuditEvent({
      action:        AUDIT_ACTIONS.CLIENT_ENROLLED_IN_SEQUENCE,
      actorName:     (actor.name as string) ?? "Unknown",
      actorWpUserId: actor.wpUserId as number,
      detail:        `Created & enrolled in personalised sequence "${d.title}" (WP #${sequence.id})`,
      clientId:      d.clientId,
    }).catch(console.error);

    return NextResponse.json({ success: true, sequenceId: sequence.id, enrollmentId: enrollment.id }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/admin/sequences/create-and-enroll]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
