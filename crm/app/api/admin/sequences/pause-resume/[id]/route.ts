import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["pause", "resume"]),
});

// PATCH /api/admin/sequences/pause-resume/[id]
// Admin can manually pause or resume an enrollment.

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requirePermission(req, "build_sequences");
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "action must be 'pause' or 'resume'" }, { status: 422 });
  }
  const { action } = parsed.data;

  try {
    const supabase = createSupabaseServerClient();
    const { data: enrollment, error: fetchErr } = await supabase
      .from("sequence_enrollments")
      .select("status")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!enrollment) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

    if (action === "pause" && enrollment.status !== "active") {
      return NextResponse.json({ error: "Enrollment is not active" }, { status: 409 });
    }
    if (action === "resume" && enrollment.status !== "paused") {
      return NextResponse.json({ error: "Enrollment is not paused" }, { status: 409 });
    }

    const update =
      action === "pause"
        ? { status: "paused", paused_at: new Date().toISOString() }
        : { status: "active",  paused_at: null };

    const { error: updErr } = await supabase
      .from("sequence_enrollments")
      .update(update)
      .eq("id", params.id)
      .eq("tenant_id", tenantId);
    if (updErr) throw updErr;

    return NextResponse.json({ ok: true, status: action === "pause" ? "paused" : "active" });
  } catch (err) {
    console.error(`[PATCH /api/admin/sequences/pause-resume/${params.id}]`, err);
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
  }
}
