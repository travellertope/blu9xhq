import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { wpRestFetch, wpRestList, type WPCommunicationPost } from "@/lib/wp-api";
import type { BluuCommunication, CommMoodSentiment, CommMoodSource, CommChannel, CommDirection, CommType, CommEmailStatus } from "@/types";
import { z } from "zod";

// ─── Transform WP post → BluuCommunication ─────────────────────────────────────

function safeJson(s?: string): string[] {
  if (!s) return [];
  try { return JSON.parse(s); } catch { return []; }
}

function isTruthy(v: boolean | string | number | undefined): boolean {
  return v === true || v === 1 || v === "1" || v === "true";
}

function transform(post: WPCommunicationPost): BluuCommunication {
  const a = post.acf;
  return {
    id:               post.id,
    date:             post.date,
    clientId:         a.comm_client,
    type:             (a.comm_type     || "manual")   as CommType,
    direction:        (a.comm_direction || "internal") as CommDirection,
    channel:          (a.comm_channel  || "other")    as CommChannel,
    subject:          a.comm_subject   ?? "",
    content:          a.comm_content   ?? "",
    occurredAt:       a.comm_occurred_at || post.date,
    loggedBy:         a.comm_logged_by ?? 0,
    mood:             a.comm_mood       as CommMoodSentiment | undefined,
    moodSource:       a.comm_mood_source as CommMoodSource   | undefined,
    moodReasoning:    a.comm_mood_reasoning,
    redFlags:         safeJson(a.comm_red_flags),
    followUpNeeded:   isTruthy(a.comm_follow_up_needed),
    followUpDue:      a.comm_follow_up_due,
    followUpCompleted: isTruthy(a.comm_follow_up_completed),
    emailStatus:      a.comm_email_status as CommEmailStatus | undefined,
  };
}

// ─── GET /api/admin/communications ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any)?.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp          = new URL(req.url).searchParams;
  const clientIdStr = sp.get("clientId");
  const typeFilter  = sp.get("type")   ?? "all";
  const moodFilter  = sp.get("mood")   ?? "";
  const followUpOnly = sp.get("followUpOnly") === "true";
  const dateFrom    = sp.get("dateFrom");
  const dateTo      = sp.get("dateTo");
  const page        = Math.max(1, parseInt(sp.get("page")    ?? "1",  10));
  const perPage     = Math.min(50, parseInt(sp.get("perPage") ?? "20", 10));

  // account_manager scoping: verify clientId in their assigned list
  const user = session.user as any;
  if (clientIdStr && user.bluuhqRole === "account_manager") {
    const assigned: number[] = user.assignedClients ?? [];
    if (!assigned.includes(parseInt(clientIdStr, 10))) {
      return NextResponse.json({ error: "Client not assigned to you" }, { status: 403 });
    }
  }

  try {
    let raw: WPCommunicationPost[];

    if (followUpOnly && !clientIdStr) {
      // Global follow-ups view
      const result = await wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
        per_page: 100,
        status:   "publish",
        meta_key:   "comm_follow_up_needed",
        meta_value: "1",
        orderby:    "date",
        order:      "desc",
      });
      raw = result.items;
    } else if (clientIdStr) {
      const clientId = parseInt(clientIdStr, 10);
      // WP REST API caps per_page at 100 — fetch all pages
      const all: WPCommunicationPost[] = [];
      let p = 1;
      while (true) {
        const result = await wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
          per_page:   100,
          page:       p,
          status:     "publish",
          meta_key:   "comm_client",
          meta_value: clientId,
          orderby:    "date",
          order:      "desc",
        });
        all.push(...result.items);
        if (p >= result.totalPages) break;
        p++;
      }
      raw = all;
    } else {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    let entries = raw.map(transform);

    // Client-side filters
    if (typeFilter === "emails")  entries = entries.filter(e => e.channel === "email");
    if (typeFilter === "manual")  entries = entries.filter(e => e.type === "manual");
    if (typeFilter === "system")  entries = entries.filter(e => e.channel === "system" || e.type === "system");
    if (moodFilter)               entries = entries.filter(e => e.mood === moodFilter);
    if (followUpOnly)             entries = entries.filter(e => e.followUpNeeded && !e.followUpCompleted);
    if (dateFrom)                 entries = entries.filter(e => e.occurredAt >= dateFrom);
    if (dateTo)                   entries = entries.filter(e => e.occurredAt <= dateTo + "T23:59:59");

    const total      = entries.length;
    const totalPages = Math.ceil(total / perPage);
    const paged      = entries.slice((page - 1) * perPage, page * perPage);

    return NextResponse.json({ entries: paged, total, totalPages, page });
  } catch (err: any) {
    console.error("[GET /api/admin/communications]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── POST /api/admin/communications ───────────────────────────────────────────

const postSchema = z.object({
  clientId:           z.number().int().positive(),
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

  const body = await req.json().catch(() => ({}));

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;

  // account_manager scoping
  if (actor.bluuhqRole === "account_manager") {
    const assigned: number[] = actor.assignedClients ?? [];
    if (!assigned.includes(d.clientId)) {
      return NextResponse.json({ error: "Client not assigned to you" }, { status: 403 });
    }
  }

  try {
    const post = await wpRestFetch<WPCommunicationPost>("/wp/v2/bluu_communication", {
      method: "POST",
      body: JSON.stringify({
        title:  d.subject.slice(0, 200),
        status: "publish",
        acf: {
          comm_type:              "manual",
          comm_direction:         d.direction,
          comm_channel:           d.channel,
          comm_subject:           d.subject,
          comm_content:           d.content,
          comm_occurred_at:       d.occurredAt,
          comm_client:            d.clientId,
          comm_logged_by:         actor.wpUserId,
          ...(d.mood           ? { comm_mood:           d.mood }           : {}),
          ...(d.moodSource     ? { comm_mood_source:    d.moodSource }     : {}),
          ...(d.moodReasoning  ? { comm_mood_reasoning: d.moodReasoning }  : {}),
          ...(d.redFlags?.length ? { comm_red_flags: JSON.stringify(d.redFlags) } : {}),
          comm_follow_up_needed:   d.followUpNeeded ? "1" : "0",
          ...(d.followUpDue    ? { comm_follow_up_due: d.followUpDue }    : {}),
          comm_follow_up_completed: "0",
        },
      }),
    });

    return NextResponse.json({ entry: transform(post) }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/communications]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
