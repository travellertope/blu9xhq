import { NextResponse } from "next/server";
import { z } from "zod";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  sort_order: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("categories")
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
  // Products in this category aren't deleted — category_id just falls back
  // to null (schema: `on delete set null`), so they simply become
  // uncategorized instead of disappearing.
  const { error } = await supabase.from("categories").delete().eq("id", params.id).eq("shop_id", shop.id);

  if (error) {
    return NextResponse.json({ error: "Couldn't delete category" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
