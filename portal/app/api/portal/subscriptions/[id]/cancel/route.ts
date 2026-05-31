import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {
  findClientByWpUserId,
  updateSubscription,
  wpRestFetch,
} from "@/lib/wp-api";
import type { WPSubscriptionPost } from "@/lib/wp-api";
import { sendEmailHtml } from "@/lib/resend";
import { logAuditEvent } from "@/lib/auditLog";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as {
    wpUserId?: number;
    name?: string | null;
    email?: string | null;
  };
  const wpUserId = user.wpUserId;

  if (!wpUserId) {
    return NextResponse.json({ error: "No WP user ID in session" }, { status: 400 });
  }

  const { id: rawId } = await params;
  const subscriptionId = parseInt(rawId, 10);
  if (isNaN(subscriptionId)) {
    return NextResponse.json({ error: "Invalid subscription ID" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { reason, note } = body as { reason?: unknown; note?: unknown };
  if (typeof reason !== "string" || !reason.trim()) {
    return NextResponse.json({ error: "reason is required" }, { status: 400 });
  }

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Fetch the subscription and verify ownership
    const sub = await wpRestFetch<WPSubscriptionPost>(
      `/wp/v2/bluu_subscription/${subscriptionId}`
    );

    if (sub.acf.client_id !== clientPost.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Update subscription status
    await updateSubscription(subscriptionId, {
      acf: {
        status: "cancellation_pending",
        sub_cancellation_reason: reason,
        sub_cancellation_note: typeof note === "string" ? note : undefined,
        sub_cancellation_requested_at: now,
      },
    });

    // Log audit event (fire and forget)
    logAuditEvent({
      action: "subscription_cancellation_requested",
      actorName: user.name ?? "Client",
      actorWpUserId: wpUserId,
      detail: `Reason: ${reason}${typeof note === "string" && note ? ` | Note: ${note}` : ""}`,
      clientId: clientPost.id,
    }).catch((err) => console.error("[cancel] auditLog failed:", err));

    // Create communication entry (fire and forget)
    wpRestFetch("/wp/v2/bluu_communication", {
      method: "POST",
      body: JSON.stringify({
        title: `Cancellation request: subscription ${subscriptionId}`,
        status: "publish",
        acf: {
          comm_direction: "inbound",
          comm_channel: "system",
          comm_type: "system",
          comm_subject: `Cancellation request for subscription ${subscriptionId}`,
          comm_content: `Reason: ${reason}${typeof note === "string" && note ? `\nNote: ${note}` : ""}`,
          comm_occurred_at: now,
          comm_client: clientPost.id,
          comm_logged_by: wpUserId,
        },
      }),
    }).catch((err) => console.error("[cancel] comm post failed:", err));

    // Send admin email (fire and forget)
    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@bluuhq.com";
    sendEmailHtml({
      to: adminEmail,
      subject: `Cancellation request — Subscription #${subscriptionId}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Cancellation Request Received</h2>
          <p><strong>Client:</strong> ${user.name ?? "Unknown"} (${user.email ?? ""})</p>
          <p><strong>Subscription ID:</strong> ${subscriptionId}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          ${typeof note === "string" && note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
          <p><strong>Requested at:</strong> ${now}</p>
          <p>Please review in the admin dashboard and process the cancellation.</p>
        </div>
      `,
      text: `Cancellation Request\n\nClient: ${user.name ?? "Unknown"} (${user.email ?? ""})\nSubscription ID: ${subscriptionId}\nReason: ${reason}\nRequested at: ${now}`,
      tags: [{ name: "type", value: "cancellation_request" }],
    }).catch((err) => console.error("[cancel] email failed:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/subscriptions/cancel] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
