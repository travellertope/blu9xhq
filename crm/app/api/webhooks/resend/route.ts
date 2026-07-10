import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { wpRestFetch, wpRestList, type WPCommunicationPost, type WPClientPost } from "@/lib/wp-api";

// ─── POST /api/webhooks/resend ────────────────────────────────────────────────
//
// Public webhook endpoint — no auth guard. Verifies Svix signatures when
// RESEND_WEBHOOK_SECRET is set.

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const svixId        = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (secret) {
    // Remove "whsec_" prefix if present, then base64-decode
    const secretClean = secret.startsWith("whsec_") ? secret.slice(6) : secret;
    const secretBytes = Buffer.from(secretClean, "base64");

    // Build the signed content: "<svix-id>.<svix-timestamp>.<rawBody>"
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
    const computed = createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    // svix-signature header format: "v1,<sig1> v1,<sig2> ..."
    const signatures = svixSignature
      .split(" ")
      .map((part) => part.replace(/^v1,/, "").trim())
      .filter(Boolean);

    const computedBuf = Buffer.from(computed);
    const matched = signatures.some((sig) => {
      try {
        const sigBuf = Buffer.from(sig);
        if (sigBuf.length !== computedBuf.length) return false;
        return timingSafeEqual(computedBuf, sigBuf);
      } catch {
        return false;
      }
    });

    if (!matched) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[webhooks/resend] RESEND_WEBHOOK_SECRET not set — skipping signature verification");
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const eventType = body.type as string | undefined;
  const data = (body.data ?? {}) as Record<string, unknown>;
  const emailId = (data.email_id ?? data.emailId) as string | undefined;

  if (eventType === "email.opened" || eventType === "email.clicked") {
    if (emailId) {
      updateEmailStatus(emailId, "opened").catch(console.error);
    }
  } else if (eventType === "email.bounced" || eventType === "email.complained") {
    if (emailId) {
      handleEmailBounced(emailId).catch(console.error);
    }
  }

  // Always respond 200 immediately
  return NextResponse.json({ received: true }, { status: 200 });
}

// ─── Fire-and-forget helpers ──────────────────────────────────────────────────

async function findCommByResendId(emailId: string): Promise<WPCommunicationPost | null> {
  const { items } = await wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
    per_page:   20,
    status:     "publish",
    meta_key:   "comm_resend_email_id",
    meta_value: emailId,
  });
  return items[0] ?? null;
}

async function updateEmailStatus(emailId: string, status: string): Promise<void> {
  const comm = await findCommByResendId(emailId);
  if (!comm) return;
  await wpRestFetch(`/wp/v2/bluu_communication/${comm.id}`, {
    method: "POST",
    body: JSON.stringify({ acf: { comm_email_status: status } }),
  });
}

async function handleEmailBounced(emailId: string): Promise<void> {
  try {
    const comm = await findCommByResendId(emailId);
    if (!comm) return;

    // Update comm status to "bounced"
    await wpRestFetch(`/wp/v2/bluu_communication/${comm.id}`, {
      method: "POST",
      body: JSON.stringify({ acf: { comm_email_status: "bounced" } }),
    });

    // If this comm has a client, update their health_status to "needs_attention"
    const clientId = comm.acf?.comm_client;
    if (clientId) {
      await wpRestFetch<WPClientPost>(`/wp/v2/bluu_client/${clientId}`, {
        method: "POST",
        body: JSON.stringify({ acf: { health_status: "needs_attention" } }),
      });
    }
  } catch (err) {
    console.error("[webhooks/resend] handleEmailBounced failed:", err);
  }
}
