// ─── Auth & Session ───────────────────────────────────────────────────────────

export type UserRole = "bluu_admin" | "bluu_client";

export interface BluuSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  wpUserId: number;
  clientId?: string; // bluu_client CPT post ID
}

// ─── Client ───────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  wpPostId: number;
  title: string;
  status: "active" | "inactive" | "churned" | "onboarding";
  // Contact
  contactName: string;
  contactEmail: string;        // AES-256 encrypted at rest
  contactPhone?: string;       // AES-256 encrypted at rest
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  // Portal access
  portalEmail: string;         // WP user login email
  wpUserId?: number;
  lastLoginAt?: string;
  // Metadata
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientFormData {
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  status: Client["status"];
  notes?: string;
  tags?: string[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

export type ServiceCategory =
  | "branding"
  | "web_design"
  | "web_development"
  | "seo"
  | "social_media"
  | "content"
  | "ads"
  | "consulting"
  | "other";

export type BillingCycle = "one_time" | "monthly" | "quarterly" | "annually";

export interface Service {
  id: string;
  wpPostId: number;
  title: string;
  description?: string;
  category: ServiceCategory;
  basePrice: number;
  currency: "USD" | "GHS" | "NGN" | "GBP";
  billingCycle: BillingCycle;
  deliverables?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "past_due"
  | "trialing";

export type PaymentGateway = "stripe" | "paystack" | "manual";

export interface Subscription {
  id: string;
  wpPostId: number;
  clientId: string;
  serviceId: string;
  // Denormalised for display
  clientName?: string;
  serviceName?: string;
  // Billing
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate?: string;
  startDate: string;
  endDate?: string;
  // Gateway
  paymentGateway: PaymentGateway;
  gatewaySubscriptionId?: string; // Stripe/Paystack ID
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  wpPostId: number;
  invoiceNumber: string;
  clientId: string;
  subscriptionId?: string;
  // Denormalised
  clientName?: string;
  // Items
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  currency: string;
  // Status
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
  // Gateway
  paymentGateway?: PaymentGateway;
  gatewayPaymentId?: string;
  paymentLink?: string;
  // Metadata
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── File ─────────────────────────────────────────────────────────────────────

export type FileCategory =
  | "contract"
  | "brief"
  | "deliverable"
  | "invoice_attachment"
  | "asset"
  | "report"
  | "other";

export interface BluuFile {
  id: string;
  wpPostId: number;
  clientId: string;
  title: string;
  description?: string;
  category: FileCategory;
  // Storage
  r2Key: string;          // Cloudflare R2 object key
  r2Bucket: string;
  mimeType: string;
  fileSize: number;       // bytes
  originalName: string;
  // Visibility
  isVisibleToClient: boolean;
  // Metadata
  uploadedBy: string;     // WP user ID
  createdAt: string;
  updatedAt: string;
  // Computed
  downloadUrl?: string;   // pre-signed R2 URL (short-lived)
}

// ─── Communication ────────────────────────────────────────────────────────────

export type CommunicationDirection = "inbound" | "outbound";
export type CommunicationChannel = "email" | "phone" | "meeting" | "chat" | "note";

export interface Communication {
  id: string;
  wpPostId: number;
  clientId: string;
  // Denormalised
  clientName?: string;
  // Details
  direction: CommunicationDirection;
  channel: CommunicationChannel;
  subject?: string;
  body: string;
  occurredAt: string;
  // Email-specific
  fromEmail?: string;
  toEmail?: string;
  // Mood analysis
  moodAnalysis?: MoodAnalysis;
  // Metadata
  loggedBy: string; // WP user ID
  createdAt: string;
  updatedAt: string;
}

// ─── Mood Analysis ────────────────────────────────────────────────────────────

export type MoodSentiment = "positive" | "neutral" | "negative" | "mixed";
export type ChurnRisk = "low" | "medium" | "high" | "critical";

export interface MoodAnalysis {
  sentiment: MoodSentiment;
  score: number;           // -1.0 to 1.0
  churnRisk: ChurnRisk;
  summary: string;
  keyThemes: string[];
  suggestedActions?: string[];
  analysedAt: string;
  model: string;           // e.g. "gemini-1.5-flash"
}

// ─── Sequence ─────────────────────────────────────────────────────────────────

export type SequenceTrigger =
  | "client_onboarding"
  | "invoice_sent"
  | "invoice_overdue"
  | "subscription_expiring"
  | "manual";

export interface SequenceStep {
  stepNumber: number;
  delayDays: number;
  emailTemplateId: string;
  emailTemplateName?: string;
}

export interface Sequence {
  id: string;
  wpPostId: number;
  title: string;
  trigger: SequenceTrigger;
  steps: SequenceStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Email Template ───────────────────────────────────────────────────────────

export type EmailTemplateType =
  | "onboarding"
  | "invoice"
  | "follow_up"
  | "report"
  | "general"
  | "portal_invite";

export interface EmailTemplate {
  id: string;
  wpPostId: number;
  title: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  type: EmailTemplateType;
  // Available merge tags documented in description
  mergeTags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── API Response helpers ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalClients: number;
  activeClients: number;
  totalMRR: number;
  openInvoices: number;
  overdueInvoices: number;
  overdueAmount: number;
  highChurnRiskClients: number;
  recentCommunications: number;
}

export interface ClientDashboardStats {
  activeSubscriptions: number;
  openInvoices: number;
  totalDue: number;
  recentFiles: number;
}
