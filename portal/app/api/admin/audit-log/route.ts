import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { wpRestList } from "@/lib/wp-api";

// GET /api/admin/audit-log
// Fetches bluu_communication posts where comm_channel=system (internal audit events).
// Supports: ?teamMemberId=, ?action=, ?dateFrom=, ?dateTo=, ?page=, ?perPage=

export async function GET(req: NextRequest) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const page    = parseInt(searchParams.get("page")    ?? "1",  10);
  const perPage = parseInt(searchParams.get("perPage") ?? "50", 10);

  // Build WP REST query parameters
  const qp: Record<string, string | number> = {
    page,
    per_page: Math.min(perPage, 100),
    status:   "publish",
    orderby:  "date",
    order:    "desc",
    // Filter to system audit entries via meta query
    meta_key:   "comm_channel",
    meta_value: "system",
  };

  try {
    const raw = await wpRestList<any>("/wp/v2/bluu_communication", qp);

    // Transform WP post objects into clean audit entry objects
    const entries = raw.items.map((post: any) => ({
      id:             post.id,
      date:           post.date,
      action:         post.acf?.comm_subject ?? post.title?.rendered ?? "",
      detail:         post.acf?.comm_content ?? "",
      actorWpUserId:  post.acf?.comm_logged_by,
      clientId:       post.acf?.comm_client ?? null,
    }));

    return NextResponse.json({
      entries,
      total:      raw.total,
      totalPages: raw.totalPages,
      page,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/audit-log]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
