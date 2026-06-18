# BluuHQ Scan Tool — Full Build Plan

> Four-phase roadmap from MVP scan engine to paid monitoring product.

---

# Phase 1 — AI Visibility Scan Engine

> **Goal:** Replace the deterministic hash-based scoring in `scan-tool/` with real AI discoverability checks, gate the full breakdown behind email capture, and handle scans asynchronously.

---

## Architecture Overview

```
WordPress (bluuhq.com)          scan.bluuhq.com (Next.js 14)
┌──────────────────┐            ┌─────────────────────────────────┐
│  front-page.php  │  ──form──▶ │  /                              │
│  (scan hero)     │            │  Client: form → scan animation  │
└──────────────────┘            │                                 │
                                │  /api/scan        (POST)        │
                                │  /api/scan/[id]   (GET)         │
                                │  /api/email-gate  (POST)        │
                                │                                 │
                                │  Workers (QStash / background)  │
                                │  ├─ AI discoverability check    │
                                │  ├─ Site health (PageSpeed)*    │
                                │  └─ Competitor intel*           │
                                └─────────────────────────────────┘
                                           │
                              ┌────────────┴────────────┐
                              │  Upstash Redis + QStash │
                              │  (scan state & queuing) │
                              └─────────────────────────┘
```

*Site health and competitor intel are Phase 2/3 — Phase 1 stubs them with lightweight heuristics.

---

## Current State (what exists)

| Component | Status |
|-----------|--------|
| `scan-tool/app/page.tsx` | Client-side form + results UI, deterministic hash scoring, email gate UI (placeholder `alert()`) |
| `scan-tool/app/layout.tsx` | Root layout with Inter + Manrope fonts, metadata |
| `scan-tool/lib/utils.ts` | `cn()` class merge utility |
| `scan-tool/components/` | Empty |
| API routes | None |
| Database / cache | None |
| LLM integration | None |
| Email sending | None |

---

## Deliverables

### 1. API Route: `/api/scan` (POST)

**File:** `scan-tool/app/api/scan/route.ts`

**Request body:**
```json
{
  "domain": "example.com",       // OR
  "brand": "My Business",
  "niche": "SaaS",
  "noSite": false
}
```

**Response:**
```json
{
  "id": "scan_abc123",
  "status": "processing",
  "createdAt": "2026-06-18T12:00:00Z"
}
```

**Logic:**
1. Validate input (domain OR brand+niche required)
2. Normalize domain (strip protocol, www, trailing slash)
3. Create scan record in Upstash Redis with TTL (72h)
4. Enqueue async scan job via QStash (or run inline for MVP)
5. Return scan ID for polling

### 2. Scan Engine: AI Discoverability Check

**File:** `scan-tool/lib/scan/ai-discoverability.ts`

**What it does:**
- Constructs 3-5 natural-language prompts relevant to the domain/niche (e.g., "What is the best [niche] tool?", "Who are the top [niche] companies?")
- Calls Claude API with search grounding to check if the brand appears in AI-generated answers
- Scores based on:
  - **Mention rate:** How many prompts surface the brand (0-40 pts)
  - **Position/prominence:** First mention vs. buried in a list (0-20 pts)
  - **Sentiment:** Positive, neutral, or negative framing (0-15 pts)
  - **Citation quality:** Direct link vs. brand name only (0-15 pts)
  - **Consistency:** Same answer across rephrased prompts (0-10 pts)

**Prompt generation strategy:**
```
Given: domain "acme.io", detected niche "project management SaaS"

Prompts:
1. "What are the best project management tools for small teams?"
2. "Compare Acme with other project management platforms"
3. "What project management software do people recommend?"
4. "Is Acme a good project management tool?"
5. "What are alternatives to [top competitor in niche]?"
```

**Scoring rubric:**

| Signal | Points | Method |
|--------|--------|--------|
| Mentioned in ≥3/5 prompts | 0-40 | Count mentions across responses |
| Mentioned in first 3 results | 0-20 | Position analysis |
| Positive/neutral sentiment | 0-15 | Sentiment classification |
| Direct URL cited | 0-15 | URL presence check |
| Consistent across rephrasings | 0-10 | Cross-prompt consistency |

### 3. Scan Engine: Site & Tech Health (Phase 1 stub)

**File:** `scan-tool/lib/scan/site-health.ts`

Phase 1 lightweight checks (no PageSpeed API yet):
- DNS resolution (does the domain resolve?)
- HTTPS check (valid cert?)
- Response time (fetch homepage, measure TTFB)
- Basic meta tag presence (title, description, OG tags)
- robots.txt and sitemap.xml presence
- Structured data (JSON-LD) presence

Score: 0-100 based on which checks pass.

### 4. Scan Engine: Competitor Intel (Phase 1 stub)

**File:** `scan-tool/lib/scan/competitor-intel.ts`

Phase 1 lightweight approach:
- Use Claude API to identify 3-5 competitors for the given domain/niche
- Check if competitors appear more prominently in AI search results
- Score: relative visibility vs. identified competitors (0-100)

### 5. API Route: `/api/scan/[id]` (GET)

**File:** `scan-tool/app/api/scan/[id]/route.ts`

**Response (processing):**
```json
{
  "id": "scan_abc123",
  "status": "processing",
  "progress": 65,
  "currentStep": "Checking AI discoverability..."
}
```

**Response (complete):**
```json
{
  "id": "scan_abc123",
  "status": "complete",
  "scores": {
    "ai": 42,
    "site": 78,
    "comp": 65,
    "overall": 62
  },
  "verdict": {
    "weakest": "ai",
    "message": "Most AI tools can't find your brand yet.",
    "recommendation": "content-ops"
  },
  "summary": {
    "pagesChecked": 42,
    "competitorsSurveyed": 3,
    "aiPromptsRun": 5
  },
  "gated": true
}
```

When `gated: true`, detailed breakdown (per-prompt results, competitor names, specific recommendations) is withheld until email is provided.

### 6. API Route: `/api/email-gate` (POST)

**File:** `scan-tool/app/api/email-gate/route.ts`

**Request:**
```json
{
  "scanId": "scan_abc123",
  "email": "user@example.com"
}
```

**Logic:**
1. Validate email format
2. Store email + scan ID association in Redis
3. Send detailed report email via Resend (or similar)
4. Return ungated scan results
5. (Future: create lead in CRM)

### 7. Client-Side Updates

**File:** `scan-tool/app/page.tsx` (refactor)

Changes:
- Replace `hashStr`/`scoreFrom` with real API calls
- `handleScan` → POST to `/api/scan`, get scan ID
- Poll `/api/scan/[id]` every 2s until complete
- Progress bar driven by `progress` field from API
- Email gate form → POST to `/api/email-gate`
- Error states (scan failed, rate limited, invalid domain)

### 8. Extract Components

**New files:**
```
scan-tool/components/
├── scan-form.tsx          # Domain/brand input + toggle
├── scan-progress.tsx      # Progress bar + status text
├── scan-results.tsx       # Score display + pillar bars
├── scan-verdict.tsx       # Weakest-pillar recommendation
├── email-gate.tsx         # Email capture form
└── score-bar.tsx          # Individual pillar score bar
```

---

## Dependencies to Add

```bash
npm install @anthropic-ai/sdk        # Claude API for AI checks
npm install @upstash/redis            # Scan state storage
npm install @upstash/qstash           # Async job queuing
npm install resend                    # Transactional email
npm install zod                       # Input validation
npm install nanoid                    # Scan ID generation
```

---

## Environment Variables

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Upstash QStash
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=scan@bluuhq.com

# App
NEXT_PUBLIC_APP_URL=https://scan.bluuhq.com
SCAN_TTL_SECONDS=259200  # 72 hours
```

---

## File Structure (after Phase 1)

```
scan-tool/
├── app/
│   ├── api/
│   │   ├── scan/
│   │   │   ├── route.ts              # POST: create scan
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET: poll scan status
│   │   └── email-gate/
│   │       └── route.ts              # POST: unlock full report
│   ├── layout.tsx
│   ├── page.tsx                      # Refactored to use API
│   └── globals.css
├── components/
│   ├── scan-form.tsx
│   ├── scan-progress.tsx
│   ├── scan-results.tsx
│   ├── scan-verdict.tsx
│   ├── email-gate.tsx
│   └── score-bar.tsx
├── lib/
│   ├── utils.ts
│   ├── redis.ts                      # Upstash Redis client
│   ├── scan/
│   │   ├── types.ts                  # Shared types (ScanResult, etc.)
│   │   ├── engine.ts                 # Orchestrator: runs all checks
│   │   ├── ai-discoverability.ts     # Claude-powered AI visibility
│   │   ├── site-health.ts            # Basic site checks
│   │   ├── competitor-intel.ts       # Competitor identification
│   │   └── prompts.ts               # Prompt templates for AI checks
│   └── email/
│       ├── send-report.ts            # Resend integration
│       └── templates/
│           └── scan-report.tsx       # React Email template
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Implementation Order

| Step | Task | Depends on |
|------|------|------------|
| 1 | Set up Upstash Redis client + scan types | — |
| 2 | Build `/api/scan` POST route (create scan, store in Redis) | Step 1 |
| 3 | Build `/api/scan/[id]` GET route (poll status) | Step 1 |
| 4 | Build AI discoverability engine (`ai-discoverability.ts`) | Claude API key |
| 5 | Build site health stub (`site-health.ts`) | — |
| 6 | Build competitor intel stub (`competitor-intel.ts`) | Claude API key |
| 7 | Build scan orchestrator (`engine.ts`) — runs all three | Steps 4-6 |
| 8 | Wire scan orchestrator into `/api/scan` (inline for MVP) | Steps 2, 7 |
| 9 | Refactor `page.tsx` to use real API | Steps 2, 3 |
| 10 | Extract React components | Step 9 |
| 11 | Build email gate API + Resend integration | Step 1 |
| 12 | Build email report template | Step 11 |
| 13 | Add rate limiting (IP-based, 5 scans/hour) | Step 2 |
| 14 | Error handling + edge cases | All |
| 15 | Deploy to Vercel + env vars | All |

---

## Rate Limiting

- 5 scans per IP per hour (stored in Redis with TTL)
- Shown as friendly message: "You've run a few scans already — try again in X minutes, or book a call."
- No hard block on email-gated results (unlimited unlocks)

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| LLM provider | Claude API (Sonnet) | Already in ecosystem, search grounding, cost-effective |
| State store | Upstash Redis | Serverless, no cold start, built-in TTL |
| Job queue | Inline first, QStash later | MVP speed; QStash when scan >10s |
| Email | Resend | Simple API, React Email templates, good deliverability |
| Scan ID format | `scan_` + nanoid(12) | URL-safe, collision-resistant, human-readable prefix |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Claude API latency (5-15s for grounded search) | Show real progress updates; consider streaming |
| AI discoverability scores feel arbitrary | Publish scoring rubric on results page; use consistent methodology |
| Rate limiting too aggressive | Start generous (5/hr), tighten based on abuse patterns |
| Email deliverability | Use custom domain (scan@bluuhq.com), DKIM/SPF, Resend reputation |
| Scan costs per user ($0.05-0.15 in API calls) | Email gate before full breakdown; cap at 5/hr/IP |

---
---

# Phase 2 — Site Health + Accounts & Dashboard

> **Goal:** Add real site health scoring via PageSpeed/crawl checks, stand up user accounts with magic-link auth, and build the scan history dashboard.

## 2.1 Site Health Pillar (real scores)

**File:** `scan-tool/lib/scan/site-health.ts` (upgrade from Phase 1 stub)

**Data sources:**
- Google PageSpeed Insights API (Lighthouse)
- Direct HTTP crawl of homepage + up to 20 internal pages

**Scoring breakdown (0-100):**

| Signal | Points | Source |
|--------|--------|--------|
| Performance score | 0-25 | PageSpeed API `performance` |
| Largest Contentful Paint | 0-15 | PageSpeed API LCP metric |
| Core Web Vitals pass | 0-10 | CLS + INP + LCP thresholds |
| HTTPS + valid cert | 0-5 | Direct check |
| Mobile-friendly | 0-10 | PageSpeed mobile audit |
| Meta tags (title, desc, OG) | 0-10 | Crawl homepage |
| robots.txt + sitemap.xml | 0-5 | Direct fetch |
| Structured data (JSON-LD) | 0-10 | Parse homepage HTML |
| Crawl depth (internal links) | 0-5 | Follow links up to 20 pages |
| Response time (TTFB) | 0-5 | Direct fetch |

**Environment variables:**
```env
PAGESPEED_API_KEY=AIza...
```

**Rate limits:** PageSpeed API allows 25,000 queries/day free. One scan = 2 calls (mobile + desktop).

## 2.2 Authentication — WordPress JWT Bridge

**Architecture:**
```
scan.bluuhq.com                    bluuhq.com (WordPress)
┌──────────────┐     magic link    ┌──────────────────────┐
│ /api/auth/*  │ ◄──────────────── │ JWT plugin endpoint  │
│              │     verify token  │ /wp-json/jwt/v1/     │
│ NextAuth.js  │ ──────────────▶── │                      │
└──────────────┘                   └──────────────────────┘
```

**Implementation:**
- Install `next-auth` with credentials + magic-link providers
- WordPress side: install JWT Auth plugin or build custom `/wp-json/bluu/v1/auth` endpoint
- Magic-link flow:
  1. User enters email on scan tool
  2. `/api/auth/magic-link` sends email with signed token (Resend)
  3. User clicks link → `/api/auth/callback/magic-link?token=...`
  4. Token verified → session created → redirect to dashboard
- Session stored in encrypted HTTP-only cookie (no DB needed for sessions)

**New files:**
```
scan-tool/app/api/auth/[...nextauth]/route.ts
scan-tool/lib/auth.ts
```

**Dependencies:**
```bash
npm install next-auth
```

**Environment variables:**
```env
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://scan.bluuhq.com
WP_JWT_ENDPOINT=https://bluuhq.com/wp-json/bluu/v1/auth
```

## 2.3 Dashboard Pages

**New routes:**

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview: latest scan, quick stats, CTA to re-scan |
| `/dashboard/scans` | Scan history list (paginated, sorted by date) |
| `/dashboard/scans/[id]` | Full scan detail: all three pillars, per-check breakdowns, recommendations |
| `/dashboard/settings` | Email preferences, delete account, change email |

**Data model (Redis → persistent store):**

Phase 2 adds scan history per user. Options:
- **Upstash Redis** with user-keyed sorted sets (simple, already in stack)
- **Turso (libSQL)** if query flexibility needed (future-proofing for Phase 4)

Recommended: Stay on Redis for Phase 2, migrate to Turso in Phase 4 when billing needs relational data.

**User record (Redis hash):**
```
user:{email} → {
  id: "usr_abc123",
  email: "user@example.com",
  createdAt: "2026-06-18T...",
  scanCount: 7,
  lastScanId: "scan_xyz789"
}
```

**Scan index (Redis sorted set):**
```
scans:{userId} → [
  { score: timestamp, member: "scan_abc123" },
  { score: timestamp, member: "scan_def456" },
]
```

**File structure additions:**
```
scan-tool/app/
├── dashboard/
│   ├── layout.tsx              # Auth-gated layout with sidebar
│   ├── page.tsx                # Overview
│   ├── scans/
│   │   ├── page.tsx            # Scan history
│   │   └── [id]/
│   │       └── page.tsx        # Scan detail
│   └── settings/
│       └── page.tsx            # User settings
├── login/
│   └── page.tsx                # Magic-link login form
```

**Middleware:**
```
scan-tool/middleware.ts          # Protect /dashboard/* routes
```

## 2.4 Implementation Order

| Step | Task | Depends on |
|------|------|------------|
| 1 | PageSpeed API integration | API key |
| 2 | Upgrade site-health.ts with real scoring | Step 1 |
| 3 | Set up NextAuth with magic-link provider | Resend (from Phase 1) |
| 4 | Build login page + auth API routes | Step 3 |
| 5 | Add middleware to protect /dashboard | Step 4 |
| 6 | Build dashboard layout + overview page | Step 5 |
| 7 | Build scan history page | Steps 5, 6 |
| 8 | Build scan detail page | Step 7 |
| 9 | Build settings page | Step 5 |
| 10 | Migrate scan creation to associate with user when logged in | Steps 3, Phase 1 |

---
---

# Phase 3 — Competitor Intel + Service Routing

> **Goal:** Build the full competitor intelligence pillar (sitemap crawling + LLM topic clustering) and wire up weakest-pillar routing to all four service pages on bluuhq.com.

## 3.1 Competitor Intel Pillar (full implementation)

**File:** `scan-tool/lib/scan/competitor-intel.ts` (upgrade from Phase 1 stub)

**Process:**
1. **Competitor identification** — Claude API identifies 3-5 direct competitors based on domain content or niche description
2. **Sitemap crawling** — Fetch and parse each competitor's sitemap.xml; extract up to 50 content URLs per competitor
3. **Topic clustering** — Claude API clusters competitor content into topic areas (e.g., "pricing guides", "comparison pages", "how-to tutorials")
4. **Gap analysis** — Compare scanned brand's content topics vs. competitor topic clusters; identify uncovered topics
5. **AI visibility comparison** — Run the same AI discoverability prompts for top 2 competitors; compare mention rates

**Scoring breakdown (0-100):**

| Signal | Points | Method |
|--------|--------|--------|
| Content volume vs. competitors | 0-20 | Page count comparison |
| Topic coverage breadth | 0-25 | Unique topic clusters covered vs. total |
| Content freshness | 0-15 | Last-modified dates from sitemaps |
| AI mention rate vs. competitors | 0-25 | Relative AI discoverability |
| Content gap opportunities | 0-15 | Uncovered high-value topics |

**Data stored per scan:**
```json
{
  "competitors": [
    {
      "domain": "competitor1.com",
      "pageCount": 142,
      "topTopics": ["pricing", "integrations", "api-docs"],
      "aiMentionRate": 0.6
    }
  ],
  "topicGaps": [
    { "topic": "comparison pages", "competitorsCovering": 3, "opportunity": "high" },
    { "topic": "ROI calculators", "competitorsCovering": 2, "opportunity": "medium" }
  ],
  "contentFreshness": "stale"
}
```

**Rate limiting / cost:**
- Sitemap crawling: respectful (1 req/s, honor robots.txt)
- Claude API: ~3-5 calls per competitor analysis (~$0.10-0.20 per scan)
- Cache competitor data for 24h (avoid re-crawling same competitor for different users)

## 3.2 Weakest-Pillar Service Routing

**Logic in scan verdict:**

| Weakest pillar | Recommendation | Service page |
|----------------|---------------|--------------|
| AI discoverability | "Content strategy is where to start." | `/content-ops` |
| Site health (no site) | "You need a site before anything else." | `/services/web-mobile-dev` |
| Site health (slow/broken) | "Your site needs rebuilding." | `/services/web-mobile-dev` |
| Site health (unmaintained) | "Your site needs ongoing management." | `/services/web-manage` |
| Site health (hosting) | "Infrastructure is the bottleneck." | `/services/hosting` |
| Competitor intel | "Competitors are outpublishing you." | `/content-ops` |

**Implementation:**
- Verdict message includes a CTA button linking to the relevant bluuhq.com service page
- Email report includes the same recommendation with deeper explanation
- Dashboard scan detail page shows the full recommendation with context

## 3.3 Implementation Order

| Step | Task | Depends on |
|------|------|------------|
| 1 | Build sitemap crawler utility | — |
| 2 | Build competitor identification via Claude | Claude API |
| 3 | Build topic clustering pipeline | Steps 1, 2 |
| 4 | Build gap analysis scoring | Step 3 |
| 5 | Build AI comparison (run discoverability for competitors) | Phase 1 AI engine |
| 6 | Integrate into scan orchestrator | Steps 4, 5 |
| 7 | Implement weakest-pillar routing logic | Step 6 |
| 8 | Update verdict UI + email template with service links | Step 7 |
| 9 | Add competitor caching layer (24h TTL) | Step 6 |

---
---

# Phase 4 — Billing & Monitoring

> **Goal:** Add Stripe billing, a paid "Monitor" tier with scheduled re-scans, competitor tracking, trend views, and score change alerts.

## 4.1 Pricing Tiers

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 3 scans/month, summary results, email-gated full report |
| **Monitor** | $19/mo | Unlimited scans, weekly auto re-scans, trend charts, score alerts, competitor tracking (up to 3) |
| **Monitor Pro** | $39/mo | Everything in Monitor + daily re-scans, 10 competitors, priority support, API access |

## 4.2 Stripe Integration

**Dependencies:**
```bash
npm install stripe @stripe/stripe-js
```

**New API routes:**
```
scan-tool/app/api/billing/
├── checkout/route.ts           # Create Stripe Checkout session
├── portal/route.ts             # Redirect to Stripe Customer Portal
└── webhook/route.ts            # Handle Stripe webhooks
```

**Webhook events to handle:**
- `checkout.session.completed` → activate subscription, update user tier
- `customer.subscription.updated` → plan change (upgrade/downgrade)
- `customer.subscription.deleted` → cancel, revert to free tier
- `invoice.payment_failed` → notify user, grace period

**User record additions:**
```json
{
  "tier": "monitor",
  "stripeCustomerId": "cus_abc123",
  "stripeSubscriptionId": "sub_xyz789",
  "tierExpiresAt": "2026-07-18T...",
  "scansThisMonth": 12,
  "monthlyResetAt": "2026-07-01T..."
}
```

**Environment variables:**
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_MONITOR_PRICE_ID=price_...
STRIPE_MONITOR_PRO_PRICE_ID=price_...
```

## 4.3 Dashboard: Billing Page

**Route:** `/dashboard/billing`

**Features:**
- Current plan + renewal date
- Usage stats (scans this month, competitors tracked)
- Upgrade/downgrade buttons → Stripe Checkout
- Manage payment method → Stripe Customer Portal
- Invoice history (pulled from Stripe API)

## 4.4 Scheduled Re-Scans

**Architecture:**
```
Upstash QStash (cron)
  │
  ├─ Every hour: /api/cron/rescan
  │   └─ Query Redis for users with scheduled re-scans due
  │   └─ Enqueue scan jobs for each
  │
  └─ Every day: /api/cron/alerts
      └─ Compare latest scan vs. previous
      └─ Send score change alerts via Resend
```

**New API routes:**
```
scan-tool/app/api/cron/
├── rescan/route.ts             # QStash-triggered: run due re-scans
└── alerts/route.ts             # QStash-triggered: send score alerts
```

**User schedule record (Redis hash):**
```
schedule:{userId} → {
  frequency: "weekly",           // "weekly" | "daily"
  lastRunAt: "2026-06-11T...",
  nextRunAt: "2026-06-18T...",
  domain: "example.com",
  alertThreshold: 5,             // notify if score changes by ±5
  alertEmail: "user@example.com"
}
```

## 4.5 Trend View

**Route:** `/dashboard/trends`

**Features:**
- Line chart: overall score over time (last 12 weeks / 90 days)
- Per-pillar sparklines (AI, site health, competitor)
- Score delta badges (↑12 from last scan, ↓3 from peak)
- Competitor overlay (show competitor scores alongside yours)

**Chart library:** `recharts` (lightweight, React-native, SSR-compatible)

**Dependencies:**
```bash
npm install recharts
```

**Data model:**
- Each scan already stored in Redis with scores
- Trend = sorted set of scan IDs per user, read last N, extract scores
- No additional storage needed

## 4.6 Competitor Tracking (paid feature)

**Route:** `/dashboard/competitors`

**Features:**
- Add/remove tracked competitors (3 for Monitor, 10 for Pro)
- Side-by-side score comparison table
- Topic gap matrix (your topics vs. each competitor)
- Alert when a competitor's AI visibility overtakes yours

**Data model:**
```
competitors:{userId} → [
  { domain: "competitor1.com", addedAt: "...", lastScanId: "scan_..." },
  { domain: "competitor2.com", addedAt: "...", lastScanId: "scan_..." }
]
```

## 4.7 API Access (Pro tier)

**Route:** `/api/v1/scan` (API key authenticated)

Simple REST API for programmatic access:
- `POST /api/v1/scan` — trigger scan
- `GET /api/v1/scan/:id` — get results
- `GET /api/v1/scans` — list user's scans

**Auth:** API key in `Authorization: Bearer sk_...` header, generated from dashboard settings.

## 4.8 Database Migration (Redis → Turso)

Phase 4 likely needs relational queries (invoices, subscription history, competitor relationships). Options:
- **Stay Redis:** Works but gets awkward for joins and aggregations
- **Migrate to Turso (libSQL):** Serverless SQLite, relational, still edge-compatible

**Recommended:** Migrate to Turso with Drizzle ORM at the start of Phase 4.

**Dependencies:**
```bash
npm install @libsql/client drizzle-orm drizzle-kit
```

**Schema (Drizzle):**
```typescript
users        { id, email, tier, stripeCustomerId, createdAt }
scans        { id, userId, domain, scores, verdict, status, createdAt }
competitors  { id, userId, domain, lastScanId, addedAt }
schedules    { id, userId, frequency, nextRunAt, domain, alertThreshold }
api_keys     { id, userId, key, createdAt, lastUsedAt }
```

## 4.9 Implementation Order

| Step | Task | Depends on |
|------|------|------------|
| 1 | Migrate from Redis to Turso + Drizzle | — |
| 2 | Set up Stripe products + prices | Stripe account |
| 3 | Build checkout + webhook API routes | Steps 1, 2 |
| 4 | Build billing dashboard page | Step 3 |
| 5 | Implement free tier scan limits | Steps 1, 3 |
| 6 | Build QStash cron for scheduled re-scans | Steps 1, Phase 1 engine |
| 7 | Build alerts cron + email templates | Step 6 |
| 8 | Build trends page with Recharts | Step 1 |
| 9 | Build competitor tracking page | Steps 1, Phase 3 |
| 10 | Build API key generation + v1 API routes | Steps 1, 3 |
| 11 | Stripe Customer Portal integration | Step 3 |
| 12 | Usage-based rate limiting per tier | Steps 3, 5 |

---
---

# Cross-Phase Timeline

| Phase | Duration | Milestone |
|-------|----------|-----------|
| **Phase 1** | 2-3 weeks | Live scan with real AI scores, email capture |
| **Phase 2** | 3-4 weeks | Dashboard with scan history, magic-link auth, real site health |
| **Phase 3** | 2-3 weeks | Full competitor intel, service routing |
| **Phase 4** | 4-5 weeks | Stripe billing, monitoring, trends, API |

**Total estimated:** 11-15 weeks to full product.

---

# Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4 |
| LLM | Claude API (Sonnet) via `@anthropic-ai/sdk` |
| Auth | NextAuth.js (magic-link + credentials) |
| Database (Ph 1-3) | Upstash Redis |
| Database (Ph 4) | Turso (libSQL) + Drizzle ORM |
| Job Queue | Upstash QStash |
| Email | Resend + React Email |
| Payments | Stripe |
| Charts | Recharts |
| Hosting | Vercel |
| Domain | scan.bluuhq.com |
