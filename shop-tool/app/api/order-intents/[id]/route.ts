import { NextResponse } from "next/server";
import { z } from "zod";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  status: z.enum(["new", "contacted", "confirmed", "fulfilled", "cancelled"]),
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("order_intents")
    .update({ status: parsed.data.status })
    .eq("id", params.id)
    .eq("shop_id", shop.id);

  if (error) {
    return NextResponse.json({ error: "Couldn't update order" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
