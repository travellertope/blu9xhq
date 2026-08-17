import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

export const maxDuration = 30;

const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  status: z.enum(["planned", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  category: z.string().optional(),
});

const patchSchema = z.object({
  tasks: z.array(taskSchema).optional(),
  notes: z.string().optional().nullable(),
});

// ─── PATCH /api/admin/daily-logs/[id] ─────────────────────────────────────────
// Update tasks array or notes. User can only edit their own logs.

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromCookies();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const tenantId = user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 403 });
  }

  const { id } = await params;

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.tasks !== undefined) updates.tasks = parsed.data.tasks;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("daily_logs")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Log not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ log: data });
  } catch (err: any) {
    console.error("[PATCH /api/admin/daily-logs/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── DELETE /api/admin/daily-logs/[id] ────────────────────────────────────────
// Delete a log entry. Only own logs.

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getSessionFromCookies();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const tenantId = user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("daily_logs")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .select("id")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Log not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ deleted: data.id });
  } catch (err: any) {
    console.error("[DELETE /api/admin/daily-logs/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
