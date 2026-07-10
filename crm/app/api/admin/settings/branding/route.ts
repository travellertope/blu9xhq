import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { planAllows } from "@/lib/planLimits";
import { z } from "zod";

const HOSTNAME_RE = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;

const schema = z.object({
  logoUrl:      z.string().url("Enter a valid URL").optional().or(z.literal("")),
  accentColour: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex colour e.g. #2F5FE0").optional(),
  customDomain: z.string().toLowerCase().regex(HOSTNAME_RE, "Enter a valid domain, e.g. crm.yourcompany.com").optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.bluuhqRole !== "super_admin") {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  if (!planAllows(session.user.tenantPlan, "whiteLabel")) {
    return NextResponse.json({ error: "White-label requires a paid plan" }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation error" }, { status: 422 });
  }

  const { logoUrl, accentColour, customDomain } = parsed.data;
  const updates: Record<string, string | null> = {};
  if (logoUrl !== undefined) updates.logo_url = logoUrl || null;
  if (accentColour !== undefined) updates.accent_colour = accentColour;
  if (customDomain !== undefined) updates.custom_domain = customDomain || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("tenants")
    .update(updates)
    .eq("id", session.user.tenantId!);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "That domain is already in use by another tenant" }, { status: 409 });
    }
    console.error("[PATCH /api/admin/settings/branding]", error);
    return NextResponse.json({ error: "Failed to save branding" }, { status: 502 });
  }

  return NextResponse.json({ saved: true });
}

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("logo_url,accent_colour,custom_domain")
    .eq("id", session.user.tenantId!)
    .single();

  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    logoUrl:      data.logo_url ?? "",
    accentColour: data.accent_colour ?? "#2F5FE0",
    customDomain: data.custom_domain ?? "",
  });
}
