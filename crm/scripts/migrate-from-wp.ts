#!/usr/bin/env npx tsx
/**
 * BluuCRM — WordPress → Supabase migration script
 *
 * Imports all WP CPT data for one tenant into Supabase.
 * Idempotent: re-running skips rows that already have a matching wp_post_id.
 *
 * Usage (from repo root):
 *   cd crm && npx dotenv-cli -e .env.local -- npx tsx scripts/migrate-from-wp.ts
 *
 * Flags:
 *   --dry-run           Print what would be inserted, make no DB writes
 *   --tenant=<uuid>     Override tenant (default: 00000000-0000-0000-0000-000000000001)
 *   --skip-team         Skip team members
 *   --skip-services     Skip services
 *   --skip-clients      Skip clients + portal users
 *   --skip-subs         Skip subscriptions
 *   --skip-invoices     Skip invoices
 *   --skip-comms        Skip communications
 *   --skip-templates    Skip email templates
 *   --skip-sequences    Skip sequences + steps
 */

import { createClient } from "@supabase/supabase-js";
import { createDecipheriv } from "crypto";

// ─── Config ──────────────────────────────────────────────────────────────────

const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const wpBase = process.env.WORDPRESS_URL;
const wpUser = process.env.WP_APP_USERNAME;
const wpPass = process.env.WP_APP_PASSWORD;

if (!url || !srvKey || !wpBase || !wpUser || !wpPass) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, " +
    "WORDPRESS_URL, WP_APP_USERNAME, WP_APP_PASSWORD"
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN       = args.includes("--dry-run");
const SKIP_TEAM     = args.includes("--skip-team");
const SKIP_SERVICES = args.includes("--skip-services");
const SKIP_CLIENTS  = args.includes("--skip-clients");
const SKIP_SUBS     = args.includes("--skip-subs");
const SKIP_INVOICES = args.includes("--skip-invoices");
const SKIP_COMMS    = args.includes("--skip-comms");
const SKIP_TEMPLATES = args.includes("--skip-templates");
const SKIP_SEQUENCES = args.includes("--skip-sequences");
const tenantFlag = args.find((a) => a.startsWith("--tenant="));
const TENANT_ID = tenantFlag ? tenantFlag.split("=")[1] : DEFAULT_TENANT_ID;

const supabase = createClient(url!, srvKey!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── WP helpers ──────────────────────────────────────────────────────────────

const WP_AUTH = `Basic ${Buffer.from(`${wpUser}:${wpPass}`).toString("base64")}`;

async function wpFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${wpBase}/wp-json${path}`, {
    headers: { Authorization: WP_AUTH, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`WP ${res.status} ${path}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

async function wpFetchPaged<T>(
  cpt: string,
  extra: Record<string, string | number> = {}
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const qs = new URLSearchParams({
      per_page: "100",
      page: String(page),
      status: "publish",
      ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
    });
    const res = await fetch(`${wpBase}/wp-json/wp/v2/${cpt}?${qs}`, {
      headers: { Authorization: WP_AUTH },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`WP ${res.status} /wp/v2/${cpt}: ${text.slice(0, 200)}`);
    }
    const items = (await res.json()) as T[];
    all.push(...items);
    const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10);
    if (page >= totalPages) break;
    page++;
  }
  return all;
}

// ─── Decryption helper ───────────────────────────────────────────────────────

function tryDecrypt(value: string): string {
  if (!value) return value;
  const encKey = process.env.ENCRYPTION_KEY;
  if (!encKey) return value; // no key → store raw (may be encrypted)
  try {
    const [ivHex, encB64] = value.split(":");
    if (!ivHex || !encB64) return value; // not in expected format → plain text
    const keyBuf = Buffer.from(encKey, "hex");
    if (keyBuf.length !== 32) return value;
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv("aes-256-cbc", keyBuf, iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encB64, "base64")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  } catch {
    return value; // decryption failed → store as-is
  }
}

// ─── DB write helper ─────────────────────────────────────────────────────────

async function dbInsert(table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (rows.length === 0) return;
  if (DRY_RUN) {
    console.log(`  [dry-run] would insert ${rows.length} row(s) into ${table}`);
    return;
  }
  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(`${table} insert: ${error.message}`);
}

// ─── In-memory FK maps (wp_post_id / wp_user_id → supabase uuid) ─────────────

const serviceMap   = new Map<number, string>(); // WP post id → supabase uuid
const clientMap    = new Map<number, string>();
const subMap       = new Map<number, string>();
const templateMap  = new Map<number, string>();
const sequenceMap  = new Map<number, string>();
const teamUserMap  = new Map<number, string>(); // WP user id → supabase user uuid

async function loadExistingMaps() {
  const [services, clients, subs, templates, sequences, teamMembers] = await Promise.all([
    supabase.from("services").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("clients").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("subscriptions").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("email_templates").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("sequences").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("team_members").select("id,user_id,wp_user_id").eq("tenant_id", TENANT_ID),
  ]);

  for (const r of services.data ?? [])  if (r.wp_post_id) serviceMap.set(r.wp_post_id, r.id);
  for (const r of clients.data ?? [])   if (r.wp_post_id) clientMap.set(r.wp_post_id, r.id);
  for (const r of subs.data ?? [])      if (r.wp_post_id) subMap.set(r.wp_post_id, r.id);
  for (const r of templates.data ?? []) if (r.wp_post_id) templateMap.set(r.wp_post_id, r.id);
  for (const r of sequences.data ?? []) if (r.wp_post_id) sequenceMap.set(r.wp_post_id, r.id);
  for (const r of teamMembers.data ?? []) if (r.wp_user_id) teamUserMap.set(r.wp_user_id, r.user_id);
}

// ─── Step helpers ─────────────────────────────────────────────────────────────

function parseJsonArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

function parseTags(raw: unknown): string[] {
  if (!raw) return [];
  const str = String(raw);
  return str.split(",").map((t) => t.trim()).filter(Boolean);
}

function coerceBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "number")  return v !== 0;
  if (typeof v === "string")  return v === "1" || v === "true" || v === "yes";
  return false;
}

function safeDate(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d.toISOString().split("T")[0];
}

// ─── 1. Team members ──────────────────────────────────────────────────────────

interface WPUser {
  id: number;
  email: string;
  name: string;
  username: string;
  roles: string[];
}

const WP_ROLE_MAP: Record<string, string> = {
  administrator:    "super_admin",
  bluu_admin:       "super_admin",
  account_manager:  "account_manager",
  billing_manager:  "billing_manager",
  support_staff:    "support_staff",
  editor:           "viewer",
  subscriber:       "viewer",
};

async function migrateTeamMembers() {
  console.log("\n1/7  Team members…");
  const wpUsers = await wpFetch<WPUser[]>("/wp/v2/users?per_page=100&context=edit");
  const internal = wpUsers.filter((u) =>
    u.roles.some((r) => r in WP_ROLE_MAP) &&
    !u.roles.includes("bluu_client")
  );
  console.log(`     Found ${internal.length} internal WP user(s)`);

  let created = 0, skipped = 0;
  for (const wu of internal) {
    if (teamUserMap.has(wu.id)) { skipped++; continue; }
    if (!wu.email) { console.warn(`     ⚠ WP user ${wu.id} has no email — skip`); continue; }

    const crmRole = WP_ROLE_MAP[wu.roles.find((r) => r in WP_ROLE_MAP) ?? ""] ?? "viewer";

    let supabaseUserId: string;
    if (DRY_RUN) {
      supabaseUserId = `dry-run-${wu.id}`;
    } else {
      // Find or create Supabase auth user
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = listData?.users?.find((u) => u.email?.toLowerCase() === wu.email.toLowerCase());
      if (existing) {
        supabaseUserId = existing.id;
      } else {
        const { data: created_, error } = await supabase.auth.admin.createUser({
          email: wu.email,
          email_confirm: true,
          user_metadata: { full_name: wu.name },
        });
        if (error || !created_.user) {
          console.warn(`     ⚠ Could not create user ${wu.email}: ${error?.message}`);
          continue;
        }
        supabaseUserId = created_.user.id;
      }

      const { error: tmErr } = await supabase.from("team_members").upsert(
        { tenant_id: TENANT_ID, user_id: supabaseUserId, crm_role: crmRole, status: "active", wp_user_id: wu.id },
        { onConflict: "tenant_id,user_id" }
      );
      if (tmErr) { console.warn(`     ⚠ team_members upsert for ${wu.email}: ${tmErr.message}`); continue; }
    }

    teamUserMap.set(wu.id, supabaseUserId);
    created++;
  }
  console.log(`     ✓ ${created} created, ${skipped} already existed`);
}

// ─── 2. Services ──────────────────────────────────────────────────────────────

interface WPServicePost {
  id: number;
  title: { rendered: string };
  acf: {
    description?: string;
    category?: string;
    deliverables?: string;
    base_price?: number;
    currency?: string;
    billing_cycle?: string;
    is_active?: boolean;
  };
}

const CATEGORY_MAP: Record<string, string> = {
  branding: "branding", web_design: "web_design", web_development: "web_development",
  seo: "seo", social_media: "social_media", content: "content", ads: "ads",
  consulting: "consulting",
};

const BILLING_MAP: Record<string, string> = {
  one_time: "one_time", monthly: "monthly", quarterly: "quarterly", annually: "annually",
};

async function migrateServices() {
  console.log("\n2/7  Services…");
  const posts = await wpFetchPaged<WPServicePost>("bluu_service");
  console.log(`     Found ${posts.length} service(s)`);

  const toInsert: Record<string, unknown>[] = [];
  for (const p of posts) {
    if (serviceMap.has(p.id)) continue;
    const row = {
      tenant_id:     TENANT_ID,
      title:         p.title.rendered,
      description:   p.acf.description ?? null,
      category:      CATEGORY_MAP[p.acf.category ?? ""] ?? "other",
      base_price:    p.acf.base_price ?? 0,
      currency:      p.acf.currency?.toUpperCase() ?? "USD",
      billing_cycle: BILLING_MAP[p.acf.billing_cycle ?? ""] ?? "monthly",
      deliverables:  parseTags(p.acf.deliverables),
      is_active:     coerceBool(p.acf.is_active ?? true),
      wp_post_id:    p.id,
    };
    toInsert.push(row);
  }

  await dbInsert("services", toInsert);

  if (!DRY_RUN && toInsert.length > 0) {
    const { data } = await supabase
      .from("services")
      .select("id,wp_post_id")
      .eq("tenant_id", TENANT_ID)
      .in("wp_post_id", toInsert.map((r) => r.wp_post_id as number));
    for (const r of data ?? []) if (r.wp_post_id) serviceMap.set(r.wp_post_id, r.id);
  }

  console.log(`     ✓ ${toInsert.length} inserted, ${posts.length - toInsert.length} skipped`);
}

// ─── 3. Clients + portal users ────────────────────────────────────────────────

interface WPClientPost {
  id: number;
  date: string;
  title: { rendered: string };
  acf: {
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    company_name: string;
    company_website?: string;
    industry?: string;
    portal_email: string;
    wp_user_id?: number;
    status: string;
    notes?: string;
    tags?: string;
  };
}

const CLIENT_STATUS_MAP: Record<string, string> = {
  active: "active", inactive: "inactive", churned: "churned", onboarding: "onboarding",
};

async function migrateClients() {
  console.log("\n3/7  Clients…");
  const posts = await wpFetchPaged<WPClientPost>("bluu_client");
  console.log(`     Found ${posts.length} client(s)`);

  let created = 0, skipped = 0;
  for (const p of posts) {
    if (clientMap.has(p.id)) { skipped++; continue; }

    const email   = tryDecrypt(p.acf.contact_email);
    const phone   = tryDecrypt(p.acf.contact_phone);
    const company = p.acf.company_name || p.title.rendered;
    const contact = p.acf.contact_name || company;

    // Portal user — create Supabase auth user if portal_email exists
    let portalUserId: string | null = null;
    if (!DRY_RUN && p.acf.portal_email) {
      const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
      const existing = listData?.users?.find(
        (u) => u.email?.toLowerCase() === p.acf.portal_email.toLowerCase()
      );
      if (existing) {
        portalUserId = existing.id;
      } else {
        const { data: cr } = await supabase.auth.admin.createUser({
          email: p.acf.portal_email,
          email_confirm: true,
          user_metadata: { full_name: contact },
        });
        portalUserId = cr?.user?.id ?? null;
      }
    }

    const clientRow: Record<string, unknown> = {
      tenant_id:       TENANT_ID,
      company_name:    company,
      contact_name:    contact,
      contact_email:   email,
      contact_phone:   phone || null,
      company_website: p.acf.company_website || null,
      industry:        p.acf.industry || null,
      portal_user_id:  portalUserId,
      status:          CLIENT_STATUS_MAP[p.acf.status] ?? "onboarding",
      notes:           p.acf.notes || null,
      tags:            parseTags(p.acf.tags),
      wp_post_id:      p.id,
      created_at:      new Date(p.date).toISOString(),
    };

    if (DRY_RUN) {
      console.log(`  [dry-run] client: ${company} (wp#${p.id})`);
      clientMap.set(p.id, `dry-run-${p.id}`);
      created++;
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("clients")
      .insert(clientRow)
      .select("id")
      .single();
    if (error || !inserted) {
      console.warn(`     ⚠ client wp#${p.id} "${company}": ${error?.message}`);
      continue;
    }
    clientMap.set(p.id, inserted.id);

    // Create client_users row linking portal user → client
    if (portalUserId) {
      await supabase.from("client_users").upsert(
        { tenant_id: TENANT_ID, user_id: portalUserId, client_id: inserted.id, wp_user_id: p.acf.wp_user_id ?? null },
        { onConflict: "tenant_id,user_id" }
      );
    }

    created++;
  }
  console.log(`     ✓ ${created} created, ${skipped} already existed`);
}

// ─── 4. Subscriptions ─────────────────────────────────────────────────────────

interface WPSubscriptionPost {
  id: number;
  date: string;
  acf: {
    client_id: number;
    service_id: number;
    status: string;
    amount: number;
    currency: string;
    billing_cycle: string;
    next_billing_date?: string;
    start_date?: string;
    end_date?: string;
    payment_gateway?: string;
    gateway_subscription_id?: string;
    notes?: string;
  };
}

const SUB_STATUS_MAP: Record<string, string> = {
  active: "active", paused: "paused", cancelled: "cancelled",
  past_due: "past_due", trialing: "trialing",
};

const GW_MAP: Record<string, string> = {
  stripe: "stripe", paystack: "paystack", manual: "manual",
};

async function migrateSubscriptions() {
  console.log("\n4/7  Subscriptions…");
  const posts = await wpFetchPaged<WPSubscriptionPost>("bluu_subscription");
  console.log(`     Found ${posts.length} subscription(s)`);

  const toInsert: Record<string, unknown>[] = [];
  for (const p of posts) {
    if (subMap.has(p.id)) continue;
    const clientId  = clientMap.get(p.acf.client_id);
    const serviceId = serviceMap.get(p.acf.service_id);
    if (!clientId || !serviceId) {
      console.warn(`     ⚠ sub wp#${p.id}: missing client(${p.acf.client_id}) or service(${p.acf.service_id}) — skip`);
      continue;
    }
    toInsert.push({
      tenant_id:               TENANT_ID,
      client_id:               clientId,
      service_id:              serviceId,
      status:                  SUB_STATUS_MAP[p.acf.status] ?? "active",
      amount:                  p.acf.amount ?? 0,
      currency:                p.acf.currency?.toUpperCase() ?? "USD",
      billing_cycle:           BILLING_MAP[p.acf.billing_cycle ?? ""] ?? "monthly",
      next_billing_date:       safeDate(p.acf.next_billing_date),
      start_date:              safeDate(p.acf.start_date) ?? new Date(p.date).toISOString().split("T")[0],
      end_date:                safeDate(p.acf.end_date),
      payment_gateway:         GW_MAP[p.acf.payment_gateway ?? ""] ?? "manual",
      gateway_subscription_id: p.acf.gateway_subscription_id || null,
      notes:                   p.acf.notes || null,
      wp_post_id:              p.id,
      created_at:              new Date(p.date).toISOString(),
    });
  }

  await dbInsert("subscriptions", toInsert);

  if (!DRY_RUN && toInsert.length > 0) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id,wp_post_id")
      .eq("tenant_id", TENANT_ID)
      .in("wp_post_id", toInsert.map((r) => r.wp_post_id as number));
    for (const r of data ?? []) if (r.wp_post_id) subMap.set(r.wp_post_id, r.id);
  }

  console.log(`     ✓ ${toInsert.length} inserted, ${posts.length - toInsert.length} skipped`);
}

// ─── 5. Invoices ──────────────────────────────────────────────────────────────

interface WPInvoicePost {
  id: number;
  date: string;
  acf: {
    inv_client: number;
    inv_subscription?: number;
    inv_number: string;
    inv_line_items: string;
    inv_total: number;
    inv_currency: string;
    inv_status: string;
    inv_due_date: string;
    inv_issued_date: string;
    inv_paid_at?: string;
    inv_payment_method?: string;
    inv_payment_gateway_ref?: string;
    inv_notes?: string;
    inv_pdf_url?: string;
  };
}

const INV_STATUS_MAP: Record<string, string> = {
  draft: "draft", sent: "sent", paid: "paid", overdue: "overdue", void: "void",
};

async function migrateInvoices() {
  console.log("\n5/7  Invoices…");
  const posts = await wpFetchPaged<WPInvoicePost>("bluu_invoice");
  console.log(`     Found ${posts.length} invoice(s)`);

  const toInsert: Record<string, unknown>[] = [];
  const alreadyPresent = new Set<number>();

  if (!DRY_RUN) {
    const { data } = await supabase
      .from("invoices")
      .select("wp_post_id")
      .eq("tenant_id", TENANT_ID)
      .not("wp_post_id", "is", null);
    for (const r of data ?? []) alreadyPresent.add(r.wp_post_id);
  }

  for (const p of posts) {
    if (alreadyPresent.has(p.id)) continue;
    const clientId = clientMap.get(p.acf.inv_client);
    if (!clientId) {
      console.warn(`     ⚠ invoice wp#${p.id}: missing client(${p.acf.inv_client}) — skip`);
      continue;
    }
    const lineItems = parseJsonArray(p.acf.inv_line_items);
    const subId = p.acf.inv_subscription ? subMap.get(p.acf.inv_subscription) ?? null : null;
    toInsert.push({
      tenant_id:         TENANT_ID,
      client_id:         clientId,
      subscription_id:   subId,
      invoice_number:    p.acf.inv_number || `MIG-${p.id}`,
      line_items:        lineItems,
      subtotal:          p.acf.inv_total ?? 0,
      total:             p.acf.inv_total ?? 0,
      currency:          p.acf.inv_currency?.toUpperCase() ?? "USD",
      status:            INV_STATUS_MAP[p.acf.inv_status] ?? "draft",
      issued_date:       safeDate(p.acf.inv_issued_date) ?? new Date(p.date).toISOString().split("T")[0],
      due_date:          safeDate(p.acf.inv_due_date) ?? new Date(p.date).toISOString().split("T")[0],
      paid_date:         safeDate(p.acf.inv_paid_at),
      payment_gateway:   GW_MAP[p.acf.inv_payment_method ?? ""] ?? null,
      gateway_payment_id: p.acf.inv_payment_gateway_ref || null,
      notes:             p.acf.inv_notes || null,
      pdf_url:           p.acf.inv_pdf_url || null,
      wp_post_id:        p.id,
      created_at:        new Date(p.date).toISOString(),
    });
  }

  await dbInsert("invoices", toInsert);
  console.log(`     ✓ ${toInsert.length} inserted, ${posts.length - toInsert.length} skipped`);
}

// ─── 6. Communications ────────────────────────────────────────────────────────

interface WPCommPost {
  id: number;
  date: string;
  acf: {
    comm_direction: string;
    comm_channel: string;
    comm_type: string;
    comm_subject: string;
    comm_content: string;
    comm_occurred_at: string;
    comm_client: number;
    comm_logged_by: number;
    comm_mood?: string;
    comm_mood_source?: string;
    comm_mood_reasoning?: string;
    comm_red_flags?: string;
    comm_follow_up_needed?: unknown;
    comm_follow_up_due?: string;
    comm_follow_up_completed?: unknown;
  };
}

const DIRECTION_VALS = new Set(["inbound", "outbound", "internal"]);
const CHANNEL_VALS   = new Set(["email", "whatsapp", "phone", "meeting", "sms", "other", "system"]);
const COMM_TYPE_VALS = new Set(["manual", "email", "system"]);
const MOOD_VALS      = new Set(["positive", "neutral", "mixed", "concerned", "at_risk"]);
const MOOD_SRC_VALS  = new Set(["ai_accepted", "ai_overridden", "manual"]);

async function migrateCommunications() {
  console.log("\n6/7  Communications…");
  const posts = await wpFetchPaged<WPCommPost>("bluu_communication");
  console.log(`     Found ${posts.length} communication(s)`);

  const alreadyPresent = new Set<number>();
  if (!DRY_RUN) {
    const { data } = await supabase
      .from("communications")
      .select("wp_post_id")
      .eq("tenant_id", TENANT_ID)
      .not("wp_post_id", "is", null);
    for (const r of data ?? []) alreadyPresent.add(r.wp_post_id);
  }

  const toInsert: Record<string, unknown>[] = [];
  for (const p of posts) {
    if (alreadyPresent.has(p.id)) continue;
    const clientId = clientMap.get(p.acf.comm_client);
    if (!clientId) {
      console.warn(`     ⚠ comm wp#${p.id}: missing client(${p.acf.comm_client}) — skip`);
      continue;
    }
    const loggedBy = teamUserMap.get(p.acf.comm_logged_by) ?? null;
    const redFlags = (() => {
      try { return JSON.parse(p.acf.comm_red_flags ?? "[]") as string[]; } catch { return []; }
    })();
    toInsert.push({
      tenant_id:          TENANT_ID,
      client_id:          clientId,
      direction:          DIRECTION_VALS.has(p.acf.comm_direction) ? p.acf.comm_direction : "outbound",
      channel:            CHANNEL_VALS.has(p.acf.comm_channel) ? p.acf.comm_channel : "other",
      comm_type:          COMM_TYPE_VALS.has(p.acf.comm_type) ? p.acf.comm_type : "manual",
      subject:            p.acf.comm_subject || null,
      body:               p.acf.comm_content || "(empty)",
      occurred_at:        new Date(p.acf.comm_occurred_at || p.date).toISOString(),
      mood:               MOOD_VALS.has(p.acf.comm_mood ?? "") ? p.acf.comm_mood : null,
      mood_source:        MOOD_SRC_VALS.has(p.acf.comm_mood_source ?? "") ? p.acf.comm_mood_source : null,
      mood_reasoning:     p.acf.comm_mood_reasoning || null,
      red_flags:          redFlags,
      follow_up_needed:   coerceBool(p.acf.comm_follow_up_needed),
      follow_up_due:      safeDate(p.acf.comm_follow_up_due),
      follow_up_completed: coerceBool(p.acf.comm_follow_up_completed),
      logged_by:          loggedBy,
      wp_post_id:         p.id,
      created_at:         new Date(p.date).toISOString(),
    });
  }

  await dbInsert("communications", toInsert);
  console.log(`     ✓ ${toInsert.length} inserted, ${posts.length - toInsert.length} skipped`);
}

// ─── 7. Email templates + sequences ──────────────────────────────────────────

interface WPEmailTemplatePost {
  id: number;
  title: { rendered: string };
  date: string;
  acf: {
    subject: string;
    body_html: string;
    body_text?: string;
    type: string;
    merge_tags?: string;
  };
}

const TMPL_TYPE_VALS = new Set(["onboarding","invoice","follow_up","report","general","portal_invite"]);

async function migrateEmailTemplates() {
  console.log("\n7a/7  Email templates…");
  const posts = await wpFetchPaged<WPEmailTemplatePost>("bluu_email_template");
  console.log(`      Found ${posts.length} template(s)`);

  const toInsert: Record<string, unknown>[] = [];
  for (const p of posts) {
    if (templateMap.has(p.id)) continue;
    const mergeTags = parseTags(p.acf.merge_tags);
    toInsert.push({
      tenant_id:  TENANT_ID,
      title:      p.title.rendered,
      subject:    p.acf.subject || "(no subject)",
      body_html:  p.acf.body_html || "",
      body_text:  p.acf.body_text || null,
      tmpl_type:  TMPL_TYPE_VALS.has(p.acf.type) ? p.acf.type : "general",
      merge_tags: mergeTags,
      wp_post_id: p.id,
      created_at: new Date(p.date).toISOString(),
    });
  }

  await dbInsert("email_templates", toInsert);

  if (!DRY_RUN && toInsert.length > 0) {
    const { data } = await supabase
      .from("email_templates")
      .select("id,wp_post_id")
      .eq("tenant_id", TENANT_ID)
      .in("wp_post_id", toInsert.map((r) => r.wp_post_id as number));
    for (const r of data ?? []) if (r.wp_post_id) templateMap.set(r.wp_post_id, r.id);
  }
  console.log(`      ✓ ${toInsert.length} inserted, ${posts.length - toInsert.length} skipped`);
}

interface WPSequencePost {
  id: number;
  title: { rendered: string };
  date: string;
  acf: {
    trigger: string;
    is_active: unknown;
    steps?: Array<{
      step_number: number;
      delay_days: number;
      email_template_id?: number;
    }>;
  };
}

const SEQ_TRIGGER_VALS = new Set([
  "client_onboarding","invoice_sent","invoice_overdue","subscription_expiring","manual",
]);

async function migrateSequences() {
  console.log("\n7b/7  Sequences…");
  const posts = await wpFetchPaged<WPSequencePost>("bluu_sequence");
  console.log(`      Found ${posts.length} sequence(s)`);

  for (const p of posts) {
    if (sequenceMap.has(p.id)) continue;
    const seqRow = {
      tenant_id:  TENANT_ID,
      title:      p.title.rendered,
      trigger:    SEQ_TRIGGER_VALS.has(p.acf.trigger) ? p.acf.trigger : "manual",
      is_active:  coerceBool(p.acf.is_active),
      wp_post_id: p.id,
      created_at: new Date(p.date).toISOString(),
    };

    if (DRY_RUN) {
      console.log(`  [dry-run] sequence: ${p.title.rendered} (wp#${p.id})`);
      sequenceMap.set(p.id, `dry-run-${p.id}`);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("sequences")
      .insert(seqRow)
      .select("id")
      .single();
    if (error || !inserted) {
      console.warn(`      ⚠ sequence wp#${p.id}: ${error?.message}`); continue;
    }
    sequenceMap.set(p.id, inserted.id);

    // Insert steps
    const steps = parseJsonArray(p.acf.steps) as WPSequencePost["acf"]["steps"];
    if (steps && steps.length > 0) {
      const stepRows = steps
        .filter((s) => s.email_template_id && templateMap.has(s.email_template_id))
        .map((s) => ({
          sequence_id:       inserted.id,
          tenant_id:         TENANT_ID,
          step_number:       s.step_number,
          delay_days:        s.delay_days ?? 0,
          email_template_id: templateMap.get(s.email_template_id!)!,
        }));
      if (stepRows.length > 0) {
        const { error: stepErr } = await supabase.from("sequence_steps").insert(stepRows);
        if (stepErr) console.warn(`      ⚠ steps for seq ${inserted.id}: ${stepErr.message}`);
      }
    }
  }
  console.log(`      ✓ done`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔄  BluuCRM WP → Supabase migration");
  console.log(`   Supabase: ${url}`);
  console.log(`   WP:       ${wpBase}`);
  console.log(`   Tenant:   ${TENANT_ID}`);
  if (DRY_RUN) console.log("   Mode:     DRY RUN (no writes)");
  console.log();

  console.log("Loading existing rows for idempotency…");
  await loadExistingMaps();
  console.log(
    `  services=${serviceMap.size}  clients=${clientMap.size}  subs=${subMap.size}  ` +
    `templates=${templateMap.size}  sequences=${sequenceMap.size}  team=${teamUserMap.size}`
  );

  if (!SKIP_TEAM)      await migrateTeamMembers();
  if (!SKIP_SERVICES)  await migrateServices();
  if (!SKIP_CLIENTS)   await migrateClients();
  if (!SKIP_SUBS)      await migrateSubscriptions();
  if (!SKIP_INVOICES)  await migrateInvoices();
  if (!SKIP_COMMS)     await migrateCommunications();
  if (!SKIP_TEMPLATES) await migrateEmailTemplates();
  if (!SKIP_SEQUENCES) await migrateSequences();

  console.log("\n✅  Migration complete.\n");
}

main().catch((err) => {
  console.error("\n❌  Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
