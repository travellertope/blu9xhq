import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendSequenceEmail } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const bodySchema = z.object({
  clientId:    z.string().uuid(),
  sequenceId:  z.string().uuid(),
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

  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as Record<string, unknown>;
  const tenantId = actor.tenantId as string;

  try {
    const supabase = createSupabaseAdminClient();

    const { data: sequence, error: seqErr } = await supabase
      .from("sequences")
      .select("*, sequence_steps(*)")
      .eq("id", d.sequenceId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (seqErr) throw seqErr;
    if (!sequence) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });

    const now = new Date();
    const steps = (sequence.sequence_steps ?? []).slice().sort((a: any, b: any) => a.step_number - b.step_number);
    const firstStep = steps[0];
    const firstStepDelay = firstStep?.delay_days ?? 0;

    const nextSendAt = firstStepDelay > 0
      ? new Date(now.getTime() + firstStepDelay * 86_400_000).toISOString()
      : now.toISOString();

    const { data: enrollment, error: enrErr } = await supabase
      .from("sequence_enrollments")
      .insert({
        tenant_id:    tenantId,
        client_id:    d.clientId,
        sequence_id:  d.sequenceId,
        status:       "active",
        current_step: 0,
        enrolled_at:  now.toISOString(),
        next_send_at: nextSendAt,
        client_email: d.clientEmail,
      })
      .select("*")
      .single();
    if (enrErr) throw enrErr;

    // Send step 0 immediately if no delay
    if (firstStep && firstStepDelay === 0 && firstStep.subject && firstStep.body_html) {
      await sendSequenceEmail({
        to:      d.clientEmail,
        subject: firstStep.subject,
        html:    firstStep.body_html,
        tags:    [{ name: "sequence_id", value: d.sequenceId }],
      });

      const nextStep = steps[1];
      const { error: updErr } = await supabase
        .from("sequence_enrollments")
        .update({
          current_step: 1,
          next_send_at: nextStep
            ? new Date(now.getTime() + (nextStep.delay_days ?? 1) * 86_400_000).toISOString()
            : now.toISOString(),
          ...(nextStep ? {} : { status: "completed" }),
        })
        .eq("id", enrollment.id);
      if (updErr) throw updErr;
    }

    logAuditEvent({
      action:    AUDIT_ACTIONS.CLIENT_ENROLLED_IN_SEQUENCE,
      actorName: (actor.name as string) ?? "Unknown",
      detail:    `Enrolled in sequence "${sequence.title}"`,
      clientId:  d.clientId,
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
