import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost, listSubscriptionsByClient, getServicePost, listClientFiles, type WPFilePost} from "@/lib/wp-api";

interface ActionButton {
  label: string;
  url: string;
}

export async function GET(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as { wpUserId?: number; clientId?: number | string };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;

  if (!wpUserId && !sessionClientId) {
    return NextResponse.json({ subscriptions: [] });
  }

  try {
    // Prefer clientId already in the JWT — avoids a WP meta query
    let clientPostId = sessionClientId;
    if (!clientPostId) {
      const clientPost = await resolveClientPost(sessionClientId, wpUserId).catch((err) => {
        console.error("[portal/subscriptions] resolveClientPost failed:", err);
        return null;
      });
      if (!clientPost) {
        return NextResponse.json({ subscriptions: [] });
      }
      clientPostId = clientPost.id;
    }
    // Shim so the rest of the code can keep using clientPost.id
    const clientPost = { id: clientPostId };

    const subsResult = await listSubscriptionsByClient(clientPost.id).catch((err) => {
      console.error("[portal/subscriptions] listSubscriptionsByClient failed:", err);
      return { items: [], total: 0, totalPages: 0 };
    });

    // Fetch services (deduplicated) and all client files in parallel — one call each
    const uniqueServiceIds = Array.from(
      new Set(subsResult.items.map((s) => s.acf.service_id).filter(Boolean) as number[])
    );
    const [serviceEntries, allFilesResult] = await Promise.all([
      Promise.all(
        uniqueServiceIds.map(async (id) => [id, await getServicePost(id).catch(() => null)] as const)
      ),
      listClientFiles(clientPost.id).catch(() => ({ items: [] as WPFilePost[] })),
    ]);
    const serviceMap = new Map<number, Awaited<ReturnType<typeof getServicePost>> | null>(serviceEntries);
    const allFiles = allFilesResult.items;

    const subscriptions = subsResult.items.map((sub) => {
        const filesCount = allFiles.filter((f) => f.acf.file_subscription_id === sub.id).length;
        const service = sub.acf.service_id ? (serviceMap.get(sub.acf.service_id) ?? null) : null;

        let actionButtons: ActionButton[] = [];
        try {
          const labels: string[] = JSON.parse(sub.acf.sub_action_button_labels ?? "[]");
          const urls: string[] = JSON.parse(sub.acf.sub_action_button_urls ?? "[]");
          actionButtons = labels.map((label, i) => ({ label, url: urls[i] ?? "#" }));
        } catch {
          actionButtons = [];
        }

        let sensitiveFieldLabels: { label: string }[] = [];
        try {
          const labels: string[] = JSON.parse(sub.acf.sub_sensitive_field_labels ?? "[]");
          sensitiveFieldLabels = labels.map((label) => ({ label }));
        } catch {
          sensitiveFieldLabels = [];
        }

        return {
          id: sub.id,
          title: sub.title.rendered,
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
          filesCount,
          service: service
            ? {
                id: service.id,
                name: service.title.rendered,
                category: service.acf.category ?? null,
                description: service.acf.description ?? null,
              }
            : null,
        };
      });

    return NextResponse.json({ subscriptions });
  } catch (err) {
    console.error("[portal/subscriptions] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
