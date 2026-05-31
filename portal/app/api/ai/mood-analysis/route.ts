import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { analyseMood } from "@/lib/gemini";

// In-memory rate limiter: 1 request per 2 seconds per user
const lastRequestTime = new Map<number, number>();

export async function POST(req: NextRequest) {
  const result = await requirePermission(req, "log_communications");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const userId: number = (session.user as any).wpUserId ?? 0;

  const now  = Date.now();
  const last = lastRequestTime.get(userId) ?? 0;
  if (now - last < 2000) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: 2 },
      { status: 429 }
    );
  }
  lastRequestTime.set(userId, now);

  let body: { content?: unknown };
  try { body = await req.json(); } catch { body = {}; }

  const content = body.content;
  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (content.length > 10000) {
    return NextResponse.json({ error: "content too long (max 10000 chars)" }, { status: 400 });
  }

  try {
    const analysis = await analyseMood(content);
    return NextResponse.json(analysis);
  } catch (err: any) {
    console.error("[POST /api/ai/mood-analysis]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
