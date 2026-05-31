import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { listClientSubscriptions, getServicePost } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as any;
  const clientId = parseInt(user.clientId ?? "0", 10);

  if (!clientId) {
    return NextResponse.json({ subscriptions: [] });
  }

  try {
    const { items } = await listClientSubscriptions(clientId);

    const enriched = await Promise.all(
      items.map(async (sub) => {
        let serviceName = "";
        if (sub.acf.service_id) {
          try {
            const svc = await getServicePost(sub.acf.service_id);
            serviceName = svc.title.rendered;
          } catch {
            serviceName = "";
          }
        }

        let actionButtonLabels: string[] = [];
        let actionButtonUrls: string[] = [];
        let credentialLabels: string[] = [];

        try {
          actionButtonLabels = JSON.parse(sub.acf.sub_action_button_labels ?? "[]");
        } catch { actionButtonLabels = []; }
        try {
          actionButtonUrls = JSON.parse(sub.acf.sub_action_button_urls ?? "[]");
        } catch { actionButtonUrls = []; }
        try {
          credentialLabels = JSON.parse(sub.acf.sub_sensitive_field_labels ?? "[]");
        } catch { credentialLabels = []; }

        return {
          id: sub.id,
          title: sub.title.rendered,
          serviceName,
          status: sub.acf.status,
          amount: sub.acf.amount,
          currency: sub.acf.currency,
          billingCycle: sub.acf.billing_cycle,
          nextBillingDate: sub.acf.next_billing_date,
          startDate: sub.acf.start_date,
          cancellationRequestedAt: sub.acf.sub_cancellation_requested_at,
          cancellationReason: sub.acf.sub_cancellation_reason,
          actionButtons: actionButtonLabels.map((label, i) => ({
            label,
            url: actionButtonUrls[i] ?? "#",
          })),
          credentialLabels,
          credentialCount: credentialLabels.length,
        };
      })
    );

    return NextResponse.json({ subscriptions: enriched });
  } catch (err) {
    console.error("[GET /api/portal/subscriptions]", err);
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }
}
