import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/apiPermissions";
import { listAllSubscriptions, getClientPost, getServicePost } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireSession(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const page       = parseInt(searchParams.get("page") ?? "1", 10);
  const statusFilter = searchParams.get("status") ?? null;

  try {
    const result = await listAllSubscriptions({ per_page: 50, page });

    const items = result.items.filter((s) => {
      if (statusFilter) return s.acf.status === statusFilter;
      return true;
    });

    const enriched = await Promise.all(
      items.map(async (s) => {
        let clientName = `Client #${s.acf.client_id}`;
        let serviceName = `Service #${s.acf.service_id}`;

        await Promise.all([
          getClientPost(s.acf.client_id)
            .then((c) => { clientName = c.acf.company_name || c.acf.contact_name; })
            .catch(() => undefined),
          getServicePost(s.acf.service_id)
            .then((sv) => { serviceName = sv.title.rendered.replace(/<[^>]+>/g, ""); })
            .catch(() => undefined),
        ]);

        return {
          id:              s.id,
          clientId:        s.acf.client_id,
          clientName,
          serviceId:       s.acf.service_id,
          serviceName,
          status:          s.acf.status,
          amount:          s.acf.amount,
          currency:        s.acf.currency,
          billingCycle:    s.acf.billing_cycle,
          nextBillingDate: s.acf.next_billing_date ?? null,
          startDate:       s.acf.start_date ?? null,
          createdAt:       s.date,
        };
      })
    );

    return NextResponse.json({
      subscriptions: enriched,
      total: result.total,
      totalPages: result.totalPages,
      page,
    });
  } catch (err) {
    console.error("[GET /api/admin/subscriptions]", err);
    return NextResponse.json({ error: "Failed to load subscriptions" }, { status: 500 });
  }
}
