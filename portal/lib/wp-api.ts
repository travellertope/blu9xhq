/**
 * WP REST API client — used for all write operations (CPT posts, users).
 * Reads are also done here for simplicity; WPGraphQL can be layered in later.
 */

const WORDPRESS_URL = process.env.WORDPRESS_URL!;
const WP_APP_USERNAME = process.env.WP_APP_USERNAME!;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD!;

function authHeader(): string {
  return `Basic ${Buffer.from(`${WP_APP_USERNAME}:${WP_APP_PASSWORD}`).toString("base64")}`;
}

export async function wpRestFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${WORDPRESS_URL}/wp-json${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`WP REST API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export interface WPListResult<T> {
  items: T[];
  total: number;
  totalPages: number;
}

export async function wpRestList<T>(
  path: string,
  params: Record<string, string | number> = {}
): Promise<WPListResult<T>> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const url = `${WORDPRESS_URL}/wp-json${path}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: authHeader() },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`WP REST API ${res.status}: ${text}`);
  }
  const items = (await res.json()) as T[];
  const total = parseInt(res.headers.get("X-WP-Total") ?? "0", 10);
  const totalPages = parseInt(res.headers.get("X-WP-TotalPages") ?? "1", 10);
  return { items, total, totalPages };
}

// ─── WP User types & helpers ──────────────────────────────────────────────────

export interface WPUser {
  id: number;
  username: string;
  email: string;
  name: string;
  roles: string[];
  meta: Record<string, unknown>;
}

export interface CreateWPUserParams {
  username: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  meta?: Record<string, unknown>;
}

export function createWPUser(params: CreateWPUserParams): Promise<WPUser> {
  return wpRestFetch("/wp/v2/users", { method: "POST", body: JSON.stringify(params) });
}

export function updateWPUser(userId: number, params: Partial<CreateWPUserParams>): Promise<WPUser> {
  return wpRestFetch(`/wp/v2/users/${userId}`, { method: "POST", body: JSON.stringify(params) });
}

// ─── bluu_client CPT types & helpers ─────────────────────────────────────────

export interface WPClientACF {
  contact_name: string;
  contact_email: string;   // AES-256 encrypted
  contact_phone: string;   // AES-256 encrypted
  company_name: string;
  company_website?: string;
  industry?: string;
  portal_email: string;
  wp_user_id?: number;
  status: string;
  health_status?: string;
  health_note?: string;
  health_overridden_at?: string;
  tags?: string;           // comma-separated
  notes?: string;
  last_login_at?: string;
  last_contacted_at?: string;
  portal_invited_at?: string;
  active_subscription_count?: number;
}

export interface WPClientPost {
  id: number;
  title: { rendered: string; raw?: string };
  date: string;
  modified: string;
  status: string;
  acf: WPClientACF;
}

export function getClientPost(postId: number): Promise<WPClientPost> {
  return wpRestFetch<WPClientPost>(`/wp/v2/bluu_client/${postId}`);
}

export function createClientPost(params: {
  title: string;
  acf: Partial<WPClientACF>;
}): Promise<WPClientPost> {
  return wpRestFetch("/wp/v2/bluu_client", {
    method: "POST",
    body: JSON.stringify({ title: params.title, status: "publish", acf: params.acf }),
  });
}

export function updateClientPost(
  postId: number,
  params: { title?: string; acf?: Partial<WPClientACF> }
): Promise<WPClientPost> {
  return wpRestFetch(`/wp/v2/bluu_client/${postId}`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function listClientPosts(params: {
  page?: number;
  per_page?: number;
  search?: string;
  orderby?: string;
  order?: "asc" | "desc";
}): Promise<WPListResult<WPClientPost>> {
  const qp: Record<string, string | number> = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 20,
    status: "publish",
  };
  if (params.search) qp.search = params.search;
  if (params.orderby) qp.orderby = params.orderby;
  if (params.order) qp.order = params.order;
  return wpRestList<WPClientPost>("/wp/v2/bluu_client", qp);
}

// ─── bluu_subscription (for profile sidebar count) ───────────────────────────

export interface WPSubscriptionACF {
  client_id: number;
  service_id: number;
  status: string;
  amount: number;
  currency: string;
  billing_cycle: string;
  next_billing_date?: string;
  start_date?: string;
}

export interface WPSubscriptionPost {
  id: number;
  title: { rendered: string };
  date: string;
  acf: WPSubscriptionACF;
}

export function listClientSubscriptions(clientPostId: number): Promise<WPListResult<WPSubscriptionPost>> {
  return wpRestList<WPSubscriptionPost>("/wp/v2/bluu_subscription", {
    per_page: 100,
    status: "publish",
  });
}
