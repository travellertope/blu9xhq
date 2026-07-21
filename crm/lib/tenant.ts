import { createSupabaseAdminClient } from "@/lib/supabase/server";

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  logo_url: string | null;
  accent_colour: string | null;
  custom_domain: string | null;
  stripe_customer_id: string | null;
  billing_provider: string | null;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  paystack_email_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function getTenantById(id: string): Promise<TenantRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("tenants").select("*").eq("id", id).maybeSingle();
  return data as TenantRow | null;
}

export async function getTenantBySlug(slug: string): Promise<TenantRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("tenants").select("*").eq("slug", slug).maybeSingle();
  return data as TenantRow | null;
}

export async function getTenantByCustomDomain(domain: string): Promise<TenantRow | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("tenants").select("*").eq("custom_domain", domain).maybeSingle();
  return data as TenantRow | null;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
