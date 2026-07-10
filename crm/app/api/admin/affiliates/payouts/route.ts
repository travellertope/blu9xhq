import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch } from "@/lib/wp-api";
import { z } from "zod";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.tenantPlan !== "agency") return NextResponse.json({ error: "Agency plan required" }, { status: 403 });
  return session;
}

// ─── GET /api/admin/affiliates/payouts ───────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const status  = searchParams.get("status") ?? "pending";
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "50", 10), 100);
  const page    = parseInt(searchParams.get("page") ?? "1", 10);

  try {
    const qs = new URLSearchParams({
      per_page: String(perPage),
      page:     String(page),
      status:   "publish",
      orderby:  "date",
      order:    "desc",
      meta_key:   "payout_status",
      meta_value: status,
    });

    const res = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/wp/v2/bluu_aff_payout?${qs.toString()}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.WP_APP_USERNAME}:${process.env.WP_APP_PASSWORD}`).toString("base64")}`,
        },
        cache: "no-store",
      }
    );
    const total      = parseInt(res.headers.get("X-WP-Total") ?? "0", 10);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10);
    const raw: any[] = await res.json().catch(() => []);

    const payouts = raw.map((p: any) => ({
      id:            String(p.id),
      affiliateCode: p.meta?.affiliate_code ?? "",
      totalAmount:   Number(p.meta?.total_amount ?? 0),
      method:        p.meta?.payout_method ?? "",
      status:        p.meta?.payout_status ?? "pending",
      initiatedAt:   p.meta?.initiated_at ?? p.date,
      completedAt:   p.meta?.completed_at ?? undefined,
      transferRef:   p.meta?.transfer_ref ?? undefined,
    }));

    return NextResponse.json({ payouts, total, totalPages, page });
  } catch (err) {
    console.error("[GET /api/admin/affiliates/payouts]", err);
    return NextResponse.json({ error: "Failed to fetch payouts." }, { status: 502 });
  }
}

// ─── PATCH /api/admin/affiliates/payouts ─────────────────────────────────────
// Body: { id, status, transferRef? }

const patchSchema = z.object({
  id:          z.string(),
  status:      z.enum(["processing", "completed", "failed"]),
  transferRef: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error." }, { status: 422 });

  try {
    await wpRestFetch(`/wp/v2/bluu_aff_payout/${parsed.data.id}`, {
      method: "POST",
      body: JSON.stringify({
        meta: {
          payout_status: parsed.data.status,
          ...(parsed.data.transferRef ? { transfer_ref: parsed.data.transferRef } : {}),
          ...(parsed.data.status === "completed" ? { completed_at: new Date().toISOString() } : {}),
        },
      }),
    });

    // Mark related commissions as paid when payout completes
    if (parsed.data.status === "completed") {
      const payout = await wpRestFetch<any>(`/wp/v2/bluu_aff_payout/${parsed.data.id}`).catch(() => null);
      const affiliateCode = payout?.meta?.affiliate_code;
      if (affiliateCode) {
        const commissions = await wpRestFetch<any[]>(
          `/wp/v2/bluu_aff_commission?search=${encodeURIComponent(affiliateCode)}&meta_key=commission_status&meta_value=approved&per_page=100&status=publish`
        ).catch(() => []);
        await Promise.allSettled(
          commissions
            .filter((c: any) => c.meta?.affiliate_code === affiliateCode || (c.title?.rendered ?? "").includes(affiliateCode))
            .map((c: any) =>
              wpRestFetch(`/wp/v2/bluu_aff_commission/${c.id}`, {
                method: "POST",
                body: JSON.stringify({ meta: { commission_status: "paid", paid_at: new Date().toISOString() } }),
              })
            )
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/affiliates/payouts]", err);
    return NextResponse.json({ error: "Failed to update payout." }, { status: 502 });
  }
}
