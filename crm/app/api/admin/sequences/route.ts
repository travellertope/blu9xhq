import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const maxDuration = 30;
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
  const session = getSessionFromCookies();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tenantId = session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("sequences")
      .select("*, sequence_steps(*)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[GET /api/admin/sequences] DB error:", error.message, error.code);
      return NextResponse.json({ sequences: [] });
    }
    return NextResponse.json({ sequences: (data ?? []).map(mapSequence) });
  } catch (err: unknown) {
    console.error("[GET /api/admin/sequences]", err);
    return NextResponse.json({ sequences: [] });
  }
}

// ─── POST /api/admin/sequences ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.user.bluuhqRole, "build_sequences")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tenantId = session.user.tenantId!;

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
    const supabase = createSupabaseAdminClient();

    const { data: sequence, error } = await supabase
      .from("sequences")
      .insert({
        tenant_id:           tenantId,
        title:               d.title,
        trigger:             d.trigger,
        description:         d.description || null,
        trigger_delay_days:  d.triggerDelayDays ?? 0,
        exit_conditions:     d.exitConditions ?? [],
        is_active:           d.isActive ?? false,
      })
      .select("*")
      .single();
    if (error) throw error;

    if (d.steps.length > 0) {
      const { error: stepErr } = await supabase.from("sequence_steps").insert(
        d.steps.map((s) => ({
          sequence_id:        sequence.id,
          tenant_id:          tenantId,
          step_number:        s.stepNumber,
          delay_days:         s.delayDays,
          subject:            s.subject || null,
          body_html:          s.bodyHtml || null,
          email_template_id:  s.emailTemplateId || null,
        }))
      );
      if (stepErr) throw stepErr;
    }

    const { data: full } = await supabase
      .from("sequences")
      .select("*, sequence_steps(*)")
      .eq("id", sequence.id)
      .single();

    return NextResponse.json({ sequence: mapSequence(full ?? sequence) }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/admin/sequences]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
