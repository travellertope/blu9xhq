import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { mapFileRow } from "@/lib/files";

export async function GET(req: NextRequest) {
  const result = await requireSession(req);
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const page     = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage  = 50;

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("files")
      .select("*, clients(company_name,contact_name)", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    const from = (page - 1) * perPage;
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;

    const files = (data ?? []).map((row: any) =>
      mapFileRow(row, clientId ? undefined : (row.clients?.company_name || row.clients?.contact_name))
    );

    const total = count ?? 0;
    return NextResponse.json({ files, total, totalPages: Math.max(Math.ceil(total / perPage), 1), page });
  } catch (err) {
    console.error("[GET /api/admin/files]", err);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
