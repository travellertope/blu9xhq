import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { getSubscription, updateSubscription } from "@/lib/wp-api";
import { logAuditEvent } from "@/lib/auditLog";
import { sendEmail } from "@/lib/resend";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as any;
  const clientId = parseInt(user.clientId ?? "0", 10);

  if (!clientId) {
    return NextResponse.json({ error: "No client profile linked" }, { status: 403 });
  }

  const subId = parseInt(params.id, 10);
  if (isNaN(subId)) {
    return NextResponse.json({ error: "Invalid subscription id" }, { status: 400 });
  }

  let reason = "";
  let note = "";
  try {
    const body = await req.json();
    reason = String(body.reason ?? "").slice(0, 200);
    note = String(body.note ?? "").slice(0, 1000);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!reason) {
    return NextResponse.json({ error: "reason is required" }, { status: 422 });
  }

  try {
    const sub = await getSubscription(subId);

    if (sub.acf.client_id !== clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (sub.acf.sub_cancellation_requested_at) {
      return NextResponse.json({ error: "Cancellation already requested" }, { status: 409 });
    }

    if (sub.acf.status === "cancelled") {
      return NextResponse.json({ error: "Subscription is already cancelled" }, { status: 409 });
    }

    const now = new Date().toISOString();
    await updateSubscription(subId, {
      acf: {
        sub_cancellation_requested_at: now,
        sub_cancellation_reason: reason,
        sub_cancellation_note: note,
      },
    });

    logAuditEvent({
      action: "portal.subscription.cancel_requested",
      actorName: user.name ?? user.email,
      actorWpUserId: user.wpUserId,
      detail: `Subscription #${subId} — reason: ${reason}`,
      clientId,
    }).catch(() => {});

    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM ?? "hello@bluuhq.com";
    sendEmail({
      to: adminEmail,
      subject: `Cancellation Request — ${user.name}`,
      html: `<p><strong>${user.name}</strong> has requested cancellation of subscription #${subId}.</p>
<p><strong>Reason:</strong> ${reason}</p>
${note ? `<p><strong>Note:</strong> ${note}</p>` : ""}
<p>Log in to the admin panel to review and action this request.</p>`,
      text: `${user.name} requested cancellation of subscription #${subId}.\nReason: ${reason}\n${note ? `Note: ${note}` : ""}`,
      tags: [{ name: "type", value: "cancellation_request" }],
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/portal/subscriptions/[id]/cancel]", err);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
