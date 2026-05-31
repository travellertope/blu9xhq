import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { wpRestFetch, type WPCommunicationPost } from "@/lib/wp-api";
import { z } from "zod";

const patchSchema = z.object({
  mood:                z.enum(["positive", "neutral", "mixed", "concerned", "at_risk"]).optional(),
  follow_up_completed: z.boolean().optional(),
  follow_up_due:       z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requirePermission(req, "log_communications");
  if (result instanceof NextResponse) return result;

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const acf: Record<string, string> = {};
  if (d.mood                !== undefined) acf.comm_mood                = d.mood;
  if (d.follow_up_completed !== undefined) acf.comm_follow_up_completed = d.follow_up_completed ? "1" : "0";
  if (d.follow_up_due       !== undefined) acf.comm_follow_up_due       = d.follow_up_due;

  try {
    const updated = await wpRestFetch<WPCommunicationPost>(`/wp/v2/bluu_communication/${postId}`, {
      method: "POST",
      body:   JSON.stringify({ acf }),
    });
    return NextResponse.json({ entry: updated });
  } catch (err: any) {
    console.error("[PATCH /api/admin/communications/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
