import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// No auth here on purpose — shoppers are never signed in. RLS's "anyone can
// create reviews" policy is the actual gate (it only requires the target
// shop to be active); this schema just keeps malformed payloads out.
const createSchema = z.object({
  shop_id: z.string().uuid(),
  reviewer_name: z.string().trim().min(1).max(80),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).nullable().optional(),
});

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("shop_reviews")
    .insert({
      shop_id: parsed.data.shop_id,
      reviewer_name: parsed.data.reviewer_name,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Couldn't save review" }, { status: 400 });
  }
  return NextResponse.json({ review: data });
}
