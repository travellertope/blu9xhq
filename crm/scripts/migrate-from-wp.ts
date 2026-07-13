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
 *   --skip-files        Skip file metadata
 *   --skip-templates    Skip email templates
 *   --skip-sequences    Skip sequences + steps
 *   --skip-tickets      Skip tickets + replies + status log + attachments
 *   --skip-settings     Skip bank-details/settings
 */

import { createClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { WebSocket } from "ws";

// @supabase/supabase-js constructs a realtime client eagerly, which needs a
// global WebSocket — only native on Node 22+. Polyfill it for older Node.
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = WebSocket;
}

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
const SKIP_FILES     = args.includes("--skip-files");
const SKIP_TEMPLATES = args.includes("--skip-templates");
const SKIP_SEQUENCES = args.includes("--skip-sequences");
const SKIP_TICKETS   = args.includes("--skip-tickets");
const SKIP_SETTINGS  = args.includes("--skip-settings");
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

function tryEncrypt(plaintext: string): string {
  if (!plaintext) return plaintext;
  const encKey = process.env.ENCRYPTION_KEY;
  if (!encKey) return plaintext; // no key → store raw plaintext
  try {
    const keyBuf = Buffer.from(encKey, "hex");
    if (keyBuf.length !== 32) return plaintext;
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", keyBuf, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("base64")}`;
  } catch {
    return plaintext;
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
const portalUserMap = new Map<number, string>(); // WP user id → supabase auth user uuid (client portal)
const ticketMap    = new Map<number, string>();

async function loadExistingMaps() {
  const [services, clients, subs, templates, sequences, teamMembers, clientUsers, tickets] = await Promise.all([
    supabase.from("services").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("clients").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("subscriptions").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("email_templates").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("sequences").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
    supabase.from("team_members").select("id,user_id,wp_user_id").eq("tenant_id", TENANT_ID),
    supabase.from("client_users").select("id,user_id,wp_user_id").eq("tenant_id", TENANT_ID),
    supabase.from("tickets").select("id,wp_post_id").eq("tenant_id", TENANT_ID),
  ]);

  for (const r of services.data ?? [])  if (r.wp_post_id) serviceMap.set(r.wp_post_id, r.id);
  for (const r of clients.data ?? [])   if (r.wp_post_id) clientMap.set(r.wp_post_id, r.id);
  for (const r of subs.data ?? [])      if (r.wp_post_id) subMap.set(r.wp_post_id, r.id);
  for (const r of templates.data ?? []) if (r.wp_post_id) templateMap.set(r.wp_post_id, r.id);
  for (const r of sequences.data ?? []) if (r.wp_post_id) sequenceMap.set(r.wp_post_id, r.id);
  for (const r of teamMembers.data ?? []) if (r.wp_user_id) teamUserMap.set(r.wp_user_id, r.user_id);
  for (const r of clientUsers.data ?? []) if (r.wp_user_id) portalUserMap.set(r.wp_user_id, r.user_id);
  for (const r of tickets.data ?? [])    if (r.wp_post_id) ticketMap.set(r.wp_post_id, r.id);
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

function safeTimestamp(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? null : d.toISOString();
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
  console.log("\n1/10  Team members…");
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
  console.log("\n2/10  Services…");
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
    health_status?: string;
    health_note?: string;
    health_overridden_at?: string;
    health_auto_score?: string;
    active_subscription_count?: number;
    last_contacted_at?: string;
    portal_invited_at?: string;
  };
}

const CLIENT_STATUS_MAP: Record<string, string> = {
  active: "active", inactive: "inactive", churned: "churned", onboarding: "onboarding",
};

async function migrateClients() {
  console.log("\n3/10  Clients…");
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
      if (portalUserId && p.acf.wp_user_id) {
        portalUserMap.set(p.acf.wp_user_id, portalUserId);
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
      portal_email:              p.acf.portal_email || null,
      health_status:             p.acf.health_status || null,
      health_note:               p.acf.health_note || null,
      health_overridden_at:      safeTimestamp(p.acf.health_overridden_at),
      health_auto_score:         p.acf.health_auto_score || null,
      active_subscription_count: p.acf.active_subscription_count ?? 0,
      last_contacted_at:         safeTimestamp(p.acf.last_contacted_at),
      portal_invited_at:         safeTimestamp(p.acf.portal_invited_at),
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
  console.log("\n4/10  Subscriptions…");
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
  console.log("\n5/10  Invoices…");
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
  console.log("\n6/10  Communications…");
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

// ─── 7. Files (metadata only — objects already live in R2) ──────────────────

interface WPFilePost {
  id: number;
  date: string;
  acf: {
    file_client: number;
    file_r2_key: string;
    file_original_name: string;
    file_mime_type: string;
    file_size: number;
    file_category: string;
    file_description?: string;
    file_visibility: string;
    file_uploaded_by: number;
    file_subscription_id?: number;
  };
}

// WP category values → Supabase files.category check constraint values
const FILE_CATEGORY_MAP: Record<string, string> = {
  contract: "contract",
  deliverable: "deliverable",
  invoice: "invoice_attachment",
  brand_asset: "asset",
  brief: "brief",
  general: "other",
};

async function migrateFiles() {
  console.log("\n7/10  Files…");
  const posts = await wpFetchPaged<WPFilePost>("bluu_file");
  console.log(`      Found ${posts.length} file(s)`);

  const alreadyPresent = new Set<number>();
  if (!DRY_RUN) {
    const { data } = await supabase
      .from("files")
      .select("wp_post_id")
      .eq("tenant_id", TENANT_ID)
      .not("wp_post_id", "is", null);
    for (const r of data ?? []) alreadyPresent.add(r.wp_post_id);
  }

  const toInsert: Record<string, unknown>[] = [];
  for (const p of posts) {
    if (alreadyPresent.has(p.id)) continue;
    const clientId = clientMap.get(p.acf.file_client);
    if (!clientId) {
      console.warn(`      ⚠ file wp#${p.id}: missing client(${p.acf.file_client}) — skip`);
      continue;
    }
    const uploadedBy = teamUserMap.get(p.acf.file_uploaded_by) ?? null;
    const subscriptionId = p.acf.file_subscription_id
      ? subMap.get(p.acf.file_subscription_id) ?? null
      : null;
    toInsert.push({
      tenant_id:            TENANT_ID,
      client_id:            clientId,
      subscription_id:      subscriptionId,
      title:                p.acf.file_original_name || `File ${p.id}`,
      description:          p.acf.file_description || null,
      category:             FILE_CATEGORY_MAP[p.acf.file_category] ?? "other",
      r2_key:               p.acf.file_r2_key,
      r2_bucket:            process.env.R2_BUCKET_NAME ?? "",
      mime_type:            p.acf.file_mime_type,
      file_size:            p.acf.file_size ?? 0,
      original_name:        p.acf.file_original_name,
      is_visible_to_client: p.acf.file_visibility === "shared",
      uploaded_by:          uploadedBy,
      wp_post_id:           p.id,
      created_at:           new Date(p.date).toISOString(),
    });
  }

  await dbInsert("files", toInsert);
  console.log(`      ✓ ${toInsert.length} inserted, ${posts.length - toInsert.length} skipped`);
}

// ─── 8. Email templates + sequences ──────────────────────────────────────────

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
  console.log("\n8a/10  Email templates…");
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
  console.log("\n8b/10  Sequences…");
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

// ─── 9. Tickets + replies + status log + attachments ─────────────────────────

interface WPTicketPost {
  id: number;
  date: string;
  acf: {
    tkt_number: string;
    tkt_client: number;
    tkt_submitted_by: number;
    tkt_assigned_to?: number;
    tkt_category: string;
    tkt_priority: string;
    tkt_status: string;
    tkt_retainer_id?: number;
    tkt_sla_response_target: string;
    tkt_sla_resolve_target: string;
    tkt_sla_alerted_at?: string;
    tkt_first_response_at?: string;
    tkt_resolved_at?: string;
    tkt_closed_at?: string;
  };
}

interface WPTicketReplyItem {
  id: number;
  reply_ticket_id: number;
  reply_author_id: number;
  reply_body: string;
  reply_type: string;
  date: string;
}

interface WPTicketStatusLogPost {
  id: number;
  acf: {
    log_ticket_id: number;
    log_changed_by: number;
    log_from_status?: string;
    log_to_status: string;
    log_note?: string;
    log_changed_at: string;
  };
}

interface WPTicketAttachmentItem {
  id: number;
  att_ticket_id: number;
  att_reply_id: number | null;
  att_uploaded_by: number;
  att_file_name: string;
  att_file_url: string; // misleadingly named in WP — actually the R2 object key
  att_file_type: string;
  att_file_size_kb: number;
  date: string;
}

const TKT_CATEGORY_VALS = new Set(["content_feedback", "delivery_query", "retainer_question", "technical_issue", "billing", "other"]);
const TKT_PRIORITY_VALS = new Set(["low", "normal", "high", "urgent"]);
const TKT_STATUS_VALS   = new Set(["open", "in_progress", "awaiting_client", "awaiting_internal", "resolved", "closed"]);

function resolveWpUser(wpUserId: number | undefined): string | null {
  if (!wpUserId) return null;
  return portalUserMap.get(wpUserId) ?? teamUserMap.get(wpUserId) ?? null;
}

async function migrateTickets() {
  console.log("\n9/10  Tickets…");
  const posts = await wpFetchPaged<WPTicketPost>("bluu_ticket");
  console.log(`      Found ${posts.length} ticket(s)`);

  console.log("      Fetching status log entries…");
  const allStatusLogs = await wpFetchPaged<WPTicketStatusLogPost>("bluu_ticket_status_log");
  const statusLogsByTicket = new Map<number, WPTicketStatusLogPost[]>();
  for (const log of allStatusLogs) {
    const list = statusLogsByTicket.get(log.acf.log_ticket_id) ?? [];
    list.push(log);
    statusLogsByTicket.set(log.acf.log_ticket_id, list);
  }

  let ticketsCreated = 0, ticketsSkipped = 0, repliesCreated = 0, logsCreated = 0, attachmentsCreated = 0;

  for (const p of posts) {
    if (ticketMap.has(p.id)) { ticketsSkipped++; continue; }
    const clientId = clientMap.get(p.acf.tkt_client);
    if (!clientId) {
      console.warn(`      ⚠ ticket wp#${p.id}: missing client(${p.acf.tkt_client}) — skip`);
      continue;
    }

    const ticketRow = {
      tenant_id:            TENANT_ID,
      client_id:            clientId,
      submitted_by:         resolveWpUser(p.acf.tkt_submitted_by),
      assigned_to:          resolveWpUser(p.acf.tkt_assigned_to),
      tkt_number:           p.acf.tkt_number || `MIG-${p.id}`,
      category:             TKT_CATEGORY_VALS.has(p.acf.tkt_category) ? p.acf.tkt_category : "other",
      priority:             TKT_PRIORITY_VALS.has(p.acf.tkt_priority) ? p.acf.tkt_priority : "normal",
      status:               TKT_STATUS_VALS.has(p.acf.tkt_status) ? p.acf.tkt_status : "open",
      retainer_id:          p.acf.tkt_retainer_id ? subMap.get(p.acf.tkt_retainer_id) ?? null : null,
      sla_response_target:  safeTimestamp(p.acf.tkt_sla_response_target),
      sla_resolve_target:   safeTimestamp(p.acf.tkt_sla_resolve_target),
      sla_alerted_at:       safeTimestamp(p.acf.tkt_sla_alerted_at),
      first_response_at:    safeTimestamp(p.acf.tkt_first_response_at),
      resolved_at:          safeTimestamp(p.acf.tkt_resolved_at),
      closed_at:            safeTimestamp(p.acf.tkt_closed_at),
      wp_post_id:           p.id,
      created_at:           new Date(p.date).toISOString(),
    };

    if (DRY_RUN) {
      console.log(`  [dry-run] ticket: ${ticketRow.tkt_number} (wp#${p.id})`);
      ticketMap.set(p.id, `dry-run-${p.id}`);
      ticketsCreated++;
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("tickets")
      .insert(ticketRow)
      .select("id")
      .single();
    if (error || !inserted) {
      console.warn(`      ⚠ ticket wp#${p.id}: ${error?.message}`);
      continue;
    }
    ticketMap.set(p.id, inserted.id);
    ticketsCreated++;

    // Replies (per-ticket custom endpoint — no bulk listing available)
    const replyMap = new Map<number, string>(); // WP reply post id → supabase ticket_replies.id
    const replies = await wpFetch<WPTicketReplyItem[]>(`/bluuhq/v1/ticket-replies?ticket_id=${p.id}`).catch(() => []);
    for (const r of replies) {
      const { data: replyRow, error: replyErr } = await supabase
        .from("ticket_replies")
        .insert({
          ticket_id:  inserted.id,
          tenant_id:  TENANT_ID,
          author_id:  resolveWpUser(r.reply_author_id),
          body:       r.reply_body || "",
          reply_type: r.reply_type === "internal_note" ? "internal_note" : "reply",
          wp_post_id: r.id,
          created_at: new Date(r.date).toISOString(),
        })
        .select("id")
        .single();
      if (replyErr || !replyRow) {
        console.warn(`      ⚠ reply wp#${r.id} for ticket wp#${p.id}: ${replyErr?.message}`);
        continue;
      }
      replyMap.set(r.id, replyRow.id);
      repliesCreated++;
    }

    // Status log
    for (const log of statusLogsByTicket.get(p.id) ?? []) {
      const { error: logErr } = await supabase.from("ticket_status_log").insert({
        ticket_id:   inserted.id,
        tenant_id:   TENANT_ID,
        changed_by:  resolveWpUser(log.acf.log_changed_by),
        from_status: log.acf.log_from_status || null,
        to_status:   log.acf.log_to_status,
        note:        log.acf.log_note || null,
        changed_at:  safeTimestamp(log.acf.log_changed_at) ?? new Date().toISOString(),
        wp_post_id:  log.id,
      });
      if (logErr) console.warn(`      ⚠ status log wp#${log.id} for ticket wp#${p.id}: ${logErr.message}`);
      else logsCreated++;
    }

    // Attachments (per-ticket custom endpoint)
    const attachments = await wpFetch<WPTicketAttachmentItem[]>(`/bluuhq/v1/ticket-attachments?ticket_id=${p.id}`).catch(() => []);
    for (const a of attachments) {
      const { error: attErr } = await supabase.from("ticket_attachments").insert({
        ticket_id:   inserted.id,
        tenant_id:   TENANT_ID,
        reply_id:    a.att_reply_id ? replyMap.get(a.att_reply_id) ?? null : null,
        uploaded_by: resolveWpUser(a.att_uploaded_by),
        file_name:   a.att_file_name,
        r2_key:      a.att_file_url,
        mime_type:   a.att_file_type,
        size_kb:     a.att_file_size_kb ?? 0,
        wp_post_id:  a.id,
        created_at:  new Date(a.date).toISOString(),
      });
      if (attErr) console.warn(`      ⚠ attachment wp#${a.id} for ticket wp#${p.id}: ${attErr.message}`);
      else attachmentsCreated++;
    }
  }

  console.log(
    `      ✓ ${ticketsCreated} ticket(s) inserted, ${ticketsSkipped} skipped, ` +
    `${repliesCreated} replies, ${logsCreated} status-log entries, ${attachmentsCreated} attachments`
  );
}

// ─── 10. Settings (bank details, address, sender name) ───────────────────────
// Was a single WP-wide options singleton — becomes columns on the target
// tenant's row. Bank account number/sort code are encrypted before storing.

async function migrateSettings() {
  console.log("\n10/10  Settings…");
  const wpSettings = await wpFetch<Record<string, unknown>>("/wp/v2/settings");

  const bankName          = String(wpSettings.bluuhq_bank_name ?? "");
  const bankAccountName   = String(wpSettings.bluuhq_bank_account_name ?? "");
  const bankAccountNumber = String(wpSettings.bluuhq_bank_account_number ?? "");
  const bankSortCode      = String(wpSettings.bluuhq_bank_sort_code ?? "");
  const address           = String(wpSettings.bluuhq_address ?? "");
  const fromEmailName     = String(wpSettings.bluuhq_from_email_name ?? "");

  if (!bankName && !bankAccountName && !bankAccountNumber && !bankSortCode && !address && !fromEmailName) {
    console.log("       No settings found on WP — skipping");
    return;
  }

  const updates: Record<string, unknown> = {
    bank_name:           bankName || null,
    bank_account_name:   bankAccountName || null,
    bank_account_number: bankAccountNumber ? tryEncrypt(bankAccountNumber) : null,
    bank_sort_code:      bankSortCode ? tryEncrypt(bankSortCode) : null,
    address:             address || null,
    from_email_name:     fromEmailName || null,
  };

  if (DRY_RUN) {
    console.log("  [dry-run] would update tenants row with bank/settings fields (sensitive values redacted)");
    return;
  }

  const { error } = await supabase.from("tenants").update(updates).eq("id", TENANT_ID);
  if (error) {
    console.warn(`       ⚠ tenants settings update: ${error.message}`);
    return;
  }
  console.log("       ✓ settings migrated");
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
    `templates=${templateMap.size}  sequences=${sequenceMap.size}  team=${teamUserMap.size}  ` +
    `portal_users=${portalUserMap.size}  tickets=${ticketMap.size}`
  );

  if (!SKIP_TEAM)      await migrateTeamMembers();
  if (!SKIP_SERVICES)  await migrateServices();
  if (!SKIP_CLIENTS)   await migrateClients();
  if (!SKIP_SUBS)      await migrateSubscriptions();
  if (!SKIP_INVOICES)  await migrateInvoices();
  if (!SKIP_COMMS)     await migrateCommunications();
  if (!SKIP_FILES)     await migrateFiles();
  if (!SKIP_TEMPLATES) await migrateEmailTemplates();
  if (!SKIP_SEQUENCES) await migrateSequences();
  if (!SKIP_TICKETS)   await migrateTickets();
  if (!SKIP_SETTINGS)  await migrateSettings();

  console.log("\n✅  Migration complete.\n");
}

main().catch((err) => {
  console.error("\n❌  Migration failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
