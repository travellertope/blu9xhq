import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { sendEmailHtml } from "@/lib/resend";
import { wpRestFetch, type WPCommunicationPost } from "@/lib/wp-api";
import { z } from "zod";

const bodySchema = z.object({
  to:           z.string().email(),
  subject:      z.string().min(1).max(500),
  htmlBody:     z.string().min(1),
  clientId:     z.number().int().positive().optional(),
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

  const result = await requirePermission(req, "compose_send_emails", d.clientId);
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as Record<string, unknown>;

  try {
    const messageId = await sendEmailHtml({
      to:      d.to,
      subject: d.subject,
      html:    d.htmlBody,
    });

    // Log a bluu_communication record and return it so the UI can prepend it to the timeline
    const now = new Date().toISOString();
    let entry: Record<string, unknown> | null = null;
    try {
      const commPost = await wpRestFetch<WPCommunicationPost>("/wp/v2/bluu_communication", {
        method: "POST",
        body: JSON.stringify({
          title:  d.subject.slice(0, 200),
          status: "publish",
          acf: {
            comm_type:         "manual",
            comm_channel:      "email",
            comm_direction:    "outbound",
            comm_subject:      d.subject,
            comm_content:      d.htmlBody,
            comm_occurred_at:  now,
            ...(d.clientId ? { comm_client: d.clientId } : {}),
            comm_logged_by:    actor.wpUserId as number,
            comm_email_status: "sent",
          },
        }),
      });
      entry = {
        id:             commPost.id,
        date:           commPost.date,
        clientId:       d.clientId ?? 0,
        type:           "manual",
        direction:      "outbound",
        channel:        "email",
        subject:        d.subject,
        content:        d.htmlBody,
        occurredAt:     commPost.acf?.comm_occurred_at || now,
        loggedBy:       (actor.wpUserId as number) ?? 0,
        mood:           undefined,
        moodSource:     undefined,
        redFlags:       [],
        followUpNeeded: false,
        followUpCompleted: false,
        emailStatus:    "sent",
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
