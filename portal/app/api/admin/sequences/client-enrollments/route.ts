import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { listEnrollments, getSequence } from "@/lib/wp-api";

// ─── GET /api/admin/sequences/client-enrollments ─────────────────────────────

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;

  const sp = new URL(req.url).searchParams;
  const clientIdStr = sp.get("clientId");
  if (!clientIdStr) {
    return NextResponse.json({ error: "clientId query param is required" }, { status: 400 });
  }
  const clientId = parseInt(clientIdStr, 10);
  if (isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid clientId" }, { status: 400 });
  }

  try {
    const { items } = await listEnrollments({
      per_page:   100,
      meta_key:   "enr_client_id",
      meta_value: clientId,
    });

    const active = items.filter((e) => e.acf.enr_status === "active");

    const enrollments = await Promise.all(
      active.map(async (e) => {
        let sequenceName = `Sequence #${e.acf.enr_sequence_id}`;
        let totalSteps = 0;
        try {
          const seq = await getSequence(e.acf.enr_sequence_id);
          sequenceName = seq.title.rendered;
          totalSteps = seq.acf.steps?.length ?? 0;
        } catch { /* sequence may have been deleted */ }
        return {
          enrollmentId: e.id,
          sequenceId:   e.acf.enr_sequence_id,
          sequenceName,
          currentStep:  e.acf.enr_current_step,
          totalSteps,
          enrolledAt:   e.acf.enr_enrolled_at,
        };
      })
    );

    return NextResponse.json({ enrollments });
  } catch (err: unknown) {
    console.error("[GET /api/admin/sequences/client-enrollments]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
