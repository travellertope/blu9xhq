import { NextRequest, NextResponse } from "next/server";
import {
  listEnrollments,
  getSequence,
  updateEnrollment,
  type WPEnrollmentPost,
} from "@/lib/wp-api";

// ─── POST /api/webhooks/inbound-email ────────────────────────────────────────
//
// Receives inbound email events from the Cloudflare Email Worker.
// Auth: shared secret in X-Worker-Secret header (CF_INBOUND_EMAIL_SECRET env).
//
// Expected body: { from: "client@example.com", subject?: string, inReplyTo?: string }

export async function POST(req: NextRequest) {
  const secret = process.env.CF_INBOUND_EMAIL_SECRET;
  if (secret) {
    const header = req.headers.get("x-worker-secret");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[webhooks/inbound-email] CF_INBOUND_EMAIL_SECRET not set — skipping auth");
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // `from` is the client's email address (the person who replied)
  const fromEmail = body.from as string | undefined;
  if (!fromEmail) {
    return NextResponse.json({ error: "Missing from" }, { status: 400 });
  }

  // Fire-and-forget so the Worker gets a fast 200 ACK
  exitSequenceEnrollmentsOnReply(fromEmail).catch(console.error);

  return NextResponse.json({ received: true }, { status: 200 });
}

// ─── Sequence exit-condition enforcement ─────────────────────────────────────

async function exitSequenceEnrollmentsOnReply(clientEmail: string): Promise<void> {
  let candidates: WPEnrollmentPost[] = [];
  try {
    const { items } = await listEnrollments({
      meta_key:   "enr_client_email",
      meta_value: clientEmail,
    });
    candidates = items;
  } catch (err) {
    console.error("[webhooks/inbound-email] Failed to list enrollments:", err);
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
        `[webhooks/inbound-email] Enrollment ${enrollment.id} exited — client ${clientEmail} replied to sequence ${enrollment.acf.enr_sequence_id}`,
      );
    } catch (err) {
      console.error(`[webhooks/inbound-email] Failed to exit enrollment ${enrollment.id}:`, err);
    }
  }
}
