import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/utils";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(40),
  whatsapp_number: z.string().trim().min(6).max(20),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid shop details" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_user_id", session.userId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "You already have a shop" }, { status: 409 });
  }

  const slug = toSlug(parsed.data.slug) || toSlug(parsed.data.name);
  const { error } = await supabase.from("shops").insert({
    owner_user_id: session.userId,
    slug,
    name: parsed.data.name,
    whatsapp_number: parsed.data.whatsapp_number,
  });

  if (error) {
    const message = error.code === "23505" ? "That shop link is taken — try another." : "Couldn't create your shop";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  tagline: z.string().trim().max(160).nullable().optional(),
  whatsapp_number: z.string().trim().min(6).max(20).optional(),
  currency: z.string().trim().length(3).optional(),
  delivery_info: z.string().trim().max(2000).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  cover_url: z.string().url().nullable().optional(),
  instagram_url: z.string().trim().url().nullable().optional(),
  tiktok_url: z.string().trim().url().nullable().optional(),
  facebook_url: z.string().trim().url().nullable().optional(),
  x_url: z.string().trim().url().nullable().optional(),
  theme_id: z.enum(["minimal", "boutique", "market"]).optional(),
  accent_color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
  font_id: z.enum(["inter", "playfair", "space-grotesk", "manrope"]).optional(),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid shop details" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  // RLS ("owner can manage own shop") scopes this to the caller's shop already;
  // the .eq is defense in depth, not the only thing preventing cross-account writes.
  const { error } = await supabase.from("shops").update(parsed.data).eq("owner_user_id", session.userId);

  if (error) {
    return NextResponse.json({ error: "Couldn't save changes" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
