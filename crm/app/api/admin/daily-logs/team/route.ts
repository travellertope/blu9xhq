import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { hasPermission, type Role } from "@/lib/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const maxDuration = 30;

// ─── GET /api/admin/daily-logs/team ───────────────────────────────────────────
// Returns logs for all team members for a given date or date range.
// Requires view_daily_logs permission, or super_admin / account_manager role.
// Query params: ?date=YYYY-MM-DD | ?from=YYYY-MM-DD&to=YYYY-MM-DD

export async function GET(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const tenantId = user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 403 });
  }

  const role = (user.bluuhqRole ?? "viewer") as Role;

  // Check permission: view_daily_logs or super_admin/account_manager
  const allowed =
    hasPermission(role, "view_daily_logs") ||
    role === "super_admin" ||
    role === "account_manager";

  if (!allowed) {
    return NextResponse.json(
      { error: "Forbidden", code: "NO_PERMISSION" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const supabase = createSupabaseAdminClient();

    // Fetch team members for this tenant
    const { data: members, error: membersErr } = await supabase
      .from("team_members")
      .select("user_id, crm_role, status")
      .eq("tenant_id", tenantId)
      .eq("status", "active");
    if (membersErr) throw membersErr;

    // Build a user info map via auth admin API
    const userIds = (members ?? []).map((m: any) => m.user_id);
    const userMap: Record<string, { name: string; email: string; role: string }> = {};

    // Fetch user details in parallel
    const userResults = await Promise.allSettled(
      userIds.map((uid: string) => supabase.auth.admin.getUserById(uid))
    );

    for (let i = 0; i < userIds.length; i++) {
      const member = members![i] as any;
      const result = userResults[i];
      if (result.status === "fulfilled" && result.value.data?.user) {
        const u = result.value.data.user;
        userMap[userIds[i]] = {
          name: (u.user_metadata as any)?.full_name ?? u.email ?? "Unknown",
          email: u.email ?? "",
          role: member.crm_role,
        };
      } else {
        userMap[userIds[i]] = {
          name: "Unknown",
          email: "",
          role: member.crm_role,
        };
      }
    }

    // Fetch logs
    let query = supabase
      .from("daily_logs")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("log_date", { ascending: false });

    if (from && to) {
      query = query.gte("log_date", from).lte("log_date", to);
    } else {
      const targetDate = date ?? new Date().toISOString().slice(0, 10);
      query = query.eq("log_date", targetDate);
    }

    const { data: logs, error: logsErr } = await query;
    if (logsErr) throw logsErr;

    // Enrich logs with user info
    const enrichedLogs = (logs ?? []).map((log: any) => ({
      ...log,
      user: userMap[log.user_id] ?? { name: "Unknown", email: "", role: "unknown" },
    }));

    return NextResponse.json({ logs: enrichedLogs, users: userMap });
  } catch (err: any) {
    console.error("[GET /api/admin/daily-logs/team]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
