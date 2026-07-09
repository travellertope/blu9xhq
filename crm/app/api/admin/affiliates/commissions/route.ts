import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch } from "@/lib/wp-api";
import { z } from "zod";

async function requireAdmin() {
  const session = await getSession();
  if (!session || (session.user as any)?.role !== "bluu_admin") return null;
  return session;
}

// ─── GET /api/admin/affiliates/commissions ────────────────────────────────────

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status  = searchParams.get("status") ?? "";
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "50", 10), 100);
  const page    = parseInt(searchParams.get("page") ?? "1", 10);

  try {
    const qs = new URLSearchParams({
      per_page: String(perPage),
      page:     String(page),
      status:   "publish",
      orderby:  "date",
      order:    "desc",
      ...(status ? { meta_key: "commission_status", meta_value: status } : {}),
    });

    const res = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/wp/v2/bluu_aff_commission?${qs.toString()}`,
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

    const commissions = raw.map((c: any) => ({
      id:               String(c.id),
      affiliateCode:    c.meta?.affiliate_code ?? "",
      product:          c.meta?.product ?? "",
      period:           c.meta?.period ?? "",
      grossAmount:      Number(c.meta?.gross_amount ?? 0),
      commissionRate:   Number(c.meta?.commission_rate ?? 0),
      commissionAmount: Number(c.meta?.commission_amount ?? 0),
      status:           c.meta?.commission_status ?? "pending",
      externalRef:      c.meta?.external_ref ?? "",
      date:             c.date,
    }));

    return NextResponse.json({ commissions, total, totalPages, page });
  } catch (err) {
    console.error("[GET /api/admin/affiliates/commissions]", err);
    return NextResponse.json({ error: "Failed to fetch commissions." }, { status: 502 });
  }
}

// ─── PATCH /api/admin/affiliates/commissions ──────────────────────────────────
// Body: { id: string; status: "approved" | "paid" | "cancelled" }

const patchSchema = z.object({
  id:     z.string(),
  status: z.enum(["approved", "paid", "cancelled"]),
  paidAt: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation error." }, { status: 422 });

  try {
    await wpRestFetch(`/wp/v2/bluu_aff_commission/${parsed.data.id}`, {
      method: "POST",
      body: JSON.stringify({
        meta: {
          commission_status: parsed.data.status,
          ...(parsed.data.status === "paid" ? { paid_at: parsed.data.paidAt ?? new Date().toISOString() } : {}),
        },
      }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/affiliates/commissions]", err);
    return NextResponse.json({ error: "Failed to update commission." }, { status: 502 });
  }
}
