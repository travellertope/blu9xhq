import { NextRequest, NextResponse } from "next/server";
import { requireSession, requirePermission } from "@/lib/apiPermissions";
import { listAllSubscriptions, createSubscription, getClientPost, getServicePost } from "@/lib/wp-api";
import { sendNewService } from "@/lib/resend";
import { z } from "zod";

const postSchema = z.object({
  clientId:       z.number().int().positive(),
  serviceId:      z.number().int().positive(),
  status:         z.enum(["active", "paused", "cancelled", "pending"]).default("active"),
  amount:         z.number().min(0),
  currency:       z.string().min(1),
  billingCycle:   z.enum(["monthly", "quarterly", "annual", "one_time"]),
  startDate:      z.string().optional(),
  nextBillingDate: z.string().optional(),
  notes:          z.string().optional(),
});

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

// ─── POST /api/admin/subscriptions ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requirePermission(req, "assign_subscriptions");
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const d = parsed.data;

  try {
    const [client, service] = await Promise.all([
      getClientPost(d.clientId).catch(() => null),
      getServicePost(d.serviceId).catch(() => null),
    ]);

    const clientLabel  = client?.acf?.company_name || client?.acf?.contact_name || `Client #${d.clientId}`;
    const serviceLabel = service?.title?.rendered?.replace(/<[^>]+>/g, "") || `Service #${d.serviceId}`;

    const post = await createSubscription({
      title: `${clientLabel} — ${serviceLabel}`,
      acf: {
        client_id:         d.clientId,
        service_id:        d.serviceId,
        status:            d.status,
        amount:            d.amount,
        currency:          d.currency,
        billing_cycle:     d.billingCycle,
        start_date:        d.startDate,
        next_billing_date: d.nextBillingDate,
        notes:             d.notes,
      },
    });

    // Notify client of new service (fire and forget)
    const clientEmail = client?.acf?.portal_email ?? client?.acf?.contact_email;
    const clientName  = client?.acf?.contact_name || client?.title?.rendered || `Client #${d.clientId}`;
    const portalUrl   = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal/subscriptions`;
    if (clientEmail && d.status === "active") {
      void sendNewService(clientEmail, {
        clientName,
        serviceName: serviceLabel,
        portalUrl,
      }).catch((err) => console.error("[subscriptions] sendNewService failed:", err));
    }

    return NextResponse.json({ subscription: post }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/subscriptions]", err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
