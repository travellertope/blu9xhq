import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const VISIBLE_STATUSES = ["active", "paused", "completed", "exited"];

// ─── GET /api/admin/sequences/client-enrollments ─────────────────────────────

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  const sp = new URL(req.url).searchParams;
  const clientId = sp.get("clientId");
  if (!clientId) {
    return NextResponse.json({ error: "clientId query param is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("sequence_enrollments")
      .select("*, sequences(title, sequence_steps(step_number))")
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId)
      .in("status", VISIBLE_STATUSES);

    if (error) throw error;

    const enrollments = (data ?? []).map((e: any) => ({
      enrollmentId: e.id,
      sequenceId:   e.sequence_id,
      sequenceName: e.sequences?.title ?? `Sequence ${e.sequence_id}`,
      status:       e.status as "active" | "paused" | "completed" | "exited",
      currentStep:  e.current_step,
      totalSteps:   e.sequences?.sequence_steps?.length ?? 0,
      enrolledAt:   e.enrolled_at,
      pausedAt:     e.paused_at ?? null,
      exitedAt:     e.exited_at ?? null,
      exitReason:   e.exit_reason ?? null,
    }));

    return NextResponse.json({ enrollments });
  } catch (err: unknown) {
    console.error("[GET /api/admin/sequences/client-enrollments]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
