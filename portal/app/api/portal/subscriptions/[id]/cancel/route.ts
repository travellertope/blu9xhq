import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost, updateSubscription, wpRestFetch, getServicePost} from "@/lib/wp-api";
import type { WPSubscriptionPost } from "@/lib/wp-api";
import { sendCancellationRequested } from "@/lib/resend";
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
    clientId?: number | string;
    name?: string | null;
    email?: string | null;
  };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;

  if (!wpUserId && !sessionClientId) {
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
    let clientPostId: number | undefined = sessionClientId;
    if (!clientPostId) {
      const found = await resolveClientPost(sessionClientId, wpUserId).catch(() => null);
      if (!found) return NextResponse.json({ error: "Client not found" }, { status: 404 });
      clientPostId = found.id;
    }
    if (!clientPostId) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const clientPost = { id: clientPostId as number };

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
    if (wpUserId) {
      logAuditEvent({
        action: "subscription_cancellation_requested",
        actorName: user.name ?? "Client",
        actorWpUserId: wpUserId,
        detail: `Reason: ${reason}${typeof note === "string" && note ? ` | Note: ${note}` : ""}`,
        clientId: clientPost.id,
      }).catch((err) => console.error("[cancel] auditLog failed:", err));
    }

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

    // Send admin email (fire and forget) — fetch service name for a useful subject line
    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@bluuhq.com";
    const clientName = user.name || "Client";
    const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "";
    getServicePost(sub.acf.service_id)
      .then((svc) => svc.title.rendered.replace(/<[^>]+>/g, ""))
      .catch(() => `Subscription #${subscriptionId}`)
      .then((serviceName) =>
        sendCancellationRequested(adminEmail, {
          clientName,
          serviceName,
          reason,
          note: typeof note === "string" && note ? note : undefined,
          reviewUrl: `${appUrl}/admin/clients/${clientPost.id}`,
        })
      )
      .catch((err) => console.error("[cancel] sendCancellationRequested failed:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/subscriptions/cancel] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
