import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireSession } from "@/lib/apiPermissions";
import { getSequence, updateSequence, type WPSequencePost } from "@/lib/wp-api";
import { z } from "zod";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isTruthy(v: boolean | string | number | undefined): boolean {
  return v === true || v === 1 || v === "1" || v === "true";
}

function transformSequence(post: WPSequencePost) {
  const a = post.acf;
  return {
    id:           post.id,
    title:        post.title.rendered,
    trigger:      a.trigger,
    steps:        (a.steps ?? []).map((s) => ({
      stepNumber:      s.step_number,
      delayDays:       s.delay_days,
      emailTemplateId: s.email_template_id,
    })),
    isActive:      isTruthy(a.is_active),
    loopsId:       a.seq_loops_id,
    loopsSyncedAt: a.seq_loops_synced_at,
  };
}

const stepSchema = z.object({
  stepNumber:      z.number().int().positive(),
  delayDays:       z.number().int().min(0),
  emailTemplateId: z.number().int().positive(),
});

const patchSchema = z.object({
  title:            z.string().min(1).optional(),
  trigger:          z.string().min(1).optional(),
  description:      z.string().optional(),
  triggerDelayDays: z.number().int().min(0).optional(),
  exitConditions:   z.array(z.string()).optional(),
  steps:            z.array(stepSchema).optional(),
  isActive:         z.boolean().optional(),
  loopsId:          z.string().optional(),
});

// ─── GET /api/admin/sequences/[id] ───────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const post = await getSequence(id);
    return NextResponse.json({ sequence: transformSequence(post) });
  } catch (err: unknown) {
    console.error("[GET /api/admin/sequences/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}

// ─── PATCH /api/admin/sequences/[id] ─────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requirePermission(req, "build_sequences");
  if (result instanceof NextResponse) return result;

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const rawBody = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  try {
    const post = await updateSequence(id, {
      ...(d.title ? { title: d.title } : {}),
      acf: {
        ...(d.trigger           !== undefined ? { trigger:            d.trigger }                        : {}),
        ...(d.description       !== undefined ? { description:        d.description }                   : {}),
        ...(d.triggerDelayDays  !== undefined ? { trigger_delay_days: d.triggerDelayDays }              : {}),
        ...(d.exitConditions    !== undefined ? { exit_conditions:    JSON.stringify(d.exitConditions) } : {}),
        ...(d.steps             !== undefined ? {
          steps: d.steps.map((s) => ({
            step_number:       s.stepNumber,
            delay_days:        s.delayDays,
            email_template_id: s.emailTemplateId,
          })),
        } : {}),
        ...(d.isActive !== undefined ? { is_active: d.isActive ? "1" : "0" } : {}),
        ...(d.loopsId  !== undefined ? { seq_loops_id: d.loopsId }            : {}),
      },
    });
    return NextResponse.json({ sequence: transformSequence(post) });
  } catch (err: unknown) {
    console.error("[PATCH /api/admin/sequences/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
