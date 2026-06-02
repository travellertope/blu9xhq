import { NextRequest, NextResponse } from "next/server";
import { listEnrollments, getSequence, updateEnrollment } from "@/lib/wp-api";
import { sendSequenceEmail } from "@/lib/resend";
import { generatePauseToken } from "@/lib/sequencePauseToken";

export const runtime = "nodejs";

// ─── GET /api/cron/process-sequences ─────────────────────────────────────────
// Runs daily (vercel.json: 0 7 * * *).
// Finds active enrollments whose next_send_at is due, sends the current step,
// and advances to the next step (or marks complete).

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("Authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = { checked: 0, sent: 0, completed: 0, errors: 0 };

  try {
    const { items } = await listEnrollments({
      per_page:   100,
      meta_key:   "enr_status",
      meta_value: "active",
    });

    // Guard against non-active slipping through if meta filter was previously missing
    const due = items.filter(
      (e) => e.acf.enr_status === "active" && new Date(e.acf.enr_next_send_at) <= now,
    );
    results.checked = due.length;

    for (const enrollment of due) {
      try {
        const sequence = await getSequence(enrollment.acf.enr_sequence_id);
        const steps = sequence.acf.steps ?? [];
        const stepIndex = enrollment.acf.enr_current_step;
        const step = steps[stepIndex];

        if (!step) {
          await updateEnrollment(enrollment.id, { acf: { enr_status: "completed" } });
          results.completed++;
          continue;
        }

        if (step.subject && step.body_html) {
          const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? "";
          const token   = generatePauseToken(enrollment.id);
          const pauseUrl = `${appUrl}/api/sequences/pause?token=${token}`;
          await sendSequenceEmail({
            to:       enrollment.acf.enr_client_email,
            subject:  step.subject,
            html:     step.body_html,
            pauseUrl,
            tags:     [{ name: "sequence_id", value: String(enrollment.acf.enr_sequence_id) }],
          });
          results.sent++;
        }

        const nextIndex = stepIndex + 1;
        const nextStep = steps[nextIndex];

        if (!nextStep) {
          await updateEnrollment(enrollment.id, {
            acf: { enr_status: "completed", enr_current_step: nextIndex },
          });
          results.completed++;
        } else {
          const delayMs = (nextStep.delay_days ?? 1) * 86_400_000;
          await updateEnrollment(enrollment.id, {
            acf: {
              enr_current_step: nextIndex,
              enr_next_send_at: new Date(now.getTime() + delayMs).toISOString(),
            },
          });
        }
      } catch (err) {
        console.error(`[process-sequences] enrollment ${enrollment.id}:`, err);
        results.errors++;
      }
    }

    return NextResponse.json({ ok: true, ...results });
  } catch (err: unknown) {
    console.error("[GET /api/cron/process-sequences]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
