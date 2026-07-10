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

// ─── GET /api/admin/affiliates/[id] ──────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const user = await wpRestFetch<any>(`/wp/v2/users/${params.id}?context=edit`);

    const [clicks, conversions, commissions, payouts] = await Promise.all([
      wpRestFetch<any[]>(`/wp/v2/bluu_aff_click?search=${encodeURIComponent(user.meta?.bluu_affiliate_code ?? "")}&per_page=10&status=publish`).catch(() => []),
      wpRestFetch<any[]>(`/wp/v2/bluu_aff_conversion?search=${encodeURIComponent(user.meta?.bluu_affiliate_code ?? "")}&per_page=20&status=publish`).catch(() => []),
      wpRestFetch<any[]>(`/wp/v2/bluu_aff_commission?search=${encodeURIComponent(user.meta?.bluu_affiliate_code ?? "")}&per_page=50&status=publish`).catch(() => []),
      wpRestFetch<any[]>(`/wp/v2/bluu_aff_payout?search=${encodeURIComponent(user.meta?.bluu_affiliate_code ?? "")}&per_page=10&status=publish`).catch(() => []),
    ]);

    const code = user.meta?.bluu_affiliate_code ?? "";
    const filteredCommissions = commissions.filter((c: any) =>
      c.meta?.affiliate_code === code || (c.title?.rendered ?? "").includes(code)
    );
    const allTimeEarnings = filteredCommissions.reduce((s: number, c: any) => s + Number(c.meta?.commission_amount ?? 0), 0);
    const pendingPayout   = filteredCommissions
      .filter((c: any) => ["pending", "approved"].includes(c.meta?.commission_status ?? ""))
      .reduce((s: number, c: any) => s + Number(c.meta?.commission_amount ?? 0), 0);

    return NextResponse.json({
      affiliate: {
        id:            user.id,
        name:          user.name,
        email:         user.email,
        affiliateCode: code,
        status:        user.meta?.bluu_affiliate_status ?? "active",
        website:       user.meta?.bluu_affiliate_website ?? "",
        payoutMethod:  user.meta?.bluu_affiliate_payout_method ?? "",
        payoutDetails: user.meta?.bluu_affiliate_payout_details ?? "",
        agreedAt:      user.meta?.bluu_affiliate_agreed_at ?? "",
        registered:    user.registered_date ?? "",
      },
      stats: {
        totalClicks:      clicks.length,
        totalConversions: conversions.filter((c: any) => c.meta?.affiliate_code === code || (c.title?.rendered ?? "").includes(code)).length,
        allTimeEarnings,
        pendingPayout,
      },
      commissions: filteredCommissions.map((c: any) => ({
        id:               String(c.id),
        period:           c.meta?.period ?? "",
        product:          c.meta?.product ?? "",
        grossAmount:      Number(c.meta?.gross_amount ?? 0),
        commissionRate:   Number(c.meta?.commission_rate ?? 0),
        commissionAmount: Number(c.meta?.commission_amount ?? 0),
        status:           c.meta?.commission_status ?? "pending",
        externalRef:      c.meta?.external_ref ?? "",
        date:             c.date,
      })),
      payouts: payouts
        .filter((p: any) => p.meta?.affiliate_code === code || (p.title?.rendered ?? "").includes(code))
        .map((p: any) => ({
          id:          String(p.id),
          totalAmount: Number(p.meta?.total_amount ?? 0),
          method:      p.meta?.payout_method ?? "",
          status:      p.meta?.payout_status ?? "pending",
          initiatedAt: p.meta?.initiated_at ?? p.date,
          completedAt: p.meta?.completed_at ?? undefined,
          transferRef: p.meta?.transfer_ref ?? undefined,
        })),
    });
  } catch (err) {
    console.error("[GET /api/admin/affiliates/[id]]", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

// ─── PATCH /api/admin/affiliates/[id] ────────────────────────────────────────

const patchSchema = z.object({
  status: z.enum(["active", "suspended", "pending"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error." }, { status: 422 });

  try {
    await wpRestFetch(`/wp/v2/users/${params.id}`, {
      method: "POST",
      body: JSON.stringify({
        meta: {
          ...(parsed.data.status ? { bluu_affiliate_status: parsed.data.status } : {}),
        },
      }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/affiliates/[id]]", err);
    return NextResponse.json({ error: "Failed to update affiliate." }, { status: 502 });
  }
}
