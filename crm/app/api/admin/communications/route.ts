import { NextRequest, NextResponse } from "next/server";
import { requireSession, requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { BluuCommunication, CommMoodSentiment, CommMoodSource, CommEmailStatus } from "@/types";
import { z } from "zod";

function mapRow(row: any): BluuCommunication {
  return {
    id:                row.id,
    date:              row.created_at,
    clientId:          row.client_id,
    type:              row.comm_type,
    direction:         row.direction,
    channel:           row.channel,
    subject:           row.subject ?? "",
    content:           row.body ?? "",
    occurredAt:        row.occurred_at || row.created_at,
    loggedBy:          row.logged_by ?? 0,
    mood:              row.mood as CommMoodSentiment | undefined,
    moodSource:        row.mood_source as CommMoodSource | undefined,
    moodReasoning:     row.mood_reasoning ?? undefined,
    redFlags:          row.red_flags ?? [],
    followUpNeeded:    !!row.follow_up_needed,
    followUpDue:       row.follow_up_due,
    followUpCompleted: !!row.follow_up_completed,
    emailStatus:       row.email_status as CommEmailStatus | undefined,
  };
}

// ─── GET /api/admin/communications ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const tenantId = session.user.tenantId!;

  const sp           = new URL(req.url).searchParams;
  const clientIdStr  = sp.get("clientId");
  const typeFilter   = sp.get("type")   ?? "all";
  const moodFilter   = sp.get("mood")   ?? "";
  const followUpOnly = sp.get("followUpOnly") === "true";
  const dateFrom     = sp.get("dateFrom");
  const dateTo       = sp.get("dateTo");
  const page         = Math.max(1, parseInt(sp.get("page")    ?? "1",  10));
  const perPage      = Math.min(50, parseInt(sp.get("perPage") ?? "20", 10));

  // Note: account_manager per-client scoping is not enforced here yet — assignedClients
  // still holds legacy WP-numeric client ids until team/[Task #10] moves to Supabase UUIDs.

  if (!clientIdStr && !followUpOnly) {
    return NextResponse.json({ error: "clientId is required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase
      .from("communications")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId);

    if (clientIdStr) query = query.eq("client_id", clientIdStr);
    if (typeFilter === "emails")  query = query.eq("channel", "email");
    if (typeFilter === "manual")  query = query.eq("comm_type", "manual");
    if (typeFilter === "system")  query = query.or("channel.eq.system,comm_type.eq.system");
    if (moodFilter)               query = query.eq("mood", moodFilter);
    if (followUpOnly)             query = query.eq("follow_up_needed", true).eq("follow_up_completed", false);
    if (dateFrom)                 query = query.gte("occurred_at", dateFrom);
    if (dateTo)                   query = query.lte("occurred_at", dateTo + "T23:59:59");

    const from = (page - 1) * perPage;
    const { data, error, count } = await query
      .order("occurred_at", { ascending: false })
      .range(from, from + perPage - 1);

    if (error) throw error;

    const total = count ?? 0;
    return NextResponse.json({
      entries: (data ?? []).map(mapRow),
      total,
      totalPages: Math.max(Math.ceil(total / perPage), 1),
      page,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/communications]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── POST /api/admin/communications ───────────────────────────────────────────

const postSchema = z.object({
  clientId:           z.string().uuid(),
  channel:            z.enum(["email", "whatsapp", "phone", "meeting", "sms", "other"]),
  direction:          z.enum(["inbound", "outbound", "internal"]),
  subject:            z.string().min(1).max(500),
  content:            z.string().min(1).max(50000),
  occurredAt:         z.string(),
  mood:               z.enum(["positive", "neutral", "mixed", "concerned", "at_risk"]).optional(),
  moodSource:         z.enum(["ai_accepted", "ai_overridden", "manual"]).optional(),
  moodReasoning:      z.string().optional(),
  redFlags:           z.array(z.string()).optional(),
  followUpNeeded:     z.boolean().optional(),
  followUpDue:        z.string().optional(),
});

export async function POST(req: NextRequest) {
  const result = await requirePermission(req, "log_communications");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;
  const tenantId = actor.tenantId!;

  const body = await req.json().catch(() => ({}));

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;

  // Note: account_manager per-client scoping deferred — see GET handler comment above.

  try {
    const supabase = createSupabaseAdminClient();
    const { data: inserted, error } = await supabase
      .from("communications")
      .insert({
        tenant_id:          tenantId,
        client_id:          d.clientId,
        comm_type:          "manual",
        direction:          d.direction,
        channel:            d.channel,
        subject:            d.subject,
        body:               d.content,
        occurred_at:        d.occurredAt,
        logged_by:          actor.id,
        mood:               d.mood ?? null,
        mood_source:        d.moodSource ?? null,
        mood_reasoning:     d.moodReasoning ?? null,
        red_flags:          d.redFlags ?? [],
        follow_up_needed:   d.followUpNeeded ?? false,
        follow_up_due:      d.followUpDue ?? null,
        follow_up_completed: false,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: mapRow(inserted) }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/communications]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
