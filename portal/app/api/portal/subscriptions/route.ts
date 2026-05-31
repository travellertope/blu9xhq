import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {
  findClientByWpUserId,
  listSubscriptionsByClient,
  getServicePost,
  listClientFiles,
} from "@/lib/wp-api";

interface ActionButton {
  icon: string;
  label: string;
  url: string;
}

interface SensitiveFieldLabel {
  label: string;
}

export async function GET(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;

  if (!wpUserId) {
    return NextResponse.json({ error: "No WP user ID in session" }, { status: 400 });
  }

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const subsResult = await listSubscriptionsByClient(clientPost.id);

    const subscriptions = await Promise.all(
      subsResult.items.map(async (sub) => {
        const [service, filesResult] = await Promise.all([
          sub.acf.service_id
            ? getServicePost(sub.acf.service_id).catch(() => null)
            : Promise.resolve(null),
          listClientFiles(clientPost.id, {
            meta_key: "file_subscription_id",
            meta_value: sub.id,
          }).catch(() => ({ items: [] })),
        ]);

        let actionButtons: ActionButton[] = [];
        if (sub.acf.action_button_values) {
          try {
            actionButtons = JSON.parse(sub.acf.action_button_values) as ActionButton[];
          } catch {
            actionButtons = [];
          }
        }

        let sensitiveFieldLabels: SensitiveFieldLabel[] = [];
        if (sub.acf.sensitive_field_labels) {
          try {
            sensitiveFieldLabels = JSON.parse(sub.acf.sensitive_field_labels) as SensitiveFieldLabel[];
          } catch {
            sensitiveFieldLabels = [];
          }
        }

        return {
          id: sub.id,
          status: sub.acf.status,
          amount: sub.acf.amount,
          currency: sub.acf.currency,
          billingCycle: sub.acf.billing_cycle,
          nextBillingDate: sub.acf.next_billing_date ?? null,
          startDate: sub.acf.start_date ?? null,
          endDate: sub.acf.end_date ?? null,
          cancellationReason: sub.acf.sub_cancellation_reason ?? null,
          cancellationRequestedAt: sub.acf.sub_cancellation_requested_at ?? null,
          actionButtons,
          sensitiveFieldLabels,
          filesCount: filesResult.items.length,
          service: service
            ? {
                id: service.id,
                name: service.title.rendered,
                category: service.acf.category ?? null,
                description: service.acf.description ?? null,
                deliverables: service.acf.deliverables ?? null,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ subscriptions });
  } catch (err) {
    console.error("[portal/subscriptions] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
