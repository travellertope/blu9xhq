import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { wpRestFetch } from "@/lib/wp-api";
import { z } from "zod";
import type { AffiliatePayout } from "@/types";

async function requireAffiliate() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!session || user?.role !== "bluu_affiliate" || !user?.affiliateCode) return null;
  return { session, user };
}

const PAYOUT_MIN = 50;

// ─── GET — payout history ────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAffiliate();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const code = (auth.user as any).affiliateCode as string;

  try {
    const posts = await wpRestFetch<any[]>(
      `/wp/v2/bluu_aff_payout?search=${encodeURIComponent(code)}&per_page=50&status=publish`
    );
    const payouts: AffiliatePayout[] = (Array.isArray(posts) ? posts : [])
      .filter((p: any) => (p.meta?.affiliate_code === code) || (p.title?.rendered ?? "").includes(code))
      .map((p: any) => ({
        id:          String(p.id),
        wpPostId:    p.id,
        totalAmount: Number(p.meta?.total_amount ?? 0),
        method:      p.meta?.payout_method ?? "stripe",
        status:      p.meta?.payout_status ?? "pending",
        initiatedAt: p.meta?.initiated_at ?? p.date,
        completedAt: p.meta?.completed_at ?? undefined,
        transferRef: p.meta?.transfer_ref ?? undefined,
      }));
    return NextResponse.json({ payouts });
  } catch (err) {
    console.error("[GET /api/affiliates/payout]", err);
    return NextResponse.json({ payouts: [] });
  }
}

// ─── POST — request payout ───────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const auth = await requireAffiliate();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = auth.user as any;
  const code = user.affiliateCode as string;
  const wpUserId: number | undefined = user.wpUserId;

  // Get pending payout balance from commissions
  let pendingAmount = 0;
  try {
    const commissions = await wpRestFetch<any[]>(
      `/wp/v2/bluu_aff_commission?search=${encodeURIComponent(code)}&per_page=100&status=publish`
    );
    pendingAmount = (Array.isArray(commissions) ? commissions : [])
      .filter((c: any) =>
        (c.meta?.affiliate_code === code || (c.title?.rendered ?? "").includes(code)) &&
        ["pending", "approved"].includes(c.meta?.commission_status ?? "")
      )
      .reduce((s: number, c: any) => s + Number(c.meta?.commission_amount ?? 0), 0);
  } catch {
    return NextResponse.json({ error: "Could not verify balance." }, { status: 502 });
  }

  if (pendingAmount < PAYOUT_MIN) {
    return NextResponse.json(
      { error: `Minimum payout is $${PAYOUT_MIN}. Your current balance is $${pendingAmount.toFixed(2)}.` },
      { status: 422 }
    );
  }

  // Get affiliate's saved payout method
  let method = "stripe";
  if (wpUserId) {
    try {
      const wpUser = await wpRestFetch<any>(`/wp/v2/users/${wpUserId}?context=edit`);
      method = wpUser?.meta?.bluu_affiliate_payout_method ?? "stripe";
    } catch {
      // default to stripe
    }
  }

  try {
    await wpRestFetch("/wp/v2/bluu_aff_payout", {
      method: "POST",
      body: JSON.stringify({
        status: "publish",
        title:  `Payout — ${code} — ${new Date().toISOString()}`,
        meta: {
          affiliate_code: code,
          total_amount:   pendingAmount,
          payout_method:  method,
          payout_status:  "pending",
          initiated_at:   new Date().toISOString(),
        },
      }),
    });
    return NextResponse.json({ success: true, amount: pendingAmount });
  } catch (err) {
    console.error("[POST /api/affiliates/payout]", err);
    return NextResponse.json({ error: "Failed to submit payout request." }, { status: 502 });
  }
}

// ─── PATCH — save payout method ──────────────────────────────────────────────

const payoutSchema = z.discriminatedUnion("method", [
  z.object({
    method:      z.literal("paypal"),
    paypalEmail: z.string().email(),
  }),
  z.object({
    method:        z.literal("bank"),
    accountName:   z.string().min(2),
    accountNumber: z.string().min(4),
    sortCode:      z.string().optional(),
    bankName:      z.string().min(2),
  }),
  z.object({
    method:      z.literal("stripe"),
    stripeEmail: z.string().email(),
  }),
]);

export async function PATCH(req: NextRequest) {
  const auth = await requireAffiliate();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = auth.user as any;
  const wpUserId: number | undefined = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "User ID not found. Please log in again." }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const parsed = payoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation error." }, { status: 422 });
  }

  const { method, ...details } = parsed.data;

  try {
    await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
      method: "POST",
      body: JSON.stringify({
        meta: {
          bluu_affiliate_payout_method:  method,
          bluu_affiliate_payout_details: JSON.stringify(details),
        },
      }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/affiliates/payout]", err);
    return NextResponse.json({ error: "Failed to save payout details." }, { status: 502 });
  }
}
