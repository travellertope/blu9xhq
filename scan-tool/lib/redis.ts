import { Redis } from "@upstash/redis";

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

export async function saveScan(id: string, data: Record<string, unknown>) {
  await getRedis().set(`scan:${id}`, JSON.stringify(data), { ex: SCAN_TTL });
}

export async function getScan(id: string) {
  const raw = await getRedis().get<string>(`scan:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function updateScan(
  id: string,
  updates: Record<string, unknown>
) {
  const existing = await getScan(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  await saveScan(id, merged);
  return merged;
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

export interface ScanUser {
  email: string;
  createdAt: string;
  scanCount: number;
}

export async function upsertUser(email: string): Promise<void> {
  const key = `user:${email}`;
  const existing = await getRedis().get<ScanUser>(key);
  if (existing) {
    await getRedis().set(key, { ...existing, scanCount: existing.scanCount + 1 });
  } else {
    await getRedis().set(key, {
      email,
      createdAt: new Date().toISOString(),
      scanCount: 1,
    });
  }
}

export async function getUser(email: string): Promise<ScanUser | null> {
  return getRedis().get<ScanUser>(`user:${email}`);
}

export async function ensureUser(email: string): Promise<void> {
  const existing = await getUser(email);
  if (!existing) {
    await getRedis().set(`user:${email}`, {
      email,
      createdAt: new Date().toISOString(),
      scanCount: 0,
    });
  }
}

export async function addScanToUserIndex(email: string, scanId: string): Promise<void> {
  await getRedis().zadd(`scans:${email}`, { score: Date.now(), member: scanId });
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
