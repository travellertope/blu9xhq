-- =============================================================================
-- BluuCRM — Multi-tenant Postgres schema
-- Run this in Supabase SQL editor (or via supabase db push)
-- =============================================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- =============================================================================
-- TENANTS
-- One row per BluuCRM account (agency / client of us).
-- Bluu Interactive itself is tenant #1 (seeded in seed.sql).
-- =============================================================================
create table if not exists tenants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,          -- used in subdomain routing
  plan          text not null default 'free' check (plan in ('free','starter','pro','agency')),
  status        text not null default 'active' check (status in ('active','suspended','churned')),
  logo_url      text,
  accent_colour text default '#2F5FE0',
  custom_domain text unique,
  stripe_customer_id text unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- TEAM MEMBERS  (admin / internal staff per tenant)
-- Links a Supabase auth user to a tenant with a CRM-level role.
-- =============================================================================
create table if not exists team_members (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  crm_role         text not null default 'viewer'
                     check (crm_role in ('super_admin','account_manager','billing_manager','support_staff','viewer')),
  status           text not null default 'active' check (status in ('active','deactivated')),
  assigned_clients uuid[],                     -- null = all clients visible
  wp_user_id       int,                         -- migration ref
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(tenant_id, user_id)
);

-- =============================================================================
-- CLIENT USERS  (contacts who log into the client portal)
-- =============================================================================
create table if not exists client_users (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   uuid,                            -- set after clients row is created
  wp_user_id  int,
  created_at  timestamptz not null default now(),
  unique(tenant_id, user_id)
);

-- =============================================================================
-- AFFILIATES  (global — no tenant_id; commissions are Bluu-side only)
-- =============================================================================
create table if not exists affiliates (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade unique,
  affiliate_code   text not null unique,
  status           text not null default 'pending' check (status in ('pending','active','suspended')),
  payout_method    text check (payout_method in ('stripe','paypal','bank')),
  payout_details   jsonb default '{}',
  wp_user_id       int,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- =============================================================================
-- CLIENTS  (companies / contacts managed by a tenant)
-- =============================================================================
create table if not exists clients (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references tenants(id) on delete cascade,
  -- Display
  company_name     text not null,
  contact_name     text not null,
  contact_email    text not null,
  contact_phone    text,
  company_website  text,
  industry         text,
  -- Portal
  portal_user_id   uuid references auth.users(id),  -- client_users.user_id
  -- Status
  status           text not null default 'onboarding'
                     check (status in ('active','inactive','churned','onboarding')),
  notes            text,
  tags             text[] default '{}',
  -- Migration
  wp_post_id       int,
  -- Timestamps
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Close the FK loop
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'client_users_client_id_fk'
  ) then
    alter table client_users
      add constraint client_users_client_id_fk
        foreign key (client_id) references clients(id) on delete set null;
  end if;
end;
$$;

-- =============================================================================
-- SERVICES  (service catalogue per tenant)
-- =============================================================================
create table if not exists services (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  title         text not null,
  description   text,
  category      text not null default 'other'
                  check (category in ('branding','web_design','web_development','seo',
                                      'social_media','content','ads','consulting','other')),
  base_price    numeric(12,2) not null default 0,
  currency      text not null default 'USD' check (currency in ('USD','GHS','NGN','GBP')),
  billing_cycle text not null default 'monthly'
                  check (billing_cycle in ('one_time','monthly','quarterly','annually')),
  deliverables  text[] default '{}',
  is_active     boolean not null default true,
  wp_post_id    int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================
create table if not exists subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  tenant_id               uuid not null references tenants(id) on delete cascade,
  client_id               uuid not null references clients(id) on delete cascade,
  service_id              uuid not null references services(id),
  status                  text not null default 'active'
                            check (status in ('active','paused','cancelled','past_due','trialing')),
  amount                  numeric(12,2) not null,
  currency                text not null default 'USD',
  billing_cycle           text not null default 'monthly'
                            check (billing_cycle in ('one_time','monthly','quarterly','annually')),
  next_billing_date       date,
  start_date              date not null default current_date,
  end_date                date,
  payment_gateway         text not null default 'manual'
                            check (payment_gateway in ('stripe','paystack','manual')),
  gateway_subscription_id text,
  notes                   text,
  wp_post_id              int,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- =============================================================================
-- INVOICES
-- =============================================================================
create table if not exists invoices (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id) on delete cascade,
  client_id          uuid not null references clients(id) on delete cascade,
  subscription_id    uuid references subscriptions(id),
  invoice_number     text not null,
  line_items         jsonb not null default '[]',
  subtotal           numeric(12,2) not null default 0,
  tax_rate           numeric(5,4) default 0,
  tax_amount         numeric(12,2) default 0,
  total              numeric(12,2) not null default 0,
  currency           text not null default 'USD',
  status             text not null default 'draft'
                       check (status in ('draft','sent','paid','overdue','void')),
  issued_date        date not null default current_date,
  due_date           date not null,
  paid_date          date,
  payment_gateway    text check (payment_gateway in ('stripe','paystack','manual')),
  gateway_payment_id text,
  payment_link       text,
  notes              text,
  pdf_url            text,
  wp_post_id         int,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique(tenant_id, invoice_number)
);

-- =============================================================================
-- FILES
-- =============================================================================
create table if not exists files (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references tenants(id) on delete cascade,
  client_id            uuid not null references clients(id) on delete cascade,
  title                text not null,
  description          text,
  category             text not null default 'other'
                         check (category in ('contract','brief','deliverable',
                                             'invoice_attachment','asset','report','other')),
  r2_key               text not null,
  r2_bucket            text not null,
  mime_type            text not null,
  file_size            bigint not null default 0,
  original_name        text not null,
  is_visible_to_client boolean not null default false,
  uploaded_by          uuid references auth.users(id),
  wp_post_id           int,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- =============================================================================
-- COMMUNICATIONS
-- =============================================================================
create table if not exists communications (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id) on delete cascade,
  client_id          uuid not null references clients(id) on delete cascade,
  direction          text not null default 'outbound'
                       check (direction in ('inbound','outbound','internal')),
  channel            text not null default 'email'
                       check (channel in ('email','whatsapp','phone','meeting','sms','other','system')),
  comm_type          text not null default 'manual'
                       check (comm_type in ('manual','email','system')),
  subject            text,
  body               text not null,
  occurred_at        timestamptz not null default now(),
  from_email         text,
  to_email           text,
  email_status       text check (email_status in ('sent','opened','replied','bounced')),
  -- Mood / AI
  mood               text check (mood in ('positive','neutral','mixed','concerned','at_risk')),
  mood_source        text check (mood_source in ('ai_accepted','ai_overridden','manual')),
  mood_reasoning     text,
  red_flags          text[] default '{}',
  follow_up_needed   boolean default false,
  follow_up_due      date,
  follow_up_completed boolean default false,
  -- Audit
  logged_by          uuid references auth.users(id),
  wp_post_id         int,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- =============================================================================
-- EMAIL TEMPLATES
-- =============================================================================
create table if not exists email_templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  title       text not null,
  subject     text not null,
  body_html   text not null,
  body_text   text,
  tmpl_type   text not null default 'general'
                check (tmpl_type in ('onboarding','invoice','follow_up','report','general','portal_invite')),
  merge_tags  text[] default '{}',
  wp_post_id  int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================================
-- SEQUENCES
-- =============================================================================
create table if not exists sequences (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  title       text not null,
  trigger     text not null default 'manual'
                check (trigger in ('client_onboarding','invoice_sent','invoice_overdue',
                                   'subscription_expiring','manual')),
  is_active   boolean not null default true,
  wp_post_id  int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists sequence_steps (
  id                  uuid primary key default gen_random_uuid(),
  sequence_id         uuid not null references sequences(id) on delete cascade,
  tenant_id           uuid not null references tenants(id) on delete cascade,
  step_number         int not null,
  delay_days          int not null default 0,
  email_template_id   uuid not null references email_templates(id),
  created_at          timestamptz not null default now(),
  unique(sequence_id, step_number)
);

-- =============================================================================
-- AFFILIATE CLICKS / CONVERSIONS / COMMISSIONS / PAYOUTS
-- These are Bluu-global (no tenant_id) — only super_admin can see all.
-- =============================================================================
create table if not exists affiliate_clicks (
  id             uuid primary key default gen_random_uuid(),
  affiliate_id   uuid not null references affiliates(id) on delete cascade,
  product        text not null
                   check (product in ('scan_tool','portal','hosting_mgmt',
                                      'content_ops','web_dev','ai_integration')),
  ip_address     text,
  user_agent     text,
  referrer       text,
  landing_page   text,
  clicked_at     timestamptz not null default now(),
  wp_post_id     int
);

create table if not exists affiliate_conversions (
  id               uuid primary key default gen_random_uuid(),
  affiliate_id     uuid not null references affiliates(id) on delete cascade,
  click_id         uuid references affiliate_clicks(id),
  product          text not null
                     check (product in ('scan_tool','portal','hosting_mgmt',
                                        'content_ops','web_dev','ai_integration')),
  conversion_type  text not null
                     check (conversion_type in ('saas_subscription','service_lead','project_signed')),
  client_name      text,
  status           text not null default 'pending'
                     check (status in ('pending','approved','rejected')),
  converted_at     timestamptz not null default now(),
  wp_post_id       int
);

create table if not exists affiliate_commissions (
  id                uuid primary key default gen_random_uuid(),
  affiliate_id      uuid not null references affiliates(id) on delete cascade,
  conversion_id     uuid not null references affiliate_conversions(id) on delete cascade,
  commission_type   text not null default 'initial' check (commission_type in ('initial','recurring')),
  period            text,                            -- e.g. "2025-01"
  gross_amount      numeric(12,2) not null,
  commission_rate   numeric(5,4) not null,
  commission_amount numeric(12,2) not null,
  status            text not null default 'pending'
                      check (status in ('pending','approved','paid','cancelled')),
  paid_at           timestamptz,
  product           text not null,
  wp_post_id        int,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists affiliate_payouts (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid not null references affiliates(id) on delete cascade,
  total_amount  numeric(12,2) not null,
  payout_method text not null check (payout_method in ('stripe','paypal','bank')),
  status        text not null default 'pending'
                  check (status in ('pending','processing','completed','failed')),
  initiated_at  timestamptz not null default now(),
  completed_at  timestamptz,
  transfer_ref  text,
  wp_post_id    int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =============================================================================
-- UPDATED_AT triggers
-- =============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'tenants','team_members','clients','services','subscriptions',
    'invoices','files','communications','email_templates','sequences',
    'sequence_steps','affiliates','affiliate_commissions','affiliate_payouts'
  ] loop
    execute format('drop trigger if exists trg_%s_updated_at on %s', tbl, tbl);
    execute format(
      'create trigger trg_%s_updated_at before update on %s
       for each row execute function set_updated_at()',
      tbl, tbl
    );
  end loop;
end;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table tenants               enable row level security;
alter table team_members          enable row level security;
alter table client_users          enable row level security;
alter table clients               enable row level security;
alter table services              enable row level security;
alter table subscriptions         enable row level security;
alter table invoices              enable row level security;
alter table files                 enable row level security;
alter table communications        enable row level security;
alter table email_templates       enable row level security;
alter table sequences             enable row level security;
alter table sequence_steps        enable row level security;
alter table affiliates            enable row level security;
alter table affiliate_clicks      enable row level security;
alter table affiliate_conversions enable row level security;
alter table affiliate_commissions enable row level security;
alter table affiliate_payouts     enable row level security;

-- ── Helper: extract tenant_id from the current user's JWT ────────────────────
-- Populated by the custom access token hook (see functions.sql).
create or replace function get_my_tenant_id()
returns uuid language sql stable as $$
  select nullif(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id'),
    ''
  )::uuid;
$$;

create or replace function get_my_user_type()
returns text language sql stable as $$
  select current_setting('request.jwt.claims', true)::jsonb ->> 'user_type';
$$;

create or replace function get_my_crm_role()
returns text language sql stable as $$
  select current_setting('request.jwt.claims', true)::jsonb ->> 'crm_role';
$$;

create or replace function is_team_member()
returns boolean language sql stable as $$
  select get_my_user_type() = 'team';
$$;

create or replace function is_client_user()
returns boolean language sql stable as $$
  select get_my_user_type() = 'client';
$$;

create or replace function is_affiliate_user()
returns boolean language sql stable as $$
  select get_my_user_type() = 'affiliate';
$$;

-- ── tenants ──────────────────────────────────────────────────────────────────
drop policy if exists "team can read own tenant" on tenants;
create policy "team can read own tenant"
  on tenants for select
  using (id = get_my_tenant_id() and is_team_member());

drop policy if exists "super_admin can update own tenant" on tenants;
create policy "super_admin can update own tenant"
  on tenants for update
  using (id = get_my_tenant_id() and get_my_crm_role() = 'super_admin');

-- ── team_members ─────────────────────────────────────────────────────────────
drop policy if exists "team can read own tenant members" on team_members;
create policy "team can read own tenant members"
  on team_members for select
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "super_admin can manage team members" on team_members;
create policy "super_admin can manage team members"
  on team_members for all
  using (tenant_id = get_my_tenant_id() and get_my_crm_role() = 'super_admin');

-- ── clients ──────────────────────────────────────────────────────────────────
drop policy if exists "team can read own tenant clients" on clients;
create policy "team can read own tenant clients"
  on clients for select
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "team can insert clients" on clients;
create policy "team can insert clients"
  on clients for insert
  with check (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "team can update clients" on clients;
create policy "team can update clients"
  on clients for update
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read own record" on clients;
create policy "client users can read own record"
  on clients for select
  using (
    is_client_user()
    and portal_user_id = auth.uid()
  );

-- ── services ─────────────────────────────────────────────────────────────────
drop policy if exists "team can manage services" on services;
create policy "team can manage services"
  on services for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read active services" on services;
create policy "client users can read active services"
  on services for select
  using (is_client_user() and is_active = true);

-- ── subscriptions ─────────────────────────────────────────────────────────────
drop policy if exists "team can manage subscriptions" on subscriptions;
create policy "team can manage subscriptions"
  on subscriptions for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read own subscriptions" on subscriptions;
create policy "client users can read own subscriptions"
  on subscriptions for select
  using (
    is_client_user()
    and client_id in (
      select id from clients where portal_user_id = auth.uid()
    )
  );

-- ── invoices ──────────────────────────────────────────────────────────────────
drop policy if exists "team can manage invoices" on invoices;
create policy "team can manage invoices"
  on invoices for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read own invoices" on invoices;
create policy "client users can read own invoices"
  on invoices for select
  using (
    is_client_user()
    and client_id in (
      select id from clients where portal_user_id = auth.uid()
    )
  );

-- ── files ─────────────────────────────────────────────────────────────────────
drop policy if exists "team can manage files" on files;
create policy "team can manage files"
  on files for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read visible files" on files;
create policy "client users can read visible files"
  on files for select
  using (
    is_client_user()
    and is_visible_to_client = true
    and client_id in (
      select id from clients where portal_user_id = auth.uid()
    )
  );

-- ── communications ────────────────────────────────────────────────────────────
drop policy if exists "team can manage communications" on communications;
create policy "team can manage communications"
  on communications for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

-- ── email_templates / sequences / sequence_steps ─────────────────────────────
drop policy if exists "team can manage email_templates" on email_templates;
create policy "team can manage email_templates"
  on email_templates for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "team can manage sequences" on sequences;
create policy "team can manage sequences"
  on sequences for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "team can manage sequence_steps" on sequence_steps;
create policy "team can manage sequence_steps"
  on sequence_steps for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

-- ── affiliates ────────────────────────────────────────────────────────────────
drop policy if exists "affiliate can read own record" on affiliates;
create policy "affiliate can read own record"
  on affiliates for select
  using (user_id = auth.uid() and is_affiliate_user());

drop policy if exists "affiliate can update own record" on affiliates;
create policy "affiliate can update own record"
  on affiliates for update
  using (user_id = auth.uid() and is_affiliate_user());

-- ── affiliate_clicks / conversions / commissions / payouts ───────────────────
drop policy if exists "affiliate reads own clicks" on affiliate_clicks;
create policy "affiliate reads own clicks"
  on affiliate_clicks for select
  using (affiliate_id in (select id from affiliates where user_id = auth.uid()));

drop policy if exists "affiliate reads own conversions" on affiliate_conversions;
create policy "affiliate reads own conversions"
  on affiliate_conversions for select
  using (affiliate_id in (select id from affiliates where user_id = auth.uid()));

drop policy if exists "affiliate reads own commissions" on affiliate_commissions;
create policy "affiliate reads own commissions"
  on affiliate_commissions for select
  using (affiliate_id in (select id from affiliates where user_id = auth.uid()));

drop policy if exists "affiliate reads own payouts" on affiliate_payouts;
create policy "affiliate reads own payouts"
  on affiliate_payouts for select
  using (affiliate_id in (select id from affiliates where user_id = auth.uid()));

-- =============================================================================
-- INDEXES  (most common query patterns)
-- =============================================================================
create index if not exists idx_team_members_tenant    on team_members(tenant_id);
create index if not exists idx_team_members_user      on team_members(user_id);
create index if not exists idx_client_users_tenant    on client_users(tenant_id);
create index if not exists idx_client_users_user      on client_users(user_id);
create index if not exists idx_clients_tenant         on clients(tenant_id);
create index if not exists idx_clients_portal_user    on clients(portal_user_id);
create index if not exists idx_subscriptions_client   on subscriptions(client_id);
create index if not exists idx_subscriptions_tenant   on subscriptions(tenant_id);
create index if not exists idx_invoices_client        on invoices(client_id);
create index if not exists idx_invoices_tenant        on invoices(tenant_id);
create index if not exists idx_invoices_status        on invoices(status);
create index if not exists idx_files_client           on files(client_id);
create index if not exists idx_communications_client  on communications(client_id);
create index if not exists idx_communications_tenant  on communications(tenant_id);
create index if not exists idx_aff_clicks_affiliate   on affiliate_clicks(affiliate_id);
create index if not exists idx_aff_conv_affiliate     on affiliate_conversions(affiliate_id);
create index if not exists idx_aff_comm_affiliate     on affiliate_commissions(affiliate_id);
create index if not exists idx_aff_payout_affiliate   on affiliate_payouts(affiliate_id);
create unique index if not exists idx_tenants_custom_domain on tenants(custom_domain) where custom_domain is not null;

-- =============================================================================
-- PUBLIC DOMAIN LOOKUP
-- Middleware resolves an inbound custom domain to a tenant slug before any
-- JWT/session exists, so it can't go through the normal RLS-gated tenants
-- table. This view runs with the privileges of its owner (bypassing RLS) and
-- exposes only the columns needed for that lookup — never add sensitive
-- columns (plan, stripe_customer_id, etc.) here.
-- =============================================================================
create or replace view public.tenant_domain_lookup as
select id, slug, custom_domain
from tenants
where custom_domain is not null and status = 'active';

grant select on public.tenant_domain_lookup to anon, authenticated;

-- =============================================================================
-- TENANT SETTINGS (bank details for invoices, business address, sender name)
-- Was a single WP-wide options singleton; now per-tenant columns matching the
-- existing logo_url/accent_colour pattern. bank_account_number and
-- bank_sort_code are AES-256 encrypted at rest (see lib/encryption.ts) — same
-- pattern as clients.contact_email/contact_phone.
-- =============================================================================
alter table tenants add column if not exists bank_name text;
alter table tenants add column if not exists bank_account_name text;
alter table tenants add column if not exists bank_account_number text;  -- encrypted
alter table tenants add column if not exists bank_sort_code text;       -- encrypted
alter table tenants add column if not exists address text;
alter table tenants add column if not exists from_email_name text;

-- =============================================================================
-- FILES — optional subscription link (WP has an equivalent optional field)
-- =============================================================================
alter table files add column if not exists subscription_id uuid references subscriptions(id);

-- =============================================================================
-- COMMUNICATIONS — client_id becomes optional so audit-log events that aren't
-- about one specific client (team/sequence-level actions) can still be
-- written as channel='system' rows.
-- =============================================================================
alter table communications alter column client_id drop not null;

-- =============================================================================
-- INVOICES — human-facing payment method (WP's inv_payment_method); distinct
-- from payment_gateway, which stays constrained to the three gateway
-- integrations. "Bank Transfer"/"Cash" aren't gateways, just how the admin
-- recorded a manual payment, so they live here uncontrolled.
-- =============================================================================
alter table invoices add column if not exists payment_method text;

-- =============================================================================
-- SUBSCRIPTIONS — status vocabulary + cancellation-request fields (WP ACF
-- fields with no Supabase equivalent yet; written by the client portal's
-- cancel flow, which stays on WordPress until that route is migrated)
-- =============================================================================
alter table subscriptions drop constraint if exists subscriptions_status_check;
alter table subscriptions add constraint subscriptions_status_check
  check (status in ('active','paused','cancelled','past_due','trialing','pending','cancellation_pending'));
alter table subscriptions add column if not exists sub_cancellation_requested_at timestamptz;
alter table subscriptions add column if not exists sub_cancellation_reason text;
alter table subscriptions add column if not exists sub_cancellation_note text;

-- =============================================================================
-- CLIENTS — portal/health/follow-up fields (were WP ACF fields with no column
-- equivalent yet; portal_email is denormalized from auth.users for cheap list
-- rendering, kept in sync whenever portal_user_id is set)
-- =============================================================================
alter table clients add column if not exists portal_email text;
alter table clients add column if not exists health_status text
  check (health_status in ('healthy','needs_attention','at_risk'));
alter table clients add column if not exists health_note text;
alter table clients add column if not exists health_overridden_at timestamptz;
alter table clients add column if not exists health_auto_score text;
alter table clients add column if not exists active_subscription_count int not null default 0;
alter table clients add column if not exists last_contacted_at timestamptz;
alter table clients add column if not exists portal_invited_at timestamptz;

-- =============================================================================
-- TICKETS
-- =============================================================================
create table if not exists tickets (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references tenants(id) on delete cascade,
  client_id            uuid not null references clients(id) on delete cascade,
  submitted_by         uuid references auth.users(id),
  assigned_to          uuid references auth.users(id),
  tkt_number           text not null,
  category             text not null default 'other'
                          check (category in ('content_feedback','delivery_query','retainer_question','technical_issue','billing','other')),
  priority             text not null default 'normal'
                          check (priority in ('low','normal','high','urgent')),
  status               text not null default 'open'
                          check (status in ('open','in_progress','awaiting_client','awaiting_internal','resolved','closed')),
  retainer_id          uuid references subscriptions(id),
  sla_response_target  timestamptz,
  sla_resolve_target   timestamptz,
  sla_alerted_at       timestamptz,
  first_response_at    timestamptz,
  resolved_at          timestamptz,
  closed_at            timestamptz,
  wp_post_id           int,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique(tenant_id, tkt_number)
);

create table if not exists ticket_replies (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references tickets(id) on delete cascade,
  tenant_id    uuid not null references tenants(id) on delete cascade,
  author_id    uuid references auth.users(id),
  body         text not null,
  reply_type   text not null default 'reply' check (reply_type in ('reply','internal_note')),
  wp_post_id   int,
  created_at   timestamptz not null default now()
);

create table if not exists ticket_status_log (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references tickets(id) on delete cascade,
  tenant_id    uuid not null references tenants(id) on delete cascade,
  changed_by   uuid references auth.users(id),
  from_status  text,
  to_status    text not null,
  note         text,
  changed_at   timestamptz not null default now(),
  wp_post_id   int
);

create table if not exists ticket_attachments (
  id           uuid primary key default gen_random_uuid(),
  ticket_id    uuid not null references tickets(id) on delete cascade,
  tenant_id    uuid not null references tenants(id) on delete cascade,
  reply_id     uuid references ticket_replies(id) on delete set null,
  uploaded_by  uuid references auth.users(id),
  file_name    text not null,
  r2_key       text not null,
  mime_type    text not null,
  size_kb      int not null default 0,
  wp_post_id   int,
  created_at   timestamptz not null default now()
);

alter table tickets            enable row level security;
alter table ticket_replies     enable row level security;
alter table ticket_status_log  enable row level security;
alter table ticket_attachments enable row level security;

-- ── tickets ──────────────────────────────────────────────────────────────────
drop policy if exists "team can manage tickets" on tickets;
create policy "team can manage tickets"
  on tickets for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read own tickets" on tickets;
create policy "client users can read own tickets"
  on tickets for select
  using (
    is_client_user()
    and client_id in (select id from clients where portal_user_id = auth.uid())
  );

drop policy if exists "client users can create own tickets" on tickets;
create policy "client users can create own tickets"
  on tickets for insert
  with check (
    is_client_user()
    and client_id in (select id from clients where portal_user_id = auth.uid())
  );

-- ── ticket_replies ───────────────────────────────────────────────────────────
drop policy if exists "team can manage ticket replies" on ticket_replies;
create policy "team can manage ticket replies"
  on ticket_replies for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read own ticket replies" on ticket_replies;
create policy "client users can read own ticket replies"
  on ticket_replies for select
  using (
    is_client_user()
    and reply_type = 'reply'
    and ticket_id in (
      select t.id from tickets t
      join clients c on c.id = t.client_id
      where c.portal_user_id = auth.uid()
    )
  );

drop policy if exists "client users can reply to own tickets" on ticket_replies;
create policy "client users can reply to own tickets"
  on ticket_replies for insert
  with check (
    is_client_user()
    and reply_type = 'reply'
    and ticket_id in (
      select t.id from tickets t
      join clients c on c.id = t.client_id
      where c.portal_user_id = auth.uid()
    )
  );

-- ── ticket_status_log ────────────────────────────────────────────────────────
drop policy if exists "team can manage ticket status log" on ticket_status_log;
create policy "team can manage ticket status log"
  on ticket_status_log for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

-- ── ticket_attachments ───────────────────────────────────────────────────────
drop policy if exists "team can manage ticket attachments" on ticket_attachments;
create policy "team can manage ticket attachments"
  on ticket_attachments for all
  using (tenant_id = get_my_tenant_id() and is_team_member());

drop policy if exists "client users can read own ticket attachments" on ticket_attachments;
create policy "client users can read own ticket attachments"
  on ticket_attachments for select
  using (
    is_client_user()
    and ticket_id in (
      select t.id from tickets t
      join clients c on c.id = t.client_id
      where c.portal_user_id = auth.uid()
    )
  );

drop trigger if exists trg_tickets_updated_at on tickets;
create trigger trg_tickets_updated_at before update on tickets
  for each row execute function set_updated_at();

create index if not exists idx_tickets_tenant            on tickets(tenant_id);
create index if not exists idx_tickets_client             on tickets(client_id);
create index if not exists idx_tickets_status             on tickets(status);
create index if not exists idx_ticket_replies_ticket      on ticket_replies(ticket_id);
create index if not exists idx_ticket_replies_tenant      on ticket_replies(tenant_id);
create index if not exists idx_ticket_status_log_ticket   on ticket_status_log(ticket_id);
create index if not exists idx_ticket_attachments_ticket  on ticket_attachments(ticket_id);
