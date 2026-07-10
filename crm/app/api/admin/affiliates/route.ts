import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch } from "@/lib/wp-api";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.tenantPlan !== "agency") return NextResponse.json({ error: "Agency plan required" }, { status: 403 });
  return session;
}

// ─── GET /api/admin/affiliates ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const page    = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage = Math.min(parseInt(searchParams.get("per_page") ?? "20", 10), 100);
  const search  = searchParams.get("search") ?? "";
  const status  = searchParams.get("status") ?? "";

  try {
    const qs = new URLSearchParams({
      roles:    "bluu_affiliate",
      context:  "edit",
      per_page: String(perPage),
      page:     String(page),
      ...(search ? { search } : {}),
    });

    const res = await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/wp/v2/users?${qs.toString()}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.WP_APP_USERNAME}:${process.env.WP_APP_PASSWORD}`).toString("base64")}`,
        },
        cache: "no-store",
      }
    );
    const total      = parseInt(res.headers.get("X-WP-Total") ?? "0", 10);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10);
    const users: any[] = await res.json().catch(() => []);

    const affiliates = users
      .filter((u: any) => !status || u.meta?.bluu_affiliate_status === status)
      .map((u: any) => ({
        id:              u.id,
        name:            u.name,
        email:           u.email,
        affiliateCode:   u.meta?.bluu_affiliate_code ?? "",
        status:          u.meta?.bluu_affiliate_status ?? "active",
        website:         u.meta?.bluu_affiliate_website ?? "",
        payoutMethod:    u.meta?.bluu_affiliate_payout_method ?? "",
        agreedAt:        u.meta?.bluu_affiliate_agreed_at ?? "",
        registered:      u.registered_date ?? "",
      }));

    return NextResponse.json({ affiliates, total, totalPages, page });
  } catch (err) {
    console.error("[GET /api/admin/affiliates]", err);
    return NextResponse.json({ error: "Failed to fetch affiliates." }, { status: 502 });
  }
}
