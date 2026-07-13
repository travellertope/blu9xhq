import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendSequenceEmail } from "@/lib/resend";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { z } from "zod";

const stepSchema = z.object({
  delayDays: z.number().int().min(0),
  subject:   z.string().min(1),
  bodyHtml:  z.string().min(1),
});

const bodySchema = z.object({
  clientId:    z.string().uuid(),
  clientEmail: z.string().email(),
  clientName:  z.string().optional(),
  title:       z.string().min(1),
  steps:       z.array(stepSchema).min(1),
});

// ─── POST /api/admin/sequences/create-and-enroll ──────────────────────────────

export async function POST(req: NextRequest) {
  try {
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

      // 1. Create sequence (client-specific, manual trigger, private)
      const { data: sequence, error: seqErr } = await supabase
        .from("sequences")
        .insert({
          tenant_id:        tenantId,
          title:            d.title,
          trigger:          "manual",
          description:      `Client-specific sequence for ${d.clientName ?? d.clientEmail}`,
          exit_conditions:  ["client_replied"],
          is_active:        true,
        })
        .select("*")
        .single();
      if (seqErr) throw seqErr;

      const { error: stepErr } = await supabase.from("sequence_steps").insert(
        d.steps.map((s, i) => ({
          sequence_id: sequence.id,
          tenant_id:   tenantId,
          step_number: i + 1,
          delay_days:  s.delayDays,
          subject:     s.subject,
          body_html:   s.bodyHtml,
        }))
      );
      if (stepErr) throw stepErr;

      // 2. Enroll client
      const now = new Date();
      const firstStep = d.steps[0];
      const nextSendAt = firstStep.delayDays > 0
        ? new Date(now.getTime() + firstStep.delayDays * 86_400_000).toISOString()
        : now.toISOString();

      const { data: enrollment, error: enrErr } = await supabase
        .from("sequence_enrollments")
        .insert({
          tenant_id:    tenantId,
          client_id:    d.clientId,
          sequence_id:  sequence.id,
          status:       "active",
          current_step: 0,
          enrolled_at:  now.toISOString(),
          next_send_at: nextSendAt,
          client_email: d.clientEmail,
          client_name:  d.clientName || null,
        })
        .select("*")
        .single();
      if (enrErr) throw enrErr;

      // 3. Send step 0 immediately if no delay
      if (firstStep.delayDays === 0) {
        await sendSequenceEmail({
          to:      d.clientEmail,
          subject: firstStep.subject,
          html:    firstStep.bodyHtml,
          tags:    [{ name: "sequence_id", value: sequence.id }],
        });

        const nextStep = d.steps[1];
        const { error: updErr } = await supabase
          .from("sequence_enrollments")
          .update({
            current_step: 1,
            next_send_at: nextStep
              ? new Date(now.getTime() + (nextStep.delayDays ?? 1) * 86_400_000).toISOString()
              : now.toISOString(),
            ...(nextStep ? {} : { status: "completed" }),
          })
          .eq("id", enrollment.id);
        if (updErr) throw updErr;
      }

      logAuditEvent({
        action:    AUDIT_ACTIONS.CLIENT_ENROLLED_IN_SEQUENCE,
        actorName: (actor.name as string) ?? "Unknown",
        detail:    `Created & enrolled in personalised sequence "${d.title}"`,
        clientId:  d.clientId,
      }).catch(console.error);

      return NextResponse.json({ success: true, sequenceId: sequence.id, enrollmentId: enrollment.id }, { status: 201 });
    } catch (err: unknown) {
      console.error("[POST /api/admin/sequences/create-and-enroll] error:", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Unknown error" },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    console.error("[POST /api/admin/sequences/create-and-enroll] Unhandled:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
