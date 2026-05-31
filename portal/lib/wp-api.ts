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
  health_auto_score?: string;
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

// ─── bluu_service CPT types & helpers ────────────────────────────────────────

export interface WPServiceACF {
  description?: string;
  category?: string;
  deliverables?: string;
  base_price?: number;
  currency?: string;
  billing_cycle?: string;
  is_active?: boolean;
}

export interface WPServicePost {
  id: number;
  title: { rendered: string };
  acf: WPServiceACF;
}

export function getServicePost(postId: number): Promise<WPServicePost> {
  return wpRestFetch<WPServicePost>(`/wp/v2/bluu_service/${postId}`);
}

// ─── bluu_subscription CPT types & helpers ───────────────────────────────────

export interface WPSubscriptionACF {
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
  notes?: string;                          // internal — NEVER send to portal
  // Cancellation (set by portal)
  sub_cancellation_requested_at?: string;
  sub_cancellation_reason?: string;
  sub_cancellation_note?: string;
  // Portal action buttons — JSON: string[]
  sub_action_button_labels?: string;
  sub_action_button_urls?: string;
  // Credentials vault — JSON: string[]; values are AES-256 encrypted — NEVER expose raw to portal
  sub_sensitive_field_labels?: string;
  sub_sensitive_field_values?: string;
}

export interface WPSubscriptionPost {
  id: number;
  title: { rendered: string };
  date: string;
  acf: WPSubscriptionACF;
}

/** @deprecated Use listSubscriptionsByClient for portal use */
export function listClientSubscriptions(_clientPostId: number): Promise<WPListResult<WPSubscriptionPost>> {
  return wpRestList<WPSubscriptionPost>("/wp/v2/bluu_subscription", {
    per_page: 100,
    status: "publish",
  });
}

// Find bluu_client post by WP user ID (for portal session → clientId lookup)
export async function findClientByWpUserId(wpUserId: number): Promise<WPClientPost | null> {
  const result = await wpRestList<WPClientPost>("/wp/v2/bluu_client", {
    meta_key: "wp_user_id",
    meta_value: wpUserId,
    per_page: 1,
  });
  return result.items[0] ?? null;
}

// List subscriptions by client post ID
export function listSubscriptionsByClient(clientPostId: number): Promise<WPListResult<WPSubscriptionPost>> {
  return wpRestList<WPSubscriptionPost>("/wp/v2/bluu_subscription", {
    per_page: 100,
    status: "publish",
    meta_key: "client_id",
    meta_value: clientPostId,
  });
}

// Update subscription ACF fields (for cancellation)
export function updateSubscription(postId: number, params: { acf: Partial<WPSubscriptionACF> }): Promise<WPSubscriptionPost> {
  return wpRestFetch(`/wp/v2/bluu_subscription/${postId}`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ─── bluu_communication types & helpers ──────────────────────────────────────

export interface WPCommunicationACF {
  comm_direction:          string;
  comm_channel:            string;
  comm_type:               string;
  comm_subject:            string;
  comm_content:            string;
  comm_occurred_at:        string;
  comm_client:             number;
  comm_logged_by:          number;
  comm_mood?:              string;
  comm_mood_source?:       string;
  comm_mood_reasoning?:    string;
  comm_red_flags?:         string;   // JSON-encoded string[]
  comm_follow_up_needed?:  boolean | string | number;
  comm_follow_up_due?:     string;
  comm_follow_up_completed?: boolean | string | number;
  comm_email_status?:      string;
  comm_resend_email_id?:   string;
}

export interface WPCommunicationPost {
  id:     number;
  date:   string;
  title:  { rendered: string };
  acf:    WPCommunicationACF;
}

export function listClientCommunications(
  clientPostId: number,
  params: Record<string, string | number> = {}
): Promise<WPListResult<WPCommunicationPost>> {
  return wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
    per_page: 100,
    status:   "publish",
    meta_key:   "comm_client",
    meta_value: clientPostId,
    orderby:    "date",
    order:      "desc",
    ...params,
  });
}

export function listFollowUpCommunications(
  params: Record<string, string | number> = {}
): Promise<WPListResult<WPCommunicationPost>> {
  return wpRestList<WPCommunicationPost>("/wp/v2/bluu_communication", {
    per_page:   100,
    status:     "publish",
    meta_key:   "comm_follow_up_needed",
    meta_value: "1",
    orderby:    "date",
    order:      "desc",
    ...params,
  });
}

// ─── bluu_email_template types & helpers ─────────────────────────────────────

export interface WPEmailTemplateACF {
  subject:    string;
  body_html:  string;
  body_text?: string;
  type:       string;
  merge_tags?: string;
}

export interface WPEmailTemplatePost {
  id:       number;
  title:    { rendered: string; raw?: string };
  date:     string;
  modified: string;
  status:   string;
  acf:      WPEmailTemplateACF;
}

export function listEmailTemplates(params: Record<string, string | number> = {}): Promise<WPListResult<WPEmailTemplatePost>> {
  return wpRestList<WPEmailTemplatePost>("/wp/v2/bluu_email_template", {
    per_page: 100,
    status:   "publish",
    orderby:  "title",
    order:    "asc",
    ...params,
  });
}

export function getEmailTemplate(postId: number): Promise<WPEmailTemplatePost> {
  return wpRestFetch<WPEmailTemplatePost>(`/wp/v2/bluu_email_template/${postId}`);
}

export function createEmailTemplate(params: { title: string; acf: Partial<WPEmailTemplateACF> }): Promise<WPEmailTemplatePost> {
  return wpRestFetch("/wp/v2/bluu_email_template", {
    method: "POST",
    body:   JSON.stringify({ title: params.title, status: "publish", acf: params.acf }),
  });
}

export function updateEmailTemplate(postId: number, params: { title?: string; acf?: Partial<WPEmailTemplateACF> }): Promise<WPEmailTemplatePost> {
  return wpRestFetch(`/wp/v2/bluu_email_template/${postId}`, {
    method: "POST",
    body:   JSON.stringify(params),
  });
}

export function deleteEmailTemplate(postId: number): Promise<void> {
  return wpRestFetch(`/wp/v2/bluu_email_template/${postId}?force=true`, { method: "DELETE" });
}

// ─── bluu_sequence types & helpers ────────────────────────────────────────────

export interface WPSequenceStepACF {
  step_number:       number;
  delay_days:        number;
  email_template_id: number;
}

export interface WPSequenceACF {
  trigger:             string;
  trigger_delay_days?: number;
  exit_conditions?:    string;   // JSON-encoded string[]
  description?:        string;
  is_active:           boolean | string | number;
  seq_loops_id?:       string;
  seq_loops_synced_at?: string;
  steps?:              WPSequenceStepACF[];
}

export interface WPSequencePost {
  id:       number;
  title:    { rendered: string; raw?: string };
  date:     string;
  modified: string;
  status:   string;
  acf:      WPSequenceACF;
}

export function listSequences(params: Record<string, string | number> = {}): Promise<WPListResult<WPSequencePost>> {
  return wpRestList<WPSequencePost>("/wp/v2/bluu_sequence", {
    per_page: 100,
    status:   "publish",
    orderby:  "date",
    order:    "desc",
    ...params,
  });
}

export function getSequence(postId: number): Promise<WPSequencePost> {
  return wpRestFetch<WPSequencePost>(`/wp/v2/bluu_sequence/${postId}`);
}

export function createSequence(params: { title: string; acf: Partial<WPSequenceACF> }): Promise<WPSequencePost> {
  return wpRestFetch("/wp/v2/bluu_sequence", {
    method: "POST",
    body:   JSON.stringify({ title: params.title, status: "publish", acf: params.acf }),
  });
}

export function updateSequence(postId: number, params: { title?: string; acf?: Partial<WPSequenceACF> }): Promise<WPSequencePost> {
  return wpRestFetch(`/wp/v2/bluu_sequence/${postId}`, {
    method: "POST",
    body:   JSON.stringify(params),
  });
}

// ─── bluu_file CPT types & helpers ────────────────────────────────────────────

export interface WPFileACF {
  file_client: number;
  file_r2_key: string;
  file_original_name: string;
  file_mime_type: string;
  file_size: number;
  file_category: string;       // contract | deliverable | invoice | brand_asset | brief | general
  file_description?: string;
  file_visibility: string;     // shared | internal
  file_uploaded_by: number;    // wp user id
  file_subscription_id?: number;
  file_public_url?: string;
}

export interface WPFilePost {
  id: number;
  title: { rendered: string };
  date: string;
  acf: WPFileACF;
}

export function listClientFiles(
  clientId: number,
  params: Record<string, string | number> = {}
): Promise<WPListResult<WPFilePost>> {
  return wpRestList<WPFilePost>("/wp/v2/bluu_file", {
    per_page:   100,
    status:     "publish",
    meta_key:   "file_client",
    meta_value: clientId,
    orderby:    "date",
    order:      "desc",
    ...params,
  });
}

export function createFilePost(params: {
  title: string;
  acf: Partial<WPFileACF>;
}): Promise<WPFilePost> {
  return wpRestFetch("/wp/v2/bluu_file", {
    method: "POST",
    body:   JSON.stringify({ title: params.title, status: "publish", acf: params.acf }),
  });
}

export function deleteFilePost(postId: number): Promise<void> {
  return wpRestFetch(`/wp/v2/bluu_file/${postId}?force=true`, { method: "DELETE" });
}

// ─── bluu_invoice CPT types & helpers ────────────────────────────────────────

export interface WPInvoiceACF {
  inv_client: number;
  inv_subscription?: number;
  inv_number: string;                    // BLU-2024-0001
  inv_line_items: string;               // JSON: [{description: string, amount: number}]
  inv_total: number;
  inv_currency: string;
  inv_status: string;                   // draft | sent | paid | overdue | void
  inv_due_date: string;
  inv_issued_date: string;
  inv_paid_at?: string;
  inv_payment_method?: string;          // stripe | paystack | bank_transfer | cash
  inv_payment_gateway_ref?: string;
  inv_notes?: string;
  inv_pdf_url?: string;
  inv_last_reminder_sent?: string;
}

export interface WPInvoicePost {
  id: number;
  title: { rendered: string };
  date: string;
  acf: WPInvoiceACF;
}

export function listInvoices(params: {
  page?: number;
  per_page?: number;
  clientId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  currency?: string;
} = {}): Promise<WPListResult<WPInvoicePost>> {
  const qp: Record<string, string | number> = {
    page:     params.page     ?? 1,
    per_page: params.per_page ?? 20,
    status:   "publish",
    orderby:  "date",
    order:    "desc",
  };
  if (params.clientId) {
    qp.meta_key   = "inv_client";
    qp.meta_value = params.clientId;
  }
  if (params.status) {
    qp.meta_key   = "inv_status";
    qp.meta_value = params.status;
  }
  if (params.currency) {
    qp.meta_key   = "inv_currency";
    qp.meta_value = params.currency;
  }
  return wpRestList<WPInvoicePost>("/wp/v2/bluu_invoice", qp);
}

export function getInvoice(postId: number): Promise<WPInvoicePost> {
  return wpRestFetch<WPInvoicePost>(`/wp/v2/bluu_invoice/${postId}`);
}

export function createInvoice(params: {
  title: string;
  acf: Partial<WPInvoiceACF>;
}): Promise<WPInvoicePost> {
  return wpRestFetch("/wp/v2/bluu_invoice", {
    method: "POST",
    body:   JSON.stringify({ title: params.title, status: "publish", acf: params.acf }),
  });
}

export function updateInvoice(
  postId: number,
  params: { title?: string; acf?: Partial<WPInvoiceACF> }
): Promise<WPInvoicePost> {
  return wpRestFetch(`/wp/v2/bluu_invoice/${postId}`, {
    method: "POST",
    body:   JSON.stringify(params),
  });
}

/** Fetch all clients (up to 100). */
export async function listAllClients(): Promise<WPClientPost[]> {
  const result = await listClientPosts({ per_page: 100 });
  return result.items;
}

