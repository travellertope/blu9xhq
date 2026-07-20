# BluuShop — Full Build Plan

> Free, mobile-first storefront builder for small business owners — full
> catalog and cart, checkout handed off to WhatsApp instead of a payment
> processor. Four-phase roadmap from MVP catalog to paid theming/automation.

---

# Phase 1 — MVP: Shop Creation, Catalog, WhatsApp Checkout

> **Goal:** A small business owner can create a shop from their phone, add
> products with photos, and have customers browse, build a cart, and hand
> off to WhatsApp with an itemized order message — no payment processor,
> no login required for shoppers.

## Architecture Overview

```
shop.bluuhq.com (Next.js 14 — standalone app, own Supabase project)
├── /[slug]                          ← public storefront (SSR per shop)
├── /[slug]/product/[id]             ← product detail
├── /dashboard                       ← owner's mobile-first admin
│   ├── /dashboard/products          ← CRUD + photo upload
│   ├── /dashboard/orders            ← order-intent list, manual status
│   ├── /dashboard/settings          ← branding, WhatsApp number, theme (Ph.2+)
│   └── /dashboard/billing           ← plan + upgrade (Ph.3)
├── /api/shops                       ← create/update shop
├── /api/products                    ← CRUD
├── /api/order-intents               ← log checkout-click events
└── /api/uploads                     ← image upload → Cloudflare R2

Shopper flow (no backend session):
  Storefront → client-side cart (localStorage) → "Checkout" button
  → builds wa.me/<merchant_number>?text=<encoded order summary>
  → opens WhatsApp app/web with message pre-filled
  → deal closes entirely inside the WhatsApp chat
```

Standalone app + its own Supabase project (not built on BluuCRM's tenant
infrastructure) — same isolation model as `scan-tool`. Keeps a
consumer-facing, high-signup-volume product from touching BluuCRM's
agency-client data, at the cost of duplicating some auth/billing plumbing
already solved once in `crm/`.

## Data Model

```
shops
  id                 uuid
  owner_user_id      uuid
  slug               text unique         -- shop.bluuhq.com/:slug
  name               text
  whatsapp_number    text                -- E.164 format
  currency           text default 'NGN'
  logo_url           text
  cover_url          text
  tagline            text
  delivery_info      text
  plan               text default 'free' -- free | starter | pro
  theme_id           text default 'minimal'   -- Ph.2, gated
  accent_color       text                     -- Ph.2, gated (fixed on free)
  font_id            text default 'inter'     -- Ph.2, gated
  custom_domain      text                     -- Ph.3, gated
  branding_hidden    boolean default false    -- Ph.3, gated
  created_at         timestamptz

categories
  id, shop_id, name, sort_order

products
  id                 uuid
  shop_id            uuid
  category_id        uuid nullable
  name               text
  description        text
  price              numeric
  compare_at_price   numeric nullable   -- shows a strikethrough "sale" price
  images             jsonb              -- array of R2 URLs
  variants           jsonb              -- [{name:"Size", options:["S","M","L"]}]
  stock_qty          integer nullable   -- null = untracked/unlimited
  active             boolean default true
  sort_order         integer

order_intents
  id                 uuid
  shop_id            uuid
  customer_name      text nullable
  customer_phone     text nullable
  items              jsonb              -- snapshot: [{product_id,name,price,qty,variant}]
  subtotal           numeric
  status             text default 'new' -- new | contacted | confirmed | fulfilled | cancelled
  whatsapp_message   text               -- the exact text sent
  created_at, updated_at

analytics_events
  id, shop_id, event_type (view|add_to_cart|checkout_click),
  product_id nullable, session_id, created_at
```

`order_intents.status` is the one field the whole product's honesty rests
on: past "new," every transition is the owner manually updating status
after the WhatsApp conversation plays out. There is no automatic "paid"
signal in Phase 1 — the dashboard must say so plainly, not imply otherwise.

## Deliverables

### 1. Shop creation

**Route:** `app/(onboarding)/create/page.tsx`

- Email or phone sign-up (Supabase Auth, magic-link)
- Name → auto-slug (same `toSlug()` pattern already used in
  `crm/app/(auth)/signup/page.tsx`) → WhatsApp number → done
- Every field editable later; nothing blocks getting to a live shop URL

### 2. Mobile product management

**Route:** `app/dashboard/products/page.tsx`, `app/dashboard/products/[id]/page.tsx`

- "Quick add": camera/gallery picker → name → price → save, target <30s
- Full edit (description, variants, stock, category, sale price) one tap deeper
- Touch drag-to-reorder for product and category lists
- Images upload directly to Cloudflare R2 (same bucket pattern as
  `crm`'s file storage), client-compressed before upload to control cost

### 3. Public storefront

**Route:** `app/[slug]/page.tsx`

- SSR per shop slug, single default theme in Phase 1 ("Minimal")
- Category filter, product grid, product detail modal/page
- No login for shoppers — cart lives in `localStorage`

### 4. Cart + WhatsApp checkout

**File:** `lib/cart.ts`, `components/checkout-button.tsx`

- Client-side cart: add/remove/adjust qty, persisted in `localStorage`
- "Checkout" button:
  1. Builds itemized text (name, variant, qty, price, subtotal, total)
  2. POSTs to `/api/order-intents` to log the intent server-side
  3. Redirects to `https://wa.me/<number>?text=<encoded message>`
- If the request arrives with `?ref=CODE` (affiliate traffic, Phase 3),
  carry it into the order-intent record for attribution

### 5. Owner order view

**Route:** `app/dashboard/orders/page.tsx`

- List of order intents, newest first, tap to advance status
  (new → contacted → confirmed → fulfilled/cancelled)
- No automation in Phase 1 — purely a manual log the owner keeps current

## Environment Variables

```bash
# Supabase (own project, separate from crm/)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=bluushop-uploads
CLOUDFLARE_R2_PUBLIC_URL=

# App
NEXT_PUBLIC_APP_URL=https://shop.bluuhq.com
```

## File Structure (after Phase 1)

```
shop-tool/
├── app/
│   ├── (onboarding)/create/page.tsx
│   ├── [slug]/page.tsx
│   ├── [slug]/product/[id]/page.tsx
│   ├── dashboard/
│   │   ├── products/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── orders/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── shops/route.ts
│       ├── products/route.ts
│       ├── order-intents/route.ts
│       └── uploads/route.ts
├── lib/
│   ├── cart.ts
│   ├── supabase/{client,server}.ts
│   └── whatsapp.ts          -- message-building + wa.me URL construction
└── components/
    ├── product-card.tsx
    ├── checkout-button.tsx
    └── storefront/*
```

## Implementation Order

1. Supabase project + schema (`shops`, `categories`, `products`)
2. Shop creation flow + owner auth
3. Product CRUD + R2 image upload
4. Public storefront (read-only render of a shop's products)
5. Client-side cart
6. WhatsApp message builder + checkout handoff + order-intent logging
7. Owner order list + manual status updates

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| WhatsApp integration | `wa.me` deep links | Free, no Meta approval, ships immediately; Cloud API is a Phase 4 upsell |
| Backend | Standalone app + own Supabase project | Isolation from BluuCRM's agency-client data, matches `scan-tool` precedent |
| Shop URLs | Path-based (`shop.bluuhq.com/:slug`) | No wildcard DNS/SSL needed before shop #1 launches |
| Shopper auth | None | Frictionless browsing/cart is the entire point; only owners authenticate |
| Image storage | Cloudflare R2 | Already proven in `crm/` file storage, cheap egress |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| "Order intent" reads as a fake/broken checkout | UI is explicit about "Checkout via WhatsApp" at every step; dashboard never implies a payment was captured |
| Slug squatting (popular business names taken first) | First-come-first-served for Phase 1; no dispute process yet — revisit if it becomes a support burden |
| Free-tier image storage costs scale unbounded | Client-side compression before upload + a per-shop storage cap mirroring `PLAN_LIMITS.fileStorageMB` in `crm/lib/planLimits.ts` |
| WhatsApp number exposed in every generated link | Inherent to the mechanic — mitigate abuse with checkout-click rate limiting per session/IP, not number-hiding |

---
---

# Phase 2 — Merchant Experience & Theming

> **Goal:** Storefronts stop looking identical. Owners get real
> customization (themes, accent color, fonts), better catalog tools
> (categories, variants, delivery info), and visibility into what's
> actually happening on their shop.

## 2.1 Theme System (Starter/Pro gated)

- **Free tier:** locked to "Minimal" theme, BluuHQ blue accent, Inter font — zero decisions, still looks polished
- **Starter/Pro:** choice of 3 themes to start —
  - *Minimal* — clean grid, generous whitespace (default)
  - *Boutique* — soft rounded cards, larger photography, serif heading pairing (fashion/beauty)
  - *Market* — dense grid, bold sale badges, compact cards (groceries/general stores)
- Custom accent color (hex/swatch picker) → overrides a single `--shop-accent` CSS variable each theme is built around
- Font pairing picker, curated not free-text — Inter, Manrope/Poppins, Playfair Display + Inter, Space Grotesk (4–5 pairs via `next/font`)
- **Scope discipline:** each theme is a distinct layout + component set, not a recolor — cap at 3 for launch, no custom CSS injection

## 2.2 Categories & Variants

- Multi-category support with drag reorder (already scaffolded in Phase 1 schema)
- Variant selection on the storefront (e.g., Size/Color pickers) feeding into the WhatsApp order message and the `order_intents.items` snapshot

## 2.3 Delivery & Fulfillment Info

- Shop-level delivery/pickup text field (Phase 1) becomes structured:
  delivery zones + flat fees, shown in cart before checkout, included in
  the WhatsApp message so the buyer doesn't have to ask

## 2.4 Basic Analytics Dashboard

**Route:** `app/dashboard/analytics/page.tsx`

- Funnel: views → add-to-cart → checkout-click, per product and shop-wide
- Pulls from `analytics_events` (Phase 1 schema, unused until now)

## 2.5 Order Status Workflow

- Same `order_intents.status` field, now with a proper Kanban-style
  dashboard view (new / contacted / confirmed / fulfilled columns)
  instead of a flat list

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Theme count at launch | 3, not more | Each is real design+build work; better to have 3 solid themes than 6 half-finished |
| Font selection | Curated pairs only | Avoids decision paralysis and off-brand combinations |
| Feature gating | Plan check mirrors `planAllows()` in `crm/lib/planLimits.ts` | Proven pattern already in the codebase |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Theme system scope creep | Hard cap at 3 themes / 5 fonts for this phase; new themes are a backlog item, not a moving target |
| Analytics feel disconnected from real sales (no payment confirmation) | Frame explicitly as "interest" metrics (views, clicks), never "revenue" |

---
---

# Phase 3 — Monetization & Ecosystem Integration

> **Goal:** Paid tiers exist and are enforced, BluuShop plugs into the
> same affiliate/commission system every other Bluu product uses, and it
> gets a stable WordPress marketing presence.

## 3.1 Pricing Tiers

| | Free | Starter | Pro |
|---|---|---|---|
| Products | 20 | 100 | Unlimited |
| Theme | Minimal only | Choice of 3 | Choice of 3 |
| Accent color / fonts | Fixed | Custom | Custom |
| Checkout | wa.me link | wa.me link | WhatsApp Business API (Ph.4) |
| Branding | "Powered by BluuHQ" | Removed | Removed |
| Custom domain | — | ✓ | ✓ |
| Staff accounts | 1 | 1 | Multiple |
| Analytics | Basic | Full funnel | Full funnel |

## 3.2 Stripe Integration

Mirrors `crm/lib/stripe-products.ts` almost exactly:

```ts
export const PLAN_DETAILS: Record<ShopPlan, PlanDetails> = {
  free:    { name: "Free",    monthlyUsd: 0,  annualUsd: 0 },
  starter: { name: "Starter", monthlyUsd: 15, annualUsd: 150 },
  pro:     { name: "Pro",     monthlyUsd: 39, annualUsd: 390 },
};
```

Webhook handler follows the same `invoice.parent.subscription_details.subscription`
pattern already fixed in both `crm` and `scan-tool` webhooks — copy that
implementation directly rather than re-deriving it.

## 3.3 Custom Domains

Same white-label pattern as `crm`'s `tenant_domain_lookup` — a shop can
point its own domain at its storefront on Starter/Pro.

## 3.4 Affiliate Program Hookup

- New product code `shop_tool` added everywhere the others already live:
  - `crm/app/api/affiliates/event/route.ts` Zod enum
  - Commission-rate maps (`crm/app/api/webhooks/stripe/route.ts`, `event/route.ts`)
  - `PRODUCT_LABELS` maps across the 4 admin/affiliate pages
  - `crm/app/affiliate/links/page.tsx` PRODUCTS array → points at the stable `/shop` WP page, not the app directly (same reasoning as BluuAudit's affiliate links)
- Commission rate: recurring SaaS tier, so 30% — same bracket as `scan_tool`/`portal` in `crm/app/api/webhooks/stripe/route.ts`

## 3.5 WordPress Marketing Presence

- New card in the WP mega menu's Softwares panel (`bluu_softwares_data()` in `theme/functions.php`)
- Stable `theme/page-shop.php` following the exact `page-audit.php`/`page-crm.php` convention — Template Name docblock, hardcoded content arrays, `get_header()`/`get_footer()`, every CTA pointing at `shop.bluuhq.com`

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Commission rate | 30% recurring | Matches existing SaaS-tier products, no reason to treat BluuShop differently |
| Marketing page | New WP page, not reused `/crm`/`/audit` pattern content | Different product, same convention — copy the pattern, not the content |
| Webhook implementation | Copy the already-fixed `invoice.parent.subscription_details` pattern verbatim | Avoid re-introducing the Stripe SDK v22 bug fixed twice already this project |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Reintroducing the Stripe Invoice.subscription bug | Copy the fixed webhook code directly from `crm`/`scan-tool` rather than writing it fresh |
| Affiliate product code drift (forgetting one of the 4+ places `scan_tool`-style codes appear) | Grep for `scan_tool` across the repo as a checklist template when adding `shop_tool` |

---
---

# Phase 4 — Growth Features

> **Goal:** For merchants who outgrow manual WhatsApp reconciliation,
> give Pro tier a path to real automation — and give BluuShop itself a
> path to more organic discovery.

## 4.1 WhatsApp Business Cloud API (Pro tier)

- Meta Business verification + phone number registration (per-shop or a
  shared BluuHQ-verified sender — needs a decision once volume is real)
- Structured order messages via the Business API instead of a plain
  `wa.me` link
- Webhook-driven status updates: customer reply → dashboard order status
  advances automatically instead of the owner tapping through manually
- This is additive, not a replacement — Free/Starter keep `wa.me` links indefinitely

## 4.2 Advanced Analytics

- Full conversion funnel with drop-off points, top products, repeat-visitor detection (session-based, no shopper login)

## 4.3 Public Directory (optional)

- Opt-in directory of BluuShop storefronts at `shop.bluuhq.com/discover`
  for cross-promotion — needs its own moderation/quality bar before
  shipping, not a default-on feature

## 4.4 Reviews

- Lightweight, shop-level (not per-product) to start — avoids building a
  fake-review moderation problem before there's real traffic to justify it

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Business API rollout | Pro tier only, opt-in | Real cost (Meta fees) and setup burden shouldn't hit free/starter shops |
| Directory | Opt-in, deferred until real shop volume exists | Prevents an empty or low-quality directory from being anyone's first impression |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Business API costs surprise Pro-tier merchants | Transparent per-conversation cost estimate shown before enabling, not buried in fine print |
| Directory becomes a spam/low-quality showcase | Manual approval queue before a shop appears publicly |

---

# Cross-Phase Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| **Phase 1** | 4-5 weeks | Live shop with mobile product management and working WhatsApp checkout |
| **Phase 2** | 3-4 weeks | Theming, categories/variants, delivery info, basic analytics |
| **Phase 3** | 3-4 weeks | Stripe billing live, affiliate program integrated, WP marketing page |
| **Phase 4** | 4-6 weeks | WhatsApp Business API for Pro, advanced analytics, directory |

**Total estimated:** 14-19 weeks to full product.

---

# Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (magic-link) |
| Database | Supabase Postgres (own project) |
| Image storage | Cloudflare R2 |
| Checkout | `wa.me` deep links (Ph.1-3) → WhatsApp Business Cloud API (Ph.4, Pro tier) |
| Payments | Stripe (Ph.3+) |
| Hosting | Vercel |
| Domain | shop.bluuhq.com |
