import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// No auth here on purpose — shoppers are never signed in. RLS's
// "anyone can create order intents" policy is the actual gate (it only
// requires the target shop to be active); this schema just keeps
// malformed payloads out.
const itemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
  variant: z.record(z.string(), z.string()).nullable(),
});

const createSchema = z.object({
  shop_id: z.string().uuid(),
  customer_name: z.string().trim().max(120).nullable().optional(),
  customer_phone: z.string().trim().max(30).nullable().optional(),
  items: z.array(itemSchema).min(1),
  subtotal: z.number().nonnegative(),
  delivery_zone_name: z.string().trim().max(80).nullable().optional(),
  delivery_fee: z.number().nonnegative().optional(),
  whatsapp_message: z.string().trim().min(1).max(4000),
  ref_code: z.string().trim().max(30).nullable().optional(),
});

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("order_intents").insert(parsed.data);

  if (error) {
    return NextResponse.json({ error: "Couldn't log order" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
