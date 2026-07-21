import type { Shop, Category, Product, DeliveryZone, OrderIntent, AnalyticsEvent } from "./index";

// supabase-js's generic plumbing structurally checks Row/Insert/Update against
// Record<string, unknown> — a plain `interface` fails that check even when
// every field is compatible, so this flattens each into a mapped-type object
// literal (which passes) instead of passing the interface straight through.
type Flatten<T> = { [K in keyof T]: T[K] };

type TableDef<Row, Insertable extends keyof Row, GeneratedDefaults extends keyof Row> = {
  Row: Flatten<Row>;
  Insert: Flatten<Pick<Row, Insertable> & Partial<Pick<Row, GeneratedDefaults>>>;
  Update: Flatten<Partial<Row>>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      shops: TableDef<
        Shop,
        "owner_user_id" | "slug" | "name" | "whatsapp_number",
        | "id"
        | "currency"
        | "logo_url"
        | "cover_url"
        | "tagline"
        | "delivery_info"
        | "instagram_url"
        | "tiktok_url"
        | "facebook_url"
        | "x_url"
        | "plan"
        | "theme_id"
        | "accent_color"
        | "font_id"
        | "custom_domain"
        | "branding_hidden"
        | "stripe_customer_id"
        | "billing_provider"
        | "paystack_customer_code"
        | "paystack_subscription_code"
        | "paystack_email_token"
        | "active"
        | "created_at"
        | "updated_at"
      >;
      categories: TableDef<Category, "shop_id" | "name", "id" | "sort_order" | "created_at">;
      delivery_zones: TableDef<DeliveryZone, "shop_id" | "name" | "fee", "id" | "sort_order" | "created_at">;
      products: TableDef<
        Product,
        "shop_id" | "name" | "price",
        | "id"
        | "category_id"
        | "description"
        | "compare_at_price"
        | "images"
        | "variants"
        | "stock_qty"
        | "active"
        | "sort_order"
        | "created_at"
        | "updated_at"
      >;
      order_intents: TableDef<
        OrderIntent,
        "shop_id" | "items" | "subtotal" | "whatsapp_message",
        | "id"
        | "customer_name"
        | "customer_phone"
        | "delivery_zone_name"
        | "delivery_fee"
        | "status"
        | "ref_code"
        | "created_at"
        | "updated_at"
      >;
      analytics_events: TableDef<
        AnalyticsEvent,
        "shop_id" | "event_type" | "session_id",
        "id" | "product_id" | "created_at"
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
