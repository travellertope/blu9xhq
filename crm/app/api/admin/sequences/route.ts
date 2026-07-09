import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireSession } from "@/lib/apiPermissions";
import { listSequences, createSequence, type WPSequencePost } from "@/lib/wp-api";
import { z } from "zod";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isTruthy(v: boolean | string | number | undefined): boolean {
  return v === true || v === 1 || v === "1" || v === "true";
}

function transformSequence(post: WPSequencePost) {
  const a = post.acf;
  let exitConditions: string[] = [];
  try { exitConditions = JSON.parse(a.exit_conditions ?? "[]") ?? []; } catch { /* ignore */ }
  return {
    id:    post.id,
    title: post.title.rendered,
    acf: {
      trigger:            a.trigger,
      description:        a.description,
      trigger_delay_days: a.trigger_delay_days ?? 0,
      exit_conditions:    exitConditions,
      is_active:          isTruthy(a.is_active),
      seq_loops_id:       a.seq_loops_id,
      seq_loops_synced_at: a.seq_loops_synced_at,
      steps:              a.steps ?? [],
    },
  };
}

const stepSchema = z.object({
  stepNumber:      z.number().int().positive(),
  delayDays:       z.number().int().min(0),
  subject:         z.string().optional(),
  bodyHtml:        z.string().optional(),
  emailTemplateId: z.number().int().positive().optional(),
});

const postSchema = z.object({
  title:             z.string().min(1),
  trigger:           z.string().min(1),
  description:       z.string().optional(),
  triggerDelayDays:  z.number().int().min(0).optional(),
  exitConditions:    z.array(z.string()).optional(),
  steps:             z.array(stepSchema),
  isActive:          z.boolean().optional(),
});

// ─── GET /api/admin/sequences ─────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;

  try {
    const { items } = await listSequences();
    const sequences = items.map(transformSequence);
    return NextResponse.json({ sequences });
  } catch (err: unknown) {
    console.error("[GET /api/admin/sequences]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

// ─── POST /api/admin/sequences ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;

  const rawBody = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  try {
    const post = await createSequence({
      title: d.title,
      acf: {
        trigger:            d.trigger,
        description:        d.description,
        trigger_delay_days: d.triggerDelayDays,
        exit_conditions:    JSON.stringify(d.exitConditions ?? []),
        steps:              d.steps.map((s) => ({
          step_number:       s.stepNumber,
          delay_days:        s.delayDays,
          ...(s.subject         !== undefined ? { subject:           s.subject         } : {}),
          ...(s.bodyHtml        !== undefined ? { body_html:         s.bodyHtml        } : {}),
          ...(s.emailTemplateId !== undefined ? { email_template_id: s.emailTemplateId } : {}),
        })),
        is_active:          d.isActive ? "1" : "0",
      },
    });
    return NextResponse.json({ sequence: transformSequence(post) }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/admin/sequences]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
