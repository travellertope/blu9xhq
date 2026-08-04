import { NextResponse } from "next/server";
import { z } from "zod";
import { getMyShop } from "@/lib/auth";
import { getPlanLimits, getEffectivePlan } from "@/lib/planLimits";
import { activateReferralAndMaybeReward } from "@/lib/referral";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const variantSchema = z.object({
  name: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).min(1),
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).nullable().optional(),
  price: z.number().nonnegative(),
  compare_at_price: z.number().nonnegative().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  images: z.array(z.string().url()).max(4).default([]),
  variants: z.array(variantSchema).default([]),
  stock_qty: z.number().int().nonnegative().nullable().optional(),
});

export async function POST(request: Request) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Create a shop first" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product details" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("shop_id", shop.id);

  const effectivePlan = getEffectivePlan(shop);
  const { maxProducts } = getPlanLimits(effectivePlan);
  if ((count ?? 0) >= maxProducts) {
    return NextResponse.json(
      { error: `You've hit your ${effectivePlan} plan's ${maxProducts}-product limit. Upgrade to add more.` },
      { status: 402 }
    );
  }

  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.data, shop_id: shop.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't save product" }, { status: 400 });
  }

  // First product ever for this shop — the referral activation bar.
  if ((count ?? 0) === 0 && shop.referred_by_shop_id) {
    await activateReferralAndMaybeReward(shop.id).catch(() => {});
  }

  return NextResponse.json({ product: data });
}
