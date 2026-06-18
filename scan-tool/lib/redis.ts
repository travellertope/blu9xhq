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
