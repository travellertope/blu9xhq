-- =============================================================================
-- BluuShop — Postgres schema (Phase 1)
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- Single-role model: a shop has exactly one owner (auth.uid()) in Phase 1.
-- No tenant/JWT-claims layer like BluuCRM — ownership is just
-- `shops.owner_user_id = auth.uid()`. Multi-staff accounts are a Phase 3+
-- concern (Pro tier) and can be added without reshaping this schema.
-- =============================================================================

create extension if not exists pgcrypto;

-- =============================================================================
-- SHOPS
-- =============================================================================
create table if not exists shops (
  id              uuid primary key default gen_random_uuid(),
  owner_user_id   uuid not null references auth.users(id) on delete cascade,
  slug            text not null unique,                 -- shop.bluuhq.com/:slug
  name            text not null,
  whatsapp_number text not null,                         -- E.164, e.g. +2348012345678
  currency        text not null default 'NGN',
  logo_url        text,
  cover_url       text,
  tagline         text,
  delivery_info   text,
  instagram_url   text,
  tiktok_url      text,
  facebook_url    text,
  x_url           text,
  plan            text not null default 'free'
                    check (plan in ('free', 'starter', 'pro')),
  theme_id        text not null default 'minimal',        -- gated on Starter/Pro (Phase 2)
  accent_color    text,                                   -- gated on Starter/Pro (Phase 2)
  font_id         text not null default 'inter',           -- gated on Starter/Pro (Phase 2)
  custom_domain   text unique,                             -- Phase 3
  branding_hidden boolean not null default false,          -- Phase 3
  stripe_customer_id text unique,                          -- Phase 3
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists shops_owner_idx on shops(owner_user_id);

-- Safe to re-run against a shop already created before these columns
-- existed — `create table if not exists` above won't add columns to a
-- table that's already there.
alter table shops add column if not exists instagram_url text;
alter table shops add column if not exists tiktok_url text;
alter table shops add column if not exists facebook_url text;
alter table shops add column if not exists x_url text;

-- =============================================================================
-- CATEGORIES
-- =============================================================================
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid not null references shops(id) on delete cascade,
  name       text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_shop_idx on categories(shop_id);

-- =============================================================================
-- PRODUCTS
-- =============================================================================
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  shop_id           uuid not null references shops(id) on delete cascade,
  category_id       uuid references categories(id) on delete set null,
  name              text not null,
  description       text,
  price             numeric(12, 2) not null,
  compare_at_price  numeric(12, 2),
  images            jsonb not null default '[]'::jsonb,   -- string[] of R2 URLs
  variants          jsonb not null default '[]'::jsonb,   -- [{name, options: string[]}]
  stock_qty         int,                                   -- null = untracked/unlimited
  active            boolean not null default true,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_shop_idx on products(shop_id);
create index if not exists products_category_idx on products(category_id);

-- =============================================================================
-- DELIVERY ZONES
-- Structured delivery/pickup options with a flat fee, shown as a picker in
-- the shopper's cart. Replaces relying solely on the freeform
-- shops.delivery_info text (kept as a fallback for shops with no zones set).
-- =============================================================================
create table if not exists delivery_zones (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid not null references shops(id) on delete cascade,
  name       text not null,
  fee        numeric(12, 2) not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists delivery_zones_shop_idx on delivery_zones(shop_id);

-- =============================================================================
-- ORDER INTENTS
-- Logged when a shopper taps "Checkout" — NOT a confirmed sale. Status past
-- "new" is always a manual update by the shop owner after the WhatsApp
-- conversation plays out; there is no payment processor in this loop.
-- =============================================================================
create table if not exists order_intents (
  id                 uuid primary key default gen_random_uuid(),
  shop_id            uuid not null references shops(id) on delete cascade,
  customer_name      text,
  customer_phone     text,
  items              jsonb not null,   -- [{product_id, name, price, qty, variant}]
  subtotal           numeric(12, 2) not null,
  delivery_zone_name text,
  delivery_fee       numeric(12, 2) not null default 0,
  status             text not null default 'new'
                       check (status in ('new', 'contacted', 'confirmed', 'fulfilled', 'cancelled')),
  whatsapp_message   text not null,
  ref_code           text,             -- affiliate attribution, Phase 3
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists order_intents_shop_idx on order_intents(shop_id);
create index if not exists order_intents_status_idx on order_intents(shop_id, status);

-- Safe to re-run against shops/orders already created before this column existed.
alter table order_intents add column if not exists delivery_zone_name text;
alter table order_intents add column if not exists delivery_fee numeric(12, 2) not null default 0;

-- =============================================================================
-- ANALYTICS EVENTS
-- =============================================================================
create table if not exists analytics_events (
  id         uuid primary key default gen_random_uuid(),
  shop_id    uuid not null references shops(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'add_to_cart', 'checkout_click')),
  product_id uuid references products(id) on delete set null,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_shop_idx on analytics_events(shop_id, created_at desc);

-- =============================================================================
-- updated_at triggers
-- =============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists shops_set_updated_at on shops;
create trigger shops_set_updated_at before update on shops
  for each row execute function set_updated_at();

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists order_intents_set_updated_at on order_intents;
create trigger order_intents_set_updated_at before update on order_intents
  for each row execute function set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table shops            enable row level security;
alter table categories       enable row level security;
alter table products         enable row level security;
alter table delivery_zones   enable row level security;
alter table order_intents    enable row level security;
alter table analytics_events enable row level security;

-- ── shops ────────────────────────────────────────────────────────────────────
-- Public can read active shops (storefront needs this with no auth at all).
drop policy if exists "public can read active shops" on shops;
create policy "public can read active shops"
  on shops for select
  using (active = true);

drop policy if exists "owner can manage own shop" on shops;
create policy "owner can manage own shop"
  on shops for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- ── categories ───────────────────────────────────────────────────────────────
drop policy if exists "public can read categories of active shops" on categories;
create policy "public can read categories of active shops"
  on categories for select
  using (exists (select 1 from shops where shops.id = categories.shop_id and shops.active = true));

drop policy if exists "owner can manage own categories" on categories;
create policy "owner can manage own categories"
  on categories for all
  using (exists (select 1 from shops where shops.id = categories.shop_id and shops.owner_user_id = auth.uid()))
  with check (exists (select 1 from shops where shops.id = categories.shop_id and shops.owner_user_id = auth.uid()));

-- ── products ─────────────────────────────────────────────────────────────────
drop policy if exists "public can read active products of active shops" on products;
create policy "public can read active products of active shops"
  on products for select
  using (
    active = true
    and exists (select 1 from shops where shops.id = products.shop_id and shops.active = true)
  );

drop policy if exists "owner can manage own products" on products;
create policy "owner can manage own products"
  on products for all
  using (exists (select 1 from shops where shops.id = products.shop_id and shops.owner_user_id = auth.uid()))
  with check (exists (select 1 from shops where shops.id = products.shop_id and shops.owner_user_id = auth.uid()));

-- ── delivery_zones ───────────────────────────────────────────────────────────
drop policy if exists "public can read delivery zones of active shops" on delivery_zones;
create policy "public can read delivery zones of active shops"
  on delivery_zones for select
  using (exists (select 1 from shops where shops.id = delivery_zones.shop_id and shops.active = true));

drop policy if exists "owner can manage own delivery zones" on delivery_zones;
create policy "owner can manage own delivery zones"
  on delivery_zones for all
  using (exists (select 1 from shops where shops.id = delivery_zones.shop_id and shops.owner_user_id = auth.uid()))
  with check (exists (select 1 from shops where shops.id = delivery_zones.shop_id and shops.owner_user_id = auth.uid()));

-- ── order_intents ────────────────────────────────────────────────────────────
-- Anyone (including anon shoppers) can create an order intent; only the
-- shop owner can read or update them.
drop policy if exists "anyone can create order intents" on order_intents;
create policy "anyone can create order intents"
  on order_intents for insert
  with check (exists (select 1 from shops where shops.id = order_intents.shop_id and shops.active = true));

drop policy if exists "owner can read own order intents" on order_intents;
create policy "owner can read own order intents"
  on order_intents for select
  using (exists (select 1 from shops where shops.id = order_intents.shop_id and shops.owner_user_id = auth.uid()));

drop policy if exists "owner can update own order intents" on order_intents;
create policy "owner can update own order intents"
  on order_intents for update
  using (exists (select 1 from shops where shops.id = order_intents.shop_id and shops.owner_user_id = auth.uid()));

-- ── analytics_events ─────────────────────────────────────────────────────────
drop policy if exists "anyone can log analytics events" on analytics_events;
create policy "anyone can log analytics events"
  on analytics_events for insert
  with check (exists (select 1 from shops where shops.id = analytics_events.shop_id and shops.active = true));

drop policy if exists "owner can read own analytics" on analytics_events;
create policy "owner can read own analytics"
  on analytics_events for select
  using (exists (select 1 from shops where shops.id = analytics_events.shop_id and shops.owner_user_id = auth.uid()));
