import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  shop_id: z.string().uuid(),
  event_type: z.enum(["view", "add_to_cart", "checkout_click"]),
  product_id: z.string().uuid().nullable().optional(),
  session_id: z.string().trim().min(1).max(100),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    // Analytics is best-effort — a bad beacon shouldn't surface as an error to the shopper.
    return NextResponse.json({ ok: true });
  }

  const supabase = createSupabaseServerClient();
  await supabase.from("analytics_events").insert(parsed.data);

  return NextResponse.json({ ok: true });
}
