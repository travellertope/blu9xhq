# Bluu Affiliate Network — Full System Plan

> Affiliate marketing network spanning all Bluu products and services.
> Open enrollment · Native build · Dashboard at crm.bluuhq.com

---

## 1. Product Portfolio & Commission Structure

| Product / Service | Type | Commission | Trigger |
|---|---|---|---|
| BluuAudit | SaaS — recurring | **30% MRR** | Every Stripe `invoice.paid` while customer active |
| Client Portal | SaaS — recurring | **30% MRR** | Every Stripe `invoice.paid` while customer active |
| Hosting & Management | Managed retainer | **30% MRR** | Every invoice paid while contract active |
| Content Operations | Service retainer | **15% MRR** | Every invoice paid while retainer active |
| Web / Mobile Development | Project | **10% of contract** | On first invoice paid (after sign) |
| AI Systems Integration | Project / retainer | **10% of contract** | On first invoice paid; 10% of each retainer invoice |

**Discovery call bonus:** $75 paid when a referred lead books + completes a discovery call (service products only — Content Ops, Web Dev, AI Integration).

---

## 2. System Architecture

```
bluuhq.com (WordPress)
├── /affiliates                         ← landing page (this plugin)
├── /affiliates/register → portal       ← redirect with ?email= pre-fill
└── WP REST API                         ← user creation for bluu_affiliate role

crm.bluuhq.com (Next.js 14)
├── /affiliate/*                        ← affiliate dashboard (new section)
├── /affiliate-login                    ← dedicated login page
├── /api/affiliates/register            ← open enrollment sign-up
├── /api/affiliates/track               ← click tracking ingestion
├── /api/affiliates/event               ← conversion events from other apps (internal)
├── /api/affiliates/payout              ← payout request
└── /api/cron/affiliate-commissions     ← monthly commission calculation job

scan.bluuhq.com (Next.js)
├── middleware.ts                       ← reads ?ref= → sets bluu_ref cookie
└── /api/billing/webhook/route.ts       ← fires to portal /api/affiliates/event
                                           on subscription created / invoice paid

bluuhq.com (WordPress — all pages)
└── Cloudflare Worker / functions.php   ← reads ?ref= → sets bluu_ref cookie
```

### Cross-App Attribution Flow

```
1. Affiliate shares:  https://scan.bluuhq.com/?ref=ALICE30
2. Visitor lands on scan.bluuhq.com — middleware detects ?ref=ALICE30
3. Sets cookie:  bluu_ref=ALICE30  (domain: scan.bluuhq.com, 60 days, SameSite=Lax)
4. Visitor subscribes → Stripe checkout → subscription created
5. scan-tool /api/billing/webhook fires internal event to portal:
   POST crm.bluuhq.com/api/affiliates/event
   { secret: BLUU_INTERNAL_SECRET, event: "new_subscription",
     ref: "ALICE30", product: "scan_tool",
     stripe_customer_id: "cus_xxx", stripe_subscription_id: "sub_xxx" }
6. Portal validates secret, records AffiliateConversion, credits pending commission
7. On subsequent invoice.paid events → portal records AffiliateCommission rows
```

Same flow applies when ?ref= lands on bluuhq.com (WordPress) — a small
functions.php hook reads the param and sets a first-party cookie.

---

## 3. Data Model

All affiliate data lives in WordPress (as CPTs or user meta), queryable from
the portal via WPGraphQL or the REST API — matching the existing pattern.

### 3a. WordPress: New User Role

```
bluu_affiliate
```

Registered alongside `bluu_client`, `bluu_admin`, `bluu_team` in `bluuhq-cpts.php`.

### 3b. WordPress: Affiliate User Meta

```
bluu_affiliate_code          string   Unique referral code (e.g. "ALICE30")
bluu_affiliate_status        string   pending | active | suspended
bluu_affiliate_payout_method string   stripe | paypal | bank
bluu_affiliate_payout_details string  JSON — Stripe Connect acct ID or PayPal email
bluu_affiliate_agreed_at     string   ISO timestamp of T&C acceptance
bluu_affiliate_notes         string   Internal admin notes
```

### 3c. WordPress: New Custom Post Types

**`bluu_aff_click`** — one record per tracked click

```
post_title:  "{affiliate_code} — {date}"
meta:
  aff_code         string   Affiliate code clicked
  landing_url      string   Full URL visitor landed on
  source_domain    string   Referrer domain (if present)
  ip_hash          string   SHA-256 of IP (fraud detection, not raw)
  ua_hash          string   SHA-256 of User-Agent
  converted        bool     True if this click led to a conversion
  converted_at     string   ISO timestamp
```

**`bluu_aff_conversion`** — one record per referred customer sign-up or lead

```
post_title:  "{affiliate_code} — {product} — {date}"
meta:
  aff_code              string
  aff_wp_user_id        int
  click_post_id         int    (linked bluu_aff_click if matched)
  product               string scan_tool | portal | hosting_mgmt | content_ops | web_dev | ai_integration
  conversion_type       string saas_subscription | service_lead | project_signed
  stripe_customer_id    string
  stripe_subscription_id string
  contract_value        float  (project-based only)
  client_wp_post_id     int    (portal client post, if service lead)
  status                string pending | approved | rejected
  approved_at           string
```

**`bluu_aff_commission`** — one row per commission payment owed

```
post_title:  "{affiliate_code} — {period}"
meta:
  aff_code          string
  aff_wp_user_id    int
  conversion_post_id int
  commission_type   string initial | recurring
  period            string "2026-07" (for recurring) or "one-time"
  gross_amount      float  (customer paid)
  commission_rate   float  0.30, 0.15, 0.10
  commission_amount float  (gross × rate)
  status            string pending | approved | paid | cancelled
  paid_at           string
  payout_post_id    int
```

**`bluu_aff_payout`** — one record per payout batch

```
post_title:  "Payout — {affiliate_code} — {date}"
meta:
  aff_code           string
  aff_wp_user_id     int
  total_amount       float
  commission_ids     string  JSON array of bluu_aff_commission post IDs included
  method             string  stripe | paypal | bank
  status             string  pending | processing | completed | failed
  initiated_at       string
  completed_at       string
  transfer_ref       string  Stripe transfer ID or PayPal transaction ID
```

---

## 4. Portal Structure — New Routes

### Middleware update (`portal/middleware.ts`)

Add `bluu_affiliate` role guard:
```
/affiliate/*   →  requires token.role === "bluu_affiliate"
/affiliate-login  →  public
```

### New Auth Pages

```
app/(auth)/affiliate-login/page.tsx       Email + password login for affiliates
app/(auth)/affiliate-register/page.tsx    Open enrollment sign-up form
```

### Affiliate Dashboard Pages

```
app/affiliate/
├── layout.tsx                  Shell with sidebar (links, earnings summary)
├── page.tsx                    Overview: clicks / conversions / earnings / pending
├── links/page.tsx              Referral links + promo code generator
├── conversions/page.tsx        Table of all conversions with status badges
├── earnings/page.tsx           Commission history, broken down by product/month
├── payouts/page.tsx            Payout history + "Request Payout" button
├── assets/page.tsx             Marketing asset library (copy, banners, emails)
└── settings/page.tsx           Profile, payout method setup
```

### API Routes (portal)

```
app/api/affiliates/
├── register/route.ts            POST — open enrollment, creates WP user + affiliate meta
├── track/route.ts               POST — records a click event (called from client-side beacon)
├── event/route.ts               POST — internal, receives conversion events from scan-tool
│                                       protected by BLUU_INTERNAL_SECRET header
├── commissions/route.ts         GET  — affiliate's commission history
├── payout/route.ts              POST — request a payout (triggers admin review)
└── assets/route.ts              GET  — list marketing assets

app/api/cron/affiliate-commissions/route.ts
   Runs monthly. Scans approved pending commissions → creates payout records.
   Protected by CRON_SECRET.
```

### New NextAuth Provider (portal `lib/auth.ts`)

Add a fourth `CredentialsProvider` with id `"affiliate-credentials"`:
- Validates WP credentials, checks `bluu_affiliate` role
- Returns token with `role: "bluu_affiliate"`, `affiliateCode`, `affiliateStatus`

---

## 5. Commission Calculation Engine

### SaaS & Retainer Products (scan_tool, portal, hosting_mgmt, content_ops)

**Trigger:** Stripe `invoice.paid` webhook

```
1. Receive invoice.paid
2. Look up stripe_customer_id → find matching bluu_aff_conversion record
3. If conversion.status === "approved" and subscription is still active:
   a. Get invoice.amount_paid (in cents)
   b. Look up affiliate's commission_rate for this product
   c. commission_amount = (amount_paid / 100) × rate
   d. Create bluu_aff_commission with status "pending"
   e. Affiliate's running balance increments
4. If no conversion found → skip (organic customer)
```

**Recurring:** every month for life of the subscription (no cap).
This is the core hook for recruiting quality affiliates.

### Project-Based Products (web_dev, ai_integration)

**Stage 1 — Discovery call completed:**
```
Admin marks lead as "discovery_call_completed" in WP/portal
→ Create bluu_aff_commission: $75 bonus, status "pending"
```

**Stage 2 — Contract signed + first invoice paid:**
```
Admin marks conversion as "project_signed" + enters contract_value
→ commission_amount = contract_value × 0.10
→ Create bluu_aff_commission, status "pending"
→ Approve after first invoice is paid
```

### Payout Rules

- Minimum payout threshold: **$50**
- Payout cycle: **monthly** (1st of each month)
- Methods: Stripe Connect (preferred), PayPal, bank transfer
- Commissions earn 30-day cooling period before eligible for payout
  (handles refunds/chargebacks before money moves)

---

## 6. Tracking Layer

### Cookie strategy

| App | Cookie name | Domain | TTL | Set by |
|---|---|---|---|---|
| scan.bluuhq.com | `bluu_ref` | scan.bluuhq.com | 60 days | Next.js middleware |
| crm.bluuhq.com | `bluu_ref` | crm.bluuhq.com | 60 days | Next.js middleware |
| bluuhq.com | `bluu_ref` | bluuhq.com | 60 days | WordPress functions.php hook |

**First-touch wins.** If a `bluu_ref` cookie already exists, it is not overwritten.
This rewards the affiliate who made first contact.

### scan-tool middleware addition

```typescript
// In scan-tool/middleware.ts (existing file)
// Add before the auth checks:
const ref = req.nextUrl.searchParams.get('ref');
if (ref && !req.cookies.get('bluu_ref')) {
  const response = NextResponse.next();
  response.cookies.set('bluu_ref', ref, {
    maxAge: 60 * 60 * 24 * 60, // 60 days
    sameSite: 'lax',
    httpOnly: false, // readable by JS for beacon
  });
  return response;
}
```

### scan-tool billing webhook addition

```typescript
// In scan-tool/app/api/billing/webhook/route.ts
// On 'customer.subscription.created' event:
const ref = /* read from customer metadata or session stored cookie */;
if (ref) {
  await fetch(`${process.env.PORTAL_URL}/api/affiliates/event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bluu-internal-secret': process.env.BLUU_INTERNAL_SECRET!,
    },
    body: JSON.stringify({
      event: 'new_subscription',
      ref,
      product: 'scan_tool',
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
    }),
  });
}
```

To pass the ref through Stripe checkout: store `ref` in Stripe customer metadata
at checkout creation time. On webhook, read `customer.metadata.bluu_ref`.

---

## 7. WordPress Landing Page — Plugin

**Plugin:** `bluu-affiliates-landing`
**Location:** `wp-content/plugins/bluu-affiliates-landing/`
**Pattern:** Identical to `ai-productivity-landing` plugin

### Page sections (template-affiliates.php)

```
1. HERO
   Headline: "Earn 30% recurring commissions promoting Bluu"
   Sub: "Share Bluu with your audience. Earn every month your referrals stay."
   CTA: "Join Free — Apply Now" → crm.bluuhq.com/affiliate-register

2. HOW IT WORKS (3 steps)
   ① Sign up free in 60 seconds
   ② Share your unique referral link
   ③ Earn commissions every month

3. COMMISSION TABLE
   Product / Service | Commission | When you earn
   (full table from Section 1 above)

4. WHO IT'S FOR (icon grid)
   - Freelance designers & developers
   - Marketing consultants
   - Agency owners
   - Business coaches & advisors
   - Newsletter writers & content creators
   - Startup advisors & accelerators

5. EARNINGS CALCULATOR (interactive JS widget)
   "How much could you earn?"
   Sliders: # of SaaS referrals / avg plan value / # of projects
   Live earnings estimate below

6. WHAT YOU GET (affiliate toolkit)
   - Branded referral links
   - Marketing copy packs
   - Email templates
   - Banner assets
   - Real-time dashboard

7. FAQ
   How does tracking work? | When do I get paid? | Is there a minimum?
   What products can I promote? | Can I promote to existing clients?

8. FINAL CTA
   "Start earning today — it's free to join"
   Button → crm.bluuhq.com/affiliate-register
```

### Plugin file structure

```
wordpress/plugins/bluu-affiliates-landing/
├── bluu-affiliates-landing.php      Main plugin file
├── includes/
│   └── acf-fields.php               ACF field registration
├── templates/
│   └── template-affiliates.php      Full-page template
└── assets/
    └── css/
        └── affiliates-landing.css   Page styles
```

---

## 8. Email Sequences (via Resend + portal sequences system)

### Affiliate onboarding sequence (7 emails)

| # | Timing | Subject | Content |
|---|---|---|---|
| 1 | Immediate | "Welcome to the Bluu affiliate program" | Dashboard link, referral code, quick-start guide |
| 2 | Day 2 | "Your affiliate toolkit is ready" | Assets library walkthrough, copy-paste link |
| 3 | Day 5 | "The easiest Bluu product to start with" | BluuAudit pitch — why it converts easily |
| 4 | Day 10 | "How to earn big with Bluu services" | Web dev + AI integration commission breakdown |
| 5 | Day 21 | "Your first month check-in" | Stats summary, tips if no conversions yet |
| 6 | Day 30 | "Top affiliates are doing this" | Playbook: content, LinkedIn, email to clients |
| 7 | Day 45 | "Ready to level up?" | Agency partner track intro |

### Event-triggered emails

- **Conversion confirmed:** "You just earned $X — [customer] signed up via your link"
- **Commission approved:** "Your commission is approved and queues for payout"
- **Payout sent:** "Your payout of $X is on its way"
- **First click:** "Someone just clicked your referral link"

---

## 9. Admin Tools (portal /admin section)

New admin sub-pages:

```
/admin/affiliates/page.tsx          List all affiliates: status, earnings, link count
/admin/affiliates/[id]/page.tsx     Individual affiliate detail + approve/suspend controls
/admin/affiliates/commissions       Pending commissions queue — approve / reject / override
/admin/affiliates/payouts           Payout queue — process / mark complete
```

Admin capabilities:
- Approve or reject pending commissions
- Override commission rates per affiliate
- Suspend / reactivate affiliates
- Manually create conversion records (for offline/verbal referrals)
- Export commissions as CSV for accounting

---

## 10. Build Phases

### Phase 1 — WordPress Landing Page (Week 1)
- [ ] `bluu-affiliates-landing` WordPress plugin
- [ ] Full landing page template with earnings calculator
- [ ] CSS styles matching Bluu brand
- [ ] Form CTA pointing to crm.bluuhq.com/affiliate-register

### Phase 2 — Portal Auth + Registration (Week 1–2)
- [ ] `bluu_affiliate` WP role in `bluuhq-cpts.php`
- [ ] Affiliate user meta fields in WordPress
- [ ] New `affiliate-credentials` NextAuth provider in portal
- [ ] `/affiliate-register` page (open enrollment form)
- [ ] `/affiliate-login` page
- [ ] Middleware update for `/affiliate/*` route protection

### Phase 3 — Affiliate Dashboard (Week 2–3)
- [ ] `app/affiliate/layout.tsx` — sidebar shell
- [ ] `app/affiliate/page.tsx` — overview stats
- [ ] `app/affiliate/links/page.tsx` — referral link generator
- [ ] `app/affiliate/conversions/page.tsx`
- [ ] `app/affiliate/earnings/page.tsx`
- [ ] `app/affiliate/payouts/page.tsx`
- [ ] `app/affiliate/assets/page.tsx`

### Phase 4 — Tracking Layer (Week 3)
- [ ] WordPress `functions.php` — `?ref=` cookie setter
- [ ] scan-tool `middleware.ts` — `?ref=` cookie setter
- [ ] portal `middleware.ts` — `?ref=` cookie setter
- [ ] `portal/api/affiliates/track/route.ts` — click beacon
- [ ] `portal/api/affiliates/event/route.ts` — internal cross-app events
- [ ] scan-tool billing webhook → fire affiliate event to portal

### Phase 5 — Commission Engine (Week 4)
- [ ] CPT registration: `bluu_aff_conversion`, `bluu_aff_commission`, `bluu_aff_payout`
- [ ] portal Stripe webhook handler — `invoice.paid` → commission row
- [ ] portal `/api/cron/affiliate-commissions` — monthly calculation job
- [ ] Payout request API + admin payout queue

### Phase 6 — Admin Tools + Email Sequences (Week 5)
- [ ] Admin affiliate management pages
- [ ] Onboarding email sequence (7 emails) in sequences system
- [ ] Event-triggered transactional emails

### Phase 7 — Polish & Launch (Week 6)
- [ ] Marketing asset library (copy packs, banner templates)
- [ ] Earnings calculator widget (landing page)
- [ ] Affiliate T&Cs page
- [ ] Recruit first 20 beta affiliates manually
- [ ] Monitor first conversion + commission cycle end-to-end

---

## 11. Environment Variables

### crm.bluuhq.com additions

```
BLUU_INTERNAL_SECRET=          # Shared secret for cross-app API calls
AFFILIATE_PAYOUT_MIN=50        # Minimum payout threshold in USD
STRIPE_CONNECT_CLIENT_ID=      # For Stripe Connect affiliate payouts
CRON_SECRET=                   # Guards /api/cron/* routes
```

### scan.bluuhq.com additions

```
PORTAL_URL=https://crm.bluuhq.com
BLUU_INTERNAL_SECRET=          # Same value as portal
```

---

## 12. Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Enrollment | Open — anyone can sign up | Low friction; quality governed by commission structure |
| Dashboard location | crm.bluuhq.com/affiliate/* | Reuses auth, UI, email, Stripe infrastructure |
| Tracking | First-touch cookie, 60-day window | Fair, simple, industry standard |
| Commission lifetime | No cap — earn forever on recurring | Most powerful affiliate motivator for SaaS |
| Attribution store | WordPress CPTs | Consistent with existing portal data layer |
| Cross-app comms | Internal REST API with shared secret | Simple, reliable, no third-party dependency |
| Payout | Monthly, 30-day cooling period | Handles refunds before money moves |
