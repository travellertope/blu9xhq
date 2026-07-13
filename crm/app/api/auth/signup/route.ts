import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  // EMERGENCY DISABLE: core data routes (clients, invoices, subscriptions,
  // communications, etc.) still read/write the single shared WordPress
  // backend with no tenant filtering — every tenant currently sees the same
  // data. Signup is disabled until that's fixed. See conversation/commit log
  // for context; re-enable only after the data layer is properly tenant-scoped.
  return NextResponse.json(
    { error: "Signups are temporarily unavailable. Please contact hello@bluuhq.com." },
    { status: 503 }
  );

  try {
    const body = await req.json();
    const name: string        = (body.name ?? "").trim();
    const email: string       = (body.email ?? "").trim().toLowerCase();
    const password: string    = body.password ?? "";
    const companyName: string = (body.companyName ?? "").trim();
    const rawSlug: string     = (body.slug ?? companyName).trim();

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const slug = slugify(rawSlug);
    if (!slug) {
      return NextResponse.json({ error: "Invalid company name — could not generate a URL slug" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check slug uniqueness
    const { data: existing } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "That URL is already taken. Try a different company name or edit the slug." },
        { status: 409 }
      );
    }

    // Create tenant (plan defaults to 'free' via schema)
    const { data: tenant, error: tenantErr } = await supabase
      .from("tenants")
      .insert({ name: companyName, slug, status: "active" })
      .select("id")
      .single();

    if (tenantErr || !tenant) {
      throw new Error(tenantErr?.message ?? "Failed to create tenant");
    }

    // Create Supabase auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
    });

    if (authErr || !authData.user) {
      await supabase.from("tenants").delete().eq("id", tenant.id);
      throw new Error(authErr?.message ?? "Failed to create user");
    }

    const userId = authData.user.id;

    // Link user to tenant as super_admin
    const { error: tmErr } = await supabase.from("team_members").insert({
      user_id:   userId,
      tenant_id: tenant.id,
      crm_role:  "super_admin",
      status:    "active",
    });

    if (tmErr) {
      await supabase.auth.admin.deleteUser(userId);
      await supabase.from("tenants").delete().eq("id", tenant.id);
      throw new Error(tmErr.message);
    }

    return NextResponse.json({ ok: true, slug, tenantId: tenant.id });
  } catch (err: any) {
    console.error("[POST /api/auth/signup]", err);
    return NextResponse.json({ error: err.message ?? "Signup failed" }, { status: 500 });
  }
}
