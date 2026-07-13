import { NextRequest, NextResponse } from "next/server";
import { requirePermission, requireSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

function mapSequence(row: any) {
  const steps = (row.sequence_steps ?? [])
    .slice()
    .sort((a: any, b: any) => a.step_number - b.step_number)
    .map((s: any) => ({
      step_number:        s.step_number,
      delay_days:         s.delay_days,
      subject:            s.subject ?? undefined,
      body_html:          s.body_html ?? undefined,
      email_template_id:  s.email_template_id ?? undefined,
    }));

  return {
    id:    row.id,
    title: row.title,
    acf: {
      trigger:            row.trigger,
      description:        row.description ?? undefined,
      trigger_delay_days: row.trigger_delay_days ?? 0,
      exit_conditions:    row.exit_conditions ?? [],
      is_active:          row.is_active,
      steps,
    },
  };
}

const stepSchema = z.object({
  stepNumber:      z.number().int().positive(),
  delayDays:       z.number().int().min(0),
  subject:         z.string().optional(),
  bodyHtml:        z.string().optional(),
  emailTemplateId: z.string().uuid().optional(),
});

const patchSchema = z.object({
  title:            z.string().min(1).optional(),
  trigger:          z.string().min(1).optional(),
  description:      z.string().optional(),
  triggerDelayDays: z.number().int().min(0).optional(),
  exitConditions:   z.array(z.string()).optional(),
  steps:            z.array(stepSchema).optional(),
  isActive:         z.boolean().optional(),
});

// ─── GET /api/admin/sequences/[id] ───────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sequences")
      .select("*, sequence_steps(*)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });
    return NextResponse.json({ sequence: mapSequence(data) });
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
  const tenantId = result.session.user.tenantId!;

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
    const supabase = createSupabaseServerClient();

    const update: Record<string, unknown> = {};
    if (d.title             !== undefined) update.title = d.title;
    if (d.trigger           !== undefined) update.trigger = d.trigger;
    if (d.description       !== undefined) update.description = d.description;
    if (d.triggerDelayDays  !== undefined) update.trigger_delay_days = d.triggerDelayDays;
    if (d.exitConditions    !== undefined) update.exit_conditions = d.exitConditions;
    if (d.isActive          !== undefined) update.is_active = d.isActive;

    if (Object.keys(update).length > 0) {
      const { error } = await supabase
        .from("sequences")
        .update(update)
        .eq("id", params.id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
    }

    if (d.steps !== undefined) {
      const { error: delErr } = await supabase
        .from("sequence_steps")
        .delete()
        .eq("sequence_id", params.id);
      if (delErr) throw delErr;

      if (d.steps.length > 0) {
        const { error: insErr } = await supabase.from("sequence_steps").insert(
          d.steps.map((s) => ({
            sequence_id:        params.id,
            tenant_id:          tenantId,
            step_number:        s.stepNumber,
            delay_days:         s.delayDays,
            subject:            s.subject || null,
            body_html:          s.bodyHtml || null,
            email_template_id:  s.emailTemplateId || null,
          }))
        );
        if (insErr) throw insErr;
      }
    }

    const { data: full, error: fetchErr } = await supabase
      .from("sequences")
      .select("*, sequence_steps(*)")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!full) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });

    return NextResponse.json({ sequence: mapSequence(full) });
  } catch (err: unknown) {
    console.error("[PATCH /api/admin/sequences/[id]]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
