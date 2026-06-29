import { Redis } from "@upstash/redis";
import { randomBytes } from "crypto";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

const SCAN_TTL = parseInt(process.env.SCAN_TTL_SECONDS || "259200", 10);

export async function saveScan(
  id: string,
  data: Record<string, unknown>,
  opts?: { persist?: boolean }
) {
  if (opts?.persist) {
    // Claimed by a logged-in user (email gate) — keep it forever so it stays
    // visible in their Scan history, instead of expiring after SCAN_TTL like
    // anonymous/unclaimed scans do.
    await getRedis().set(`scan:${id}`, JSON.stringify(data));
  } else {
    await getRedis().set(`scan:${id}`, JSON.stringify(data), { ex: SCAN_TTL });
  }
}

export async function getScan(id: string) {
  const raw = await getRedis().get<string>(`scan:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function updateScan(
  id: string,
  updates: Record<string, unknown>,
  opts?: { persist?: boolean }
) {
  const existing = await getScan(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  await saveScan(id, merged, opts);
  return merged;
}

/** Strips the TTL from an already-saved scan once it's tied to a user account. */
export async function persistScan(id: string): Promise<void> {
  const existing = await getScan(id);
  if (existing) await saveScan(id, existing, { persist: true });
}

export async function checkRateLimit(ip: string, limit = 5): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const current = await getRedis().incr(key);
  if (current === 1) {
    await getRedis().expire(key, 3600);
  }
  return current <= limit;
}

// ─── Users & scan history (Phase 2 dashboard) ──────────────────────────────

export type UserTier = "free" | "monitor" | "monitor_pro";

export interface ScanUser {
  email: string;
  createdAt: string;
  scanCount: number;
  tier: UserTier;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  tierExpiresAt: string | null;
  scansThisMonth: number;
  monthlyResetAt: string;
}

function defaultUser(email: string): ScanUser {
  return {
    email,
    createdAt: new Date().toISOString(),
    scanCount: 0,
    tier: "free",
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    tierExpiresAt: null,
    scansThisMonth: 0,
    monthlyResetAt: nextMonthlyReset(),
  };
}

function nextMonthlyReset(): string {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() + 1, 1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function upsertUser(email: string): Promise<void> {
  const key = `user:${email}`;
  const existing = await getRedis().get<ScanUser>(key);
  if (existing) {
    await getRedis().set(key, { ...defaultUser(email), ...existing, scanCount: existing.scanCount + 1 });
  } else {
    await getRedis().set(key, { ...defaultUser(email), scanCount: 1 });
  }
}

export async function getUserByStripeCustomerId(customerId: string): Promise<ScanUser | null> {
  const email = await getRedis().get<string>(`stripeCustomer:${customerId}`);
  if (!email) return null;
  return getUser(email);
}

export async function setUserTier(
  email: string,
  updates: Partial<Pick<ScanUser, "tier" | "stripeCustomerId" | "stripeSubscriptionId" | "tierExpiresAt">>
): Promise<void> {
  const existing = await getUser(email);
  const merged: ScanUser = { ...defaultUser(email), ...existing, ...updates };
  await getRedis().set(`user:${email}`, merged);
  if (merged.stripeCustomerId) {
    await getRedis().set(`stripeCustomer:${merged.stripeCustomerId}`, email);
  }
}

/** Returns false if the user is on the free tier and has hit their monthly scan cap. */
export async function checkAndIncrementMonthlyScans(email: string, limit: number): Promise<boolean> {
  const existing = await getUser(email);
  const user = existing ? { ...defaultUser(email), ...existing } : defaultUser(email);

  const now = new Date();
  if (new Date(user.monthlyResetAt) <= now) {
    user.scansThisMonth = 0;
    user.monthlyResetAt = nextMonthlyReset();
  }

  if (user.scansThisMonth >= limit) {
    await getRedis().set(`user:${email}`, user);
    return false;
  }

  user.scansThisMonth += 1;
  await getRedis().set(`user:${email}`, user);
  return true;
}

export async function getUser(email: string): Promise<ScanUser | null> {
  return getRedis().get<ScanUser>(`user:${email}`);
}

export async function ensureUser(email: string): Promise<void> {
  const existing = await getUser(email);
  if (!existing) {
    await getRedis().set(`user:${email}`, defaultUser(email));
  }
}

export async function addScanToUserIndex(email: string, scanId: string): Promise<void> {
  await getRedis().zadd(`scans:${email}`, { score: Date.now(), member: scanId });
}

// ─── Tracked competitors (Phase 4 dashboard) ───────────────────────────────

export interface TrackedCompetitor {
  domain: string;
  addedAt: string;
}

export async function getTrackedCompetitors(email: string): Promise<TrackedCompetitor[]> {
  const list = await getRedis().get<TrackedCompetitor[]>(`competitors:${email}`);
  return list || [];
}

export async function addTrackedCompetitor(
  email: string,
  domain: string,
  limit: number
): Promise<{ ok: boolean; error?: string }> {
  const existing = await getTrackedCompetitors(email);
  if (existing.some((c) => c.domain === domain)) {
    return { ok: false, error: "Already tracking this competitor." };
  }
  if (existing.length >= limit) {
    return { ok: false, error: `You can track up to ${limit} competitors on your plan.` };
  }

  const updated = [...existing, { domain, addedAt: new Date().toISOString() }];
  await getRedis().set(`competitors:${email}`, updated);
  return { ok: true };
}

export async function removeTrackedCompetitor(email: string, domain: string): Promise<void> {
  const existing = await getTrackedCompetitors(email);
  const updated = existing.filter((c) => c.domain !== domain);
  await getRedis().set(`competitors:${email}`, updated);
}

// ─── Competitor profile cache (Phase 3) ────────────────────────────────────
// Sitemap crawling + content fetching per competitor is the slowest part of a
// scan and the result barely changes day to day, so cache it across scans.

const COMPETITOR_CACHE_TTL = 86400; // 24h

export async function getCachedCompetitor<T>(domain: string): Promise<T | null> {
  return getRedis().get<T>(`competitor:${domain}`);
}

export async function cacheCompetitor<T>(domain: string, profile: T): Promise<void> {
  await getRedis().set(`competitor:${domain}`, profile, { ex: COMPETITOR_CACHE_TTL });
}

export async function getUserScanIds(email: string, limit = 50): Promise<string[]> {
  const ids = await getRedis().zrange<string[]>(`scans:${email}`, 0, limit - 1, { rev: true });
  return ids;
}

// ─── Scheduled re-scans & alerts (Phase 4 cron) ────────────────────────────

export interface ScanSchedule {
  email: string;
  domain: string;
  frequency: "weekly" | "daily";
  lastRunAt: string | null;
  nextRunAt: string;
  alertThreshold: number;
}

const SCHEDULE_INDEX_KEY = "scheduleIndex";

function msFor(frequency: "weekly" | "daily"): number {
  return frequency === "daily" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
}

export async function setSchedule(
  email: string,
  domain: string,
  frequency: "weekly" | "daily",
  alertThreshold = 5
): Promise<void> {
  const schedule: ScanSchedule = {
    email,
    domain,
    frequency,
    lastRunAt: null,
    nextRunAt: new Date(Date.now() + msFor(frequency)).toISOString(),
    alertThreshold,
  };
  await getRedis().set(`schedule:${email}`, schedule);
  await getRedis().sadd(SCHEDULE_INDEX_KEY, email);
}

export async function getSchedule(email: string): Promise<ScanSchedule | null> {
  return getRedis().get<ScanSchedule>(`schedule:${email}`);
}

export async function removeSchedule(email: string): Promise<void> {
  await getRedis().del(`schedule:${email}`);
  await getRedis().srem(SCHEDULE_INDEX_KEY, email);
}

export async function getAllScheduledEmails(): Promise<string[]> {
  return getRedis().smembers(SCHEDULE_INDEX_KEY);
}

export async function markScheduleRun(email: string, frequency: "weekly" | "daily"): Promise<void> {
  const now = new Date();
  await getRedis().set(`schedule:${email}`, {
    ...(await getSchedule(email)),
    lastRunAt: now.toISOString(),
    nextRunAt: new Date(now.getTime() + msFor(frequency)).toISOString(),
  });
}

// ─── API keys (Phase 4, Pro tier programmatic access) ──────────────────────

export interface ApiKey {
  key: string;
  email: string;
  createdAt: string;
  lastUsedAt: string | null;
}

function randomApiKey(): string {
  return `sk_${randomBytes(24).toString("hex")}`;
}

export async function createApiKey(email: string): Promise<ApiKey> {
  const apiKey: ApiKey = {
    key: randomApiKey(),
    email,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  await getRedis().set(`apikey:${apiKey.key}`, apiKey);
  await getRedis().set(`apikeyByUser:${email}`, apiKey.key);
  return apiKey;
}

export async function getApiKeyForUser(email: string): Promise<ApiKey | null> {
  const key = await getRedis().get<string>(`apikeyByUser:${email}`);
  if (!key) return null;
  return getRedis().get<ApiKey>(`apikey:${key}`);
}

export async function revokeApiKey(email: string): Promise<void> {
  const key = await getRedis().get<string>(`apikeyByUser:${email}`);
  if (key) await getRedis().del(`apikey:${key}`);
  await getRedis().del(`apikeyByUser:${email}`);
}

export async function getUserByApiKey(key: string): Promise<ScanUser | null> {
  const apiKey = await getRedis().get<ApiKey>(`apikey:${key}`);
  if (!apiKey) return null;
  await getRedis().set(`apikey:${key}`, { ...apiKey, lastUsedAt: new Date().toISOString() });
  return getUser(apiKey.email);
}

// ─── Magic-link tokens (self-contained, no WordPress dependency) ──────────
// Scan-tool users are anonymous leads identified only by the email they gave
// at the gate — not WordPress accounts — so login is a one-time emailed
// token verified against Redis, not a password or WP JWT bridge.

const MAGIC_TOKEN_TTL = 900; // 15 minutes

export async function createMagicToken(email: string, token: string): Promise<void> {
  await getRedis().set(`magictoken:${token}`, email, { ex: MAGIC_TOKEN_TTL });
}

export async function consumeMagicToken(token: string): Promise<string | null> {
  const email = await getRedis().get<string>(`magictoken:${token}`);
  if (!email) return null;
  await getRedis().del(`magictoken:${token}`);
  return email;
}
