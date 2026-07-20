import { NextResponse } from "next/server";
import { z } from "zod";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const variantSchema = z.object({
  name: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).min(1),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  price: z.number().nonnegative().optional(),
  compare_at_price: z.number().nonnegative().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  images: z.array(z.string().url()).max(4).optional(),
  variants: z.array(variantSchema).optional(),
  stock_qty: z.number().int().nonnegative().nullable().optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product details" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", params.id)
    .eq("shop_id", shop.id);

  if (error) {
    return NextResponse.json({ error: "Couldn't save changes" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", params.id).eq("shop_id", shop.id);

  if (error) {
    return NextResponse.json({ error: "Couldn't delete product" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
