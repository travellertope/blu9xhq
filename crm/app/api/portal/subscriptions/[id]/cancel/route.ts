import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendCancellationRequested } from "@/lib/resend";
import { logAuditEvent } from "@/lib/auditLog";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const clientId = session.user.clientId;
  const tenantId = session.user.tenantId!;
  const userId = session.user.id;
  const userName = session.user.name;

  if (!clientId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const { id: subscriptionId } = await params;

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
    const supabase = createSupabaseServerClient();

    const { data: sub, error: fetchErr } = await supabase
      .from("subscriptions")
      .select("*, services(title)")
      .eq("id", subscriptionId)
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date().toISOString();

    const { error: updateErr } = await supabase
      .from("subscriptions")
      .update({
        status: "cancellation_pending",
        sub_cancellation_reason: reason,
        sub_cancellation_note: typeof note === "string" ? note : null,
        sub_cancellation_requested_at: now,
      })
      .eq("id", subscriptionId)
      .eq("tenant_id", tenantId);
    if (updateErr) throw updateErr;

    // Log audit event (fire and forget)
    logAuditEvent({
      action: "subscription_cancellation_requested",
      actorName: userName ?? "Client",
      detail: `Reason: ${reason}${typeof note === "string" && note ? ` | Note: ${note}` : ""}`,
      clientId,
    }).catch((err) => console.error("[cancel] auditLog failed:", err));

    // Create communication entry (fire and forget)
    supabase.from("communications").insert({
      tenant_id:   tenantId,
      client_id:   clientId,
      direction:   "inbound",
      channel:     "other",
      comm_type:   "manual",
      subject:     `Cancellation request for subscription ${subscriptionId}`,
      body:        `Reason: ${reason}${typeof note === "string" && note ? `\nNote: ${note}` : ""}`,
      occurred_at: now,
      logged_by:   userId,
    }).then(({ error }) => { if (error) console.error("[cancel] comm insert failed:", error); });

    // Send admin email (fire and forget)
    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@bluuhq.com";
    const clientName = userName || "Client";
    const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const serviceName = sub.services?.title ?? `Subscription ${subscriptionId}`;
    void sendCancellationRequested(adminEmail, {
      clientName,
      serviceName,
      reason,
      note: typeof note === "string" && note ? note : undefined,
      reviewUrl: `${appUrl}/admin/clients/${clientId}`,
    }).catch((err) => console.error("[cancel] sendCancellationRequested failed:", err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/subscriptions/cancel] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
