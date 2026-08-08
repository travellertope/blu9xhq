import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// GET /api/admin/audit-log
// Fetches communications rows where channel=system (internal audit events).
// Supports: ?dateFrom=, ?dateTo=, ?page=, ?perPage=

export async function GET(req: NextRequest) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  const { searchParams } = new URL(req.url);
  const page     = parseInt(searchParams.get("page")    ?? "1",  10);
  const perPage  = Math.min(parseInt(searchParams.get("perPage") ?? "50", 10), 100);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo   = searchParams.get("dateTo");

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("communications")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId)
      .eq("channel", "system");

    if (dateFrom) query = query.gte("occurred_at", dateFrom);
    if (dateTo)   query = query.lte("occurred_at", dateTo + "T23:59:59");

    const from = (page - 1) * perPage;
    const { data, error, count } = await query
      .order("occurred_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;

    const entries = (data ?? []).map((row: any) => ({
      id:            row.id,
      date:          row.occurred_at || row.created_at,
      action:        row.subject ?? "",
      detail:        row.body ?? "",
      actorWpUserId: row.logged_by,
      clientId:      row.client_id ?? null,
    }));

    const total = count ?? 0;
    return NextResponse.json({
      entries,
      total,
      totalPages: Math.max(Math.ceil(total / perPage), 1),
      page,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/audit-log]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
