import { getUserByApiKey, type ScanUser } from "./redis";

export async function authenticateApiKey(request: Request): Promise<ScanUser | null> {
  const header = request.headers.get("authorization") || "";
  const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!key.startsWith("sk_")) return null;
  return getUserByApiKey(key);
}
