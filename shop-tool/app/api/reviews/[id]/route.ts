import { NextResponse } from "next/server";
import { z } from "zod";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  hidden: z.boolean(),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("shop_reviews")
    .update({ hidden: parsed.data.hidden })
    .eq("id", params.id)
    .eq("shop_id", shop.id);

  if (error) {
    return NextResponse.json({ error: "Couldn't update review" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("shop_reviews").delete().eq("id", params.id).eq("shop_id", shop.id);

  if (error) {
    return NextResponse.json({ error: "Couldn't delete review" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
