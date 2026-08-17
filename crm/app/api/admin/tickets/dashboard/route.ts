import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// GET /api/admin/tickets/dashboard — ticket list + summary for the admin tickets page
export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const tenantId = auth.session.user.tenantId!;

  const { searchParams } = new URL(req.url);
  const statusFilter   = searchParams.get("status")   ?? null;
  const priorityFilter = searchParams.get("priority") ?? null;

  try {
    const now = new Date().toISOString();
    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from("tickets")
      .select("*, clients(company_name,contact_name), ticket_replies(count)")
      .eq("tenant_id", tenantId);

    if (statusFilter) query = query.eq("status", statusFilter);
    else query = query.neq("status", "closed");
    if (priorityFilter) query = query.eq("priority", priorityFilter);

    const { data, error } = await query;
    if (error) throw error;

    // Resolve assignee names in bulk via the admin auth API
    const assigneeIds = Array.from(new Set((data ?? []).map((t: any) => t.assigned_to).filter(Boolean)));
    const assigneeNames = new Map<string, string>();
    if (assigneeIds.length > 0) {
      const admin = createSupabaseAdminClient();
      const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
      for (const u of users) {
        if (assigneeIds.includes(u.id)) {
          assigneeNames.set(u.id, (u.user_metadata as any)?.full_name ?? u.email ?? "Unknown");
        }
      }
    }

    const enriched = (data ?? []).map((t: any) => {
      const responseTarget = t.sla_response_target;
      const resolveTarget  = t.sla_resolve_target;
      const slaStatus =
        !t.first_response_at && responseTarget && now > responseTarget
          ? "response_breached"
          : !t.resolved_at && resolveTarget && now > resolveTarget
          ? "resolve_breached"
          : "on_track";

      return {
        id:               t.id,
        ticketNumber:     t.tkt_number,
        subject:          t.tkt_number,
        status:           t.status,
        priority:         t.priority,
        category:         t.category,
        clientId:         t.client_id,
        clientName:       t.clients?.company_name || t.clients?.contact_name || `Client ${t.client_id}`,
        assignedTo:       t.assigned_to ?? null,
        assignedToName:   t.assigned_to ? (assigneeNames.get(t.assigned_to) ?? null) : null,
        slaResponseTarget: responseTarget ?? null,
        slaResolveTarget:  resolveTarget ?? null,
        firstResponseAt:   t.first_response_at ?? null,
        slaStatus,
        replyCount:        t.ticket_replies?.[0]?.count ?? 0,
        createdAt:         t.created_at,
      };
    });

    // Sort: urgent → high → normal → low, then by createdAt asc
    const priorityOrder: Record<string, number> = { urgent: 1, high: 2, normal: 3, low: 4 };
    enriched.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 5;
      const pb = priorityOrder[b.priority] ?? 5;
      if (pa !== pb) return pa - pb;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const summary = {
      total:            enriched.length,
      open:             enriched.filter((t) => t.status === "open").length,
      inProgress:       enriched.filter((t) => t.status === "in_progress").length,
      awaitingClient:   enriched.filter((t) => t.status === "awaiting_client").length,
      slaBreached:      enriched.filter((t) => t.slaStatus !== "on_track").length,
    };

    return NextResponse.json({ tickets: enriched, summary });
  } catch (err) {
    console.error("[GET /api/admin/tickets/dashboard]", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
