import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ActionButton {
  label: string;
  url: string;
}

export async function GET(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const clientId = session.user.clientId;
  const tenantId = session.user.tenantId!;

  if (!clientId) {
    return NextResponse.json({ subscriptions: [] });
  }

  try {
    const supabase = createSupabaseServerClient();

    const [{ data: subs, error: subsErr }, { data: files, error: filesErr }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*, services(id,title,category,description,deliverables)")
        .eq("tenant_id", tenantId)
        .eq("client_id", clientId),
      supabase
        .from("files")
        .select("subscription_id")
        .eq("tenant_id", tenantId)
        .eq("client_id", clientId)
        .not("subscription_id", "is", null),
    ]);
    if (subsErr) throw subsErr;
    if (filesErr) throw filesErr;

    const filesCountBySub = new Map<string, number>();
    for (const f of files ?? []) {
      const key = f.subscription_id as string;
      filesCountBySub.set(key, (filesCountBySub.get(key) ?? 0) + 1);
    }

    const subscriptions = (subs ?? []).map((sub: any) => {
      const actionButtons: ActionButton[] = (sub.action_button_labels ?? []).map(
        (label: string, i: number) => ({ label, url: sub.action_button_urls?.[i] ?? "#" })
      );
      const sensitiveFieldLabels = (sub.sensitive_field_labels ?? []).map((label: string) => ({ label }));

      return {
        id: sub.id,
        title: sub.services?.title ?? "Subscription",
        status: sub.status,
        amount: sub.amount,
        currency: sub.currency,
        billingCycle: sub.billing_cycle,
        nextBillingDate: sub.next_billing_date ?? null,
        startDate: sub.start_date ?? null,
        endDate: sub.end_date ?? null,
        cancellationReason: sub.sub_cancellation_reason ?? null,
        cancellationRequestedAt: sub.sub_cancellation_requested_at ?? null,
        actionButtons,
        sensitiveFieldLabels,
        filesCount: filesCountBySub.get(sub.id) ?? 0,
        service: sub.services
          ? {
              id: sub.services.id,
              name: sub.services.title,
              category: sub.services.category ?? null,
              description: sub.services.description ?? null,
              deliverables: (sub.services.deliverables ?? []).join(", ") || null,
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
