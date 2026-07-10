import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch } from "@/lib/wp-api";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── GET /api/cron/calculate-commissions ──────────────────────────────────────
// Runs on the 1st of each month.
// Finds pending conversions older than 30 days and approves the commission,
// and approves any commission records already in 'pending' for >30 days.

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("Authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffISO = cutoff.toISOString();

  const results = { checked: 0, approved: 0, errors: 0 };

  try {
    // Find all pending commissions
    const commissions = await wpRestFetch<any[]>(
      `/wp/v2/bluu_aff_commission?per_page=100&status=publish&meta_key=commission_status&meta_value=pending`
    ).catch(() => [] as any[]);

    results.checked = commissions.length;

    await Promise.allSettled(
      commissions
        .filter((c: any) => {
          const createdAt = c.date ?? c.meta?.created_at ?? "";
          return createdAt < cutoffISO;
        })
        .map(async (c: any) => {
          try {
            await wpRestFetch(`/wp/v2/bluu_aff_commission/${c.id}`, {
              method: "POST",
              body: JSON.stringify({
                meta: { commission_status: "approved" },
              }),
            });
            results.approved++;
          } catch (err) {
            console.error(`[cron/calculate-commissions] commission ${c.id}:`, err);
            results.errors++;
          }
        })
    );

    return NextResponse.json({ ok: true, ...results, cutoff: cutoffISO });
  } catch (err) {
    console.error("[GET /api/cron/calculate-commissions]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
