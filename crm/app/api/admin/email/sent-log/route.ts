import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  const sp      = new URL(req.url).searchParams;
  const page    = Math.max(1, parseInt(sp.get("page")    ?? "1",  10));
  const perPage = Math.min(50, parseInt(sp.get("perPage") ?? "20", 10));
  const search  = (sp.get("search") ?? "").trim();

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("communications")
      .select("*, clients(company_name,contact_name)", { count: "exact" })
      .eq("tenant_id", tenantId)
      .eq("channel", "email")
      .eq("direction", "outbound");

    if (search) {
      query = query.or(`subject.ilike.%${search}%,body.ilike.%${search}%`);
    }

    const from = (page - 1) * perPage;
    const { data, error, count } = await query
      .order("occurred_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;

    const entries = (data ?? []).map((c: any) => ({
      id:          c.id,
      sentAt:      c.occurred_at || c.created_at,
      clientId:    c.client_id ?? 0,
      clientName:  c.clients?.company_name || c.clients?.contact_name || (c.client_id ? `Client ${c.client_id}` : "—"),
      subject:     c.subject ?? "(no subject)",
      preview:     (c.body ?? "").replace(/<[^>]+>/g, "").slice(0, 160).trim(),
      emailStatus: c.email_status ?? "sent",
      loggedBy:    c.logged_by ?? 0,
    }));

    const total = count ?? 0;
    return NextResponse.json({ entries, total, totalPages: Math.max(Math.ceil(total / perPage), 1), page });
  } catch (err: unknown) {
    console.error("[GET /api/admin/email/sent-log]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
