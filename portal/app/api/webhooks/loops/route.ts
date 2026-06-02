import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import {
  wpRestFetch,
  wpRestList,
  listEnrollments,
  getSequence,
  updateEnrollment,
  type WPCommunicationPost,
  type WPEnrollmentPost,
} from "@/lib/wp-api";

// ─── POST /api/webhooks/loops ─────────────────────────────────────────────────
//
// Public webhook endpoint — no auth guard. Verifies Loops HMAC-SHA256 signature
// when LOOPS_WEBHOOK_SECRET is set.

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-loops-signature") ?? "";

  const secret = process.env.LOOPS_WEBHOOK_SECRET;
  if (secret) {
    const expected = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[webhooks/loops] LOOPS_WEBHOOK_SECRET not set — skipping signature verification");
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const eventType = body.type as string | undefined;

  if (eventType === "email_replied") {
    const data = (body.data ?? {}) as Record<string, unknown>;
    const messageId = (data.messageId ?? data.email_id ?? data.resendEmailId) as string | undefined;
    // Loops typically includes the recipient address — try common field names
    const toEmail = (data.to ?? data.email ?? data.recipientEmail ?? data.recipient) as string | undefined;

    if (messageId || toEmail) {
      handleEmailReplied(messageId, toEmail).catch(console.error);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// ─── Fire-and-forget handler ──────────────────────────────────────────────────

async function handleEmailReplied(
  messageId: string | undefined,
  toEmail: string | undefined,
): Promise<void> {
  try {
    let clientId: number | undefined;

    if (messageId) {
      // Find matching bluu_communication by resend email id (CRM / manual emails)
      const { items } = await wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
        per_page:   20,
        status:     "publish",
        meta_key:   "comm_resend_email_id",
        meta_value: messageId,
      });

      if (items.length > 0) {
        const original = items[0];
        if (original.acf?.comm_client) clientId = original.acf.comm_client;

        // Mark original as replied
        await wpRestFetch(`/wp/v2/bluu_communication/${original.id}`, {
          method: "POST",
          body: JSON.stringify({
            acf: { comm_email_status: "replied" },
          }),
        });

        // Create inbound communication record
        const originalSubject: string = original.acf?.comm_subject ?? "email";
        const now = new Date().toISOString();
        await wpRestFetch("/wp/v2/bluu_communication", {
          method: "POST",
          body: JSON.stringify({
            title:  `Reply to: ${originalSubject.slice(0, 180)}`,
            status: "publish",
            acf: {
              comm_type:        "email_crm",
              comm_channel:     "email",
              comm_direction:   "inbound",
              comm_subject:     `Reply to: ${originalSubject}`,
              comm_content:     "[Client replied to automated email]",
              comm_occurred_at: now,
              comm_mood:        "neutral",
              ...(original.acf?.comm_client   ? { comm_client:     original.acf.comm_client   } : {}),
              ...(original.acf?.comm_logged_by ? { comm_logged_by: original.acf.comm_logged_by } : {}),
            },
          }),
        });
      }
    }

    // Exit any active sequence enrollments that have "client_replied" as an exit condition
    await exitSequenceEnrollmentsOnReply(clientId, toEmail);
  } catch (err) {
    console.error("[webhooks/loops] handleEmailReplied failed:", err);
  }
}

// ─── Sequence exit-condition enforcement ─────────────────────────────────────

async function exitSequenceEnrollmentsOnReply(
  clientId: number | undefined,
  clientEmail: string | undefined,
): Promise<void> {
  if (!clientId && !clientEmail) return;

  // Fetch active enrollments for this client — prefer clientId (integer), fall
  // back to email (string) when we only have the recipient address.
  let candidates: WPEnrollmentPost[] = [];
  try {
    if (clientId) {
      const { items } = await listEnrollments({
        meta_key:   "enr_client_id",
        meta_value: clientId,
      });
      candidates = items;
    } else if (clientEmail) {
      const { items } = await listEnrollments({
        meta_key:   "enr_client_email",
        meta_value: clientEmail,
      });
      candidates = items;
    }
  } catch (err) {
    console.error("[webhooks/loops] Failed to list enrollments:", err);
    return;
  }

  const active = candidates.filter((e) => e.acf.enr_status === "active");
  if (active.length === 0) return;

  const now = new Date().toISOString();

  for (const enrollment of active) {
    try {
      const sequence = await getSequence(enrollment.acf.enr_sequence_id);

      let exitConditions: string[] = [];
      try {
        exitConditions = JSON.parse(sequence.acf.exit_conditions ?? "[]") as string[];
      } catch {
        exitConditions = [];
      }

      if (!exitConditions.includes("client_replied")) continue;

      await updateEnrollment(enrollment.id, {
        acf: {
          enr_status:      "exited",
          enr_exit_reason: "client_replied",
          enr_exited_at:   now,
        },
      });
      console.log(
        `[webhooks/loops] Enrollment ${enrollment.id} exited — client replied to sequence ${enrollment.acf.enr_sequence_id}`,
      );
    } catch (err) {
      console.error(`[webhooks/loops] Failed to exit enrollment ${enrollment.id}:`, err);
    }
  }
}
