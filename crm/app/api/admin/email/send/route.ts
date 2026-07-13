import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmailHtml } from "@/lib/resend";
import { z } from "zod";

const bodySchema = z.object({
  to:           z.string().email(),
  subject:      z.string().min(1).max(500),
  htmlBody:     z.string().min(1),
  clientId:     z.string().uuid().optional(),
  scheduledFor: z.string().optional(),
});

// ─── POST /api/admin/email/send ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  const result = await requirePermission(req, "compose_send_emails");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;
  const tenantId = actor.tenantId!;

  try {
    const messageId = await sendEmailHtml({
      to:      d.to,
      subject: d.subject,
      html:    d.htmlBody,
    });

    // Log a communications record and return it so the UI can prepend it to the timeline
    const now = new Date().toISOString();
    let entry: Record<string, unknown> | null = null;
    try {
      const supabase = createSupabaseServerClient();
      const { data: commRow, error } = await supabase
        .from("communications")
        .insert({
          tenant_id:    tenantId,
          client_id:    d.clientId ?? null,
          comm_type:    "manual",
          channel:      "email",
          direction:    "outbound",
          subject:      d.subject,
          body:         d.htmlBody,
          occurred_at:  now,
          logged_by:    actor.id,
          email_status: "sent",
        })
        .select("*")
        .single();
      if (error) throw error;

      entry = {
        id:                commRow.id,
        date:              commRow.created_at,
        clientId:          commRow.client_id ?? 0,
        type:              "manual",
        direction:         "outbound",
        channel:           "email",
        subject:           d.subject,
        content:           d.htmlBody,
        occurredAt:        commRow.occurred_at || now,
        loggedBy:          actor.id ?? 0,
        mood:              undefined,
        moodSource:        undefined,
        redFlags:          [],
        followUpNeeded:    false,
        followUpCompleted: false,
        emailStatus:       "sent",
      };
    } catch (logErr) {
      console.error("[email send] failed to log communication:", logErr);
    }

    return NextResponse.json({ success: true, messageId, entry });
  } catch (err: unknown) {
    console.error("[POST /api/admin/email/send]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
