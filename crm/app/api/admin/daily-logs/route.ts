/*
-- Run this SQL to create the daily_logs table:

CREATE TABLE daily_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  tasks jsonb NOT NULL DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, user_id, log_date)
);
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON daily_logs FOR ALL USING (true) WITH CHECK (true);
*/

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

const postSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  tasks: z.array(taskSchema).default([]),
  notes: z.string().optional().nullable(),
});

// ─── GET /api/admin/daily-logs ────────────────────────────────────────────────
// Returns logs for the authenticated user.
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

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from("daily_logs")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .order("log_date", { ascending: false });

    if (from && to) {
      query = query.gte("log_date", from).lte("log_date", to);
    } else {
      const targetDate = date ?? new Date().toISOString().slice(0, 10);
      query = query.eq("log_date", targetDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ logs: data ?? [] });
  } catch (err: any) {
    console.error("[GET /api/admin/daily-logs]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── POST /api/admin/daily-logs ───────────────────────────────────────────────
// Create or upsert a log entry for a specific date.

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const tenantId = user.tenantId;
  if (!tenantId) {
    return NextResponse.json({ error: "No tenant" }, { status: 403 });
  }

  const parsed = postSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { date, tasks, notes } = parsed.data;

  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("daily_logs")
      .upsert(
        {
          tenant_id: tenantId,
          user_id: user.id,
          log_date: date,
          tasks,
          notes: notes ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,user_id,log_date" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ log: data }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/daily-logs]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
