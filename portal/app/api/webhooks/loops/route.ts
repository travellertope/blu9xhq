import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { wpRestFetch, wpRestList, type WPCommunicationPost } from "@/lib/wp-api";

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
    // Resolve the messageId from common Loops payload shapes
    const data = (body.data ?? {}) as Record<string, unknown>;
    const messageId = (data.messageId ?? data.email_id ?? data.resendEmailId) as string | undefined;

    if (messageId) {
      handleEmailReplied(messageId).catch(console.error);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

// ─── Fire-and-forget handler ──────────────────────────────────────────────────

async function handleEmailReplied(messageId: string): Promise<void> {
  try {
    // Find matching bluu_communication by resend email id
    const { items } = await wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
      per_page:   20,
      status:     "publish",
      meta_key:   "comm_resend_email_id",
      meta_value: messageId,
    });

    if (items.length === 0) return;

    const original = items[0];

    // Update original communication status to "replied"
    await wpRestFetch(`/wp/v2/bluu_communication/${original.id}`, {
      method: "POST",
      body: JSON.stringify({
        acf: { comm_email_status: "replied" },
      }),
    });

    // Create a new inbound bluu_communication recording the reply
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
          ...(original.acf?.comm_client ? { comm_client: original.acf.comm_client } : {}),
          ...(original.acf?.comm_logged_by ? { comm_logged_by: original.acf.comm_logged_by } : {}),
        },
      }),
    });
  } catch (err) {
    console.error("[webhooks/loops] handleEmailReplied failed:", err);
  }
}
