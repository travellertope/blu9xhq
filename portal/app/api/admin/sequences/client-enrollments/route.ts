import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { wpRestList, listSequences, type WPCommunicationPost } from "@/lib/wp-api";

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
    // Fetch audit log comms for this client where channel=system
    const { items } = await wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
      per_page:   100,
      status:     "publish",
      meta_key:   "comm_client",
      meta_value: clientId,
      orderby:    "date",
      order:      "asc",
    });

    // Filter for system-channel posts that record enrol/remove actions
    const relevant = items.filter((p) => {
      const subj: string = p.acf?.comm_subject ?? "";
      return (
        p.acf?.comm_channel === "system" &&
        (subj.includes("client_enrolled_in_sequence") ||
          subj.includes("client_removed_from_sequence"))
      );
    });

    // Build enrollment state per loopsId: last action wins
    // Subject format from logAuditEvent: "<action> by <actorName>"
    // Detail format: "Enrolled in sequence <loopsId>" / "Removed from sequence <loopsId>"
    type EnrollEntry = {
      loopsId: string;
      action: "enrolled" | "removed";
      occurredAt: string;
      postDate: string;
    };

    const entries: EnrollEntry[] = relevant.map((p) => {
      const detail: string = p.acf?.comm_content ?? "";
      const subject: string = p.acf?.comm_subject ?? "";
      const isEnrol = subject.includes("client_enrolled_in_sequence");
      // Extract loopsId from detail: "Enrolled in sequence <loopsId>" or "Removed from sequence <loopsId>"
      const match = detail.match(/sequence\s+(\S+)$/i);
      const loopsId = match ? match[1] : "";
      return {
        loopsId,
        action: isEnrol ? "enrolled" : "removed",
        occurredAt: p.acf?.comm_occurred_at ?? p.date,
        postDate: p.date,
      };
    });

    // Build last-action map per loopsId
    const stateMap = new Map<string, EnrollEntry>();
    for (const e of entries) {
      if (!e.loopsId) continue;
      stateMap.set(e.loopsId, e);
    }

    // Fetch all sequences from WP to resolve names
    const { items: allSequences } = await listSequences();
    const sequenceByLoopsId = new Map(
      allSequences
        .filter((s) => s.acf.seq_loops_id)
        .map((s) => [s.acf.seq_loops_id!, s])
    );

    const enrollments = Array.from(stateMap.entries())
      .filter(([, e]) => e.action === "enrolled")
      .map(([loopsId, e]) => {
        const seq = sequenceByLoopsId.get(loopsId);
        return {
          sequenceId:   seq?.id ?? null,
          sequenceName: seq?.title.rendered ?? loopsId,
          loopsId,
          enrolledAt:   e.occurredAt,
        };
      });

    return NextResponse.json({ enrollments });
  } catch (err: unknown) {
    console.error("[GET /api/admin/sequences/client-enrollments]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
