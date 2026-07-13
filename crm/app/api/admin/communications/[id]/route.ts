import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const patchSchema = z.object({
  mood:                z.enum(["positive", "neutral", "mixed", "concerned", "at_risk"]).optional(),
  follow_up_completed: z.boolean().optional(),
  follow_up_due:       z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requirePermission(req, "log_communications");
  if (result instanceof NextResponse) return result;
  const tenantId = result.session.user.tenantId!;

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const update: Record<string, unknown> = {};
  if (d.mood                !== undefined) update.mood                = d.mood;
  if (d.follow_up_completed !== undefined) update.follow_up_completed = d.follow_up_completed;
  if (d.follow_up_due       !== undefined) update.follow_up_due       = d.follow_up_due;

  try {
    const supabase = createSupabaseServerClient();
    const { data: updated, error } = await supabase
      .from("communications")
      .update(update)
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ entry: updated });
  } catch (err: any) {
    console.error("[PATCH /api/admin/communications/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
