import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendSequenceEmail } from "@/lib/resend";
import { generatePauseToken } from "@/lib/sequencePauseToken";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── GET /api/cron/process-sequences ─────────────────────────────────────────
// Runs daily (vercel.json: 0 7 * * *).
// Finds active enrollments (across all tenants) whose next_send_at is due,
// sends the current step, and advances to the next step (or marks complete).
// Uses the service-role client since this has no per-tenant session context.

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("Authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { checked: 0, sent: 0, completed: 0, errors: 0 };

  try {
    const supabase = createSupabaseAdminClient();
    const { data: due, error } = await supabase
      .from("sequence_enrollments")
      .select("*, sequences(sequence_steps(*))")
      .eq("status", "active")
      .lte("next_send_at", now.toISOString());
    if (error) throw error;

    results.checked = due?.length ?? 0;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

    await Promise.allSettled(
      (due ?? []).map(async (enrollment: any) => {
        try {
          const steps = (enrollment.sequences?.sequence_steps ?? [])
            .slice()
            .sort((a: any, b: any) => a.step_number - b.step_number);
          const stepIndex = enrollment.current_step;
          const step = steps[stepIndex];

          if (!step) {
            await supabase.from("sequence_enrollments").update({ status: "completed" }).eq("id", enrollment.id);
            results.completed++;
            return;
          }

          if (step.subject && step.body_html) {
            const token    = generatePauseToken(enrollment.id);
            const pauseUrl = `${appUrl}/api/sequences/pause?token=${token}`;
            await sendSequenceEmail({
              to:      enrollment.client_email,
              subject: step.subject,
              html:    step.body_html,
              pauseUrl,
              tags:    [{ name: "sequence_id", value: enrollment.sequence_id }],
            });
            results.sent++;
          }

          const nextIndex = stepIndex + 1;
          const nextStep  = steps[nextIndex];

          if (!nextStep) {
            await supabase
              .from("sequence_enrollments")
              .update({ status: "completed", current_step: nextIndex })
              .eq("id", enrollment.id);
            results.completed++;
          } else {
            const delayMs = (nextStep.delay_days ?? 1) * 86_400_000;
            await supabase
              .from("sequence_enrollments")
              .update({
                current_step: nextIndex,
                next_send_at: new Date(now.getTime() + delayMs).toISOString(),
              })
              .eq("id", enrollment.id);
          }
        } catch (err) {
          console.error(`[process-sequences] enrollment ${enrollment.id}:`, err);
          results.errors++;
        }
      })
    );

    return NextResponse.json({ ok: true, ...results });
  } catch (err: unknown) {
    console.error("[GET /api/cron/process-sequences]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
