import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const updateSchema = z
  .object({
    plan: z.enum(["free", "starter", "pro"]).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "No changes provided");

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("shops")
    .update({
      ...parsed.data,
      // Comping a plan this way mirrors what the billing webhooks do on a
      // real upgrade/downgrade — branding stays tied to plan, not to how
      // the plan got set.
      ...(parsed.data.plan ? { branding_hidden: parsed.data.plan !== "free" } : {}),
    })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Couldn't update shop" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
