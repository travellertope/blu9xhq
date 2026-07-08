import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { wpRestFetch, wpRestList } from "@/lib/wp-api";
import type { AffiliateStats, AffiliateConversion, AffiliateCommission } from "@/types";

async function requireAffiliate() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || user?.role !== "bluu_affiliate" || !user?.affiliateCode) return null;
  return { session, affiliateCode: user.affiliateCode as string };
}

function currentPeriod(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── GET /api/affiliates/commissions ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAffiliate();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { affiliateCode } = auth;
  const { searchParams } = new URL(req.url);
  const summary = searchParams.get("summary") === "1";
  const type    = searchParams.get("type");

  try {
    if (summary) {
      return NextResponse.json(await getSummary(affiliateCode));
    }
    if (type === "conversions") {
      return NextResponse.json({ conversions: await getConversions(affiliateCode) });
    }
    return NextResponse.json({ commissions: await getCommissions(affiliateCode) });
  } catch (err) {
    console.error("[GET /api/affiliates/commissions]", err);
    return NextResponse.json({ error: "Failed to fetch data." }, { status: 502 });
  }
}

// ─── helpers ─────────────────────────────────────────────────────────────────

async function fetchByCode(cpt: string, code: string, perPage = 100): Promise<any[]> {
  try {
    const res = await wpRestFetch<any[]>(
      `/wp/v2/${cpt}?search=${encodeURIComponent(code)}&per_page=${perPage}&status=publish`
    );
    return Array.isArray(res) ? res.filter((p: any) => p.meta?.affiliate_code === code || (p.title?.rendered ?? "").includes(code)) : [];
  } catch {
    return [];
  }
}

async function getSummary(code: string): Promise<AffiliateStats> {
  const [clicks, conversions, commissions] = await Promise.all([
    fetchByCode("bluu_aff_click", code),
    fetchByCode("bluu_aff_conversion", code),
    fetchByCode("bluu_aff_commission", code),
  ]);

  const period = currentPeriod();
  const allTimeEarnings  = commissions.reduce((s: number, c: any) => s + (Number(c.meta?.commission_amount) || 0), 0);
  const thisMonthEarnings = commissions
    .filter((c: any) => (c.meta?.period ?? "") === period)
    .reduce((s: number, c: any) => s + (Number(c.meta?.commission_amount) || 0), 0);
  const pendingPayout = commissions
    .filter((c: any) => ["pending", "approved"].includes(c.meta?.commission_status ?? ""))
    .reduce((s: number, c: any) => s + (Number(c.meta?.commission_amount) || 0), 0);

  const totalClicks      = clicks.length;
  const totalConversions = conversions.length;
  const conversionRate   = totalClicks > 0 ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(1)) : 0;

  const activeReferrals = new Set(
    conversions
      .filter((c: any) => ["approved", "pending"].includes(c.meta?.conversion_status ?? ""))
      .map((c: any) => c.meta?.external_ref ?? c.id)
  ).size;

  return { totalClicks, totalConversions, conversionRate, thisMonthEarnings, allTimeEarnings, pendingPayout, activeReferrals };
}

async function getConversions(code: string): Promise<AffiliateConversion[]> {
  const posts = await fetchByCode("bluu_aff_conversion", code);
  return posts.map((p: any) => ({
    id:              String(p.id),
    wpPostId:        p.id,
    product:         p.meta?.product ?? "scan_tool",
    conversionType:  p.meta?.conversion_type ?? "paid_subscription",
    status:          p.meta?.conversion_status ?? "pending",
    createdAt:       p.meta?.converted_at ?? p.date,
    commissionAmount: p.meta?.commission_amount != null ? Number(p.meta.commission_amount) : undefined,
  }));
}

async function getCommissions(code: string): Promise<AffiliateCommission[]> {
  const posts = await fetchByCode("bluu_aff_commission", code);
  return posts.map((p: any) => ({
    id:               String(p.id),
    wpPostId:         p.id,
    conversionId:     String(p.meta?.conversion_id ?? ""),
    type:             p.meta?.commission_type ?? "initial",
    period:           p.meta?.period ?? "",
    grossAmount:      Number(p.meta?.gross_amount ?? 0),
    commissionRate:   Number(p.meta?.commission_rate ?? 0),
    commissionAmount: Number(p.meta?.commission_amount ?? 0),
    status:           p.meta?.commission_status ?? "pending",
    paidAt:           p.meta?.paid_at ?? undefined,
    product:          p.meta?.product ?? "scan_tool",
  }));
}
