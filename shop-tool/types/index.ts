export type ShopPlan = "free" | "starter" | "pro";

export interface Shop {
  id: string;
  owner_user_id: string;
  slug: string;
  name: string;
  whatsapp_number: string;
  currency: string;
  logo_url: string | null;
  cover_url: string | null;
  tagline: string | null;
  delivery_info: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  x_url: string | null;
  plan: ShopPlan;
  theme_id: string;
  accent_color: string | null;
  font_id: string;
  custom_domain: string | null;
  branding_hidden: boolean;
  stripe_customer_id: string | null;
  billing_provider: "stripe" | "paystack" | null;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  paystack_email_token: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  shop_id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[];
  variants: ProductVariant[];
  stock_qty: number | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DeliveryZone {
  id: string;
  shop_id: string;
  name: string;
  fee: number;
  sort_order: number;
  created_at: string;
}

export type OrderIntentStatus = "new" | "contacted" | "confirmed" | "fulfilled" | "cancelled";

export interface OrderIntentItem {
  product_id: string;
  name: string;
  price: number;
  qty: number;
  variant: Record<string, string> | null; // e.g. { Size: "M" }
}

export interface OrderIntent {
  id: string;
  shop_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: OrderIntentItem[];
  subtotal: number;
  delivery_zone_name: string | null;
  delivery_fee: number;
  status: OrderIntentStatus;
  whatsapp_message: string;
  ref_code: string | null;
  created_at: string;
  updated_at: string;
}

export type AnalyticsEventType = "view" | "add_to_cart" | "checkout_click";

export interface AnalyticsEvent {
  id: string;
  shop_id: string;
  event_type: AnalyticsEventType;
  product_id: string | null;
  session_id: string;
  created_at: string;
}

// ── Cart (client-side only, not persisted server-side until checkout) ────────
export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
  variant: Record<string, string> | null;
}
