import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { updateEnrollment, wpRestFetch } from "@/lib/wp-api";
import type { WPEnrollmentPost } from "@/lib/wp-api";
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

  const enrollmentId = parseInt(params.id, 10);
  if (isNaN(enrollmentId)) {
    return NextResponse.json({ error: "Invalid enrollment ID" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "action must be 'pause' or 'resume'" }, { status: 422 });
  }
  const { action } = parsed.data;

  try {
    const enrollment = await wpRestFetch<WPEnrollmentPost>(
      `/wp/v2/bluu_seq_enrollment/${enrollmentId}`
    );

    if (action === "pause" && enrollment.acf.enr_status !== "active") {
      return NextResponse.json({ error: "Enrollment is not active" }, { status: 409 });
    }
    if (action === "resume" && enrollment.acf.enr_status !== "paused") {
      return NextResponse.json({ error: "Enrollment is not paused" }, { status: 409 });
    }

    const acfUpdate =
      action === "pause"
        ? { enr_status: "paused", enr_paused_at: new Date().toISOString() }
        : { enr_status: "active",  enr_paused_at: "" };

    await updateEnrollment(enrollmentId, { acf: acfUpdate });

    return NextResponse.json({ ok: true, status: action === "pause" ? "paused" : "active" });
  } catch (err) {
    console.error(`[PATCH /api/admin/sequences/pause-resume/${enrollmentId}]`, err);
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 });
  }
}
