import { NextResponse } from "next/server";
import { z } from "zod";
import { getMyShop } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name: z.string().trim().min(1).max(80),
  fee: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid delivery zone" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("delivery_zones")
    .insert({ shop_id: shop.id, name: parsed.data.name, fee: parsed.data.fee })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't save delivery zone" }, { status: 400 });
  }
  return NextResponse.json({ zone: data });
}
