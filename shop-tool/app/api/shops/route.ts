import { NextResponse } from "next/server";
import { z } from "zod";
import { getMyShop, getSession } from "@/lib/auth";
import { getPlanLimits } from "@/lib/planLimits";
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
  theme_id: z.enum(["minimal", "list", "boutique", "market", "gallery", "studio"]).optional(),
  accent_color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable()
    .optional(),
  font_id: z.enum(["inter", "playfair", "space-grotesk", "manrope"]).optional(),
  custom_domain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, "Enter a valid domain")
    .nullable()
    .optional(),
  directory_opt_in: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const shop = await getMyShop();
  if (!shop) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid shop details" }, { status: 400 });
  }

  const limits = getPlanLimits(shop.plan);
  const updates = parsed.data;

  if (updates.theme_id && !limits.themes.includes(updates.theme_id)) {
    return NextResponse.json(
      { error: `Upgrade to Starter or Pro to use the ${updates.theme_id} theme.` },
      { status: 402 }
    );
  }
  if (!limits.customBranding) {
    if (updates.accent_color) {
      return NextResponse.json({ error: "Custom accent colors need a Starter or Pro plan." }, { status: 402 });
    }
    if (updates.font_id && updates.font_id !== "inter") {
      return NextResponse.json({ error: "Custom font pairings need a Starter or Pro plan." }, { status: 402 });
    }
  }
  if (!limits.customDomain && updates.custom_domain) {
    return NextResponse.json({ error: "Custom domains need a Starter or Pro plan." }, { status: 402 });
  }

  const supabase = createSupabaseServerClient();
  // RLS ("owner can manage own shop") scopes this to the caller's shop already;
  // the .eq is defense in depth, not the only thing preventing cross-account writes.
  const { error } = await supabase.from("shops").update(updates).eq("owner_user_id", shop.owner_user_id);

  if (error) {
    const message =
      error.code === "23505" ? "That domain is already connected to another shop." : "Couldn't save changes";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
