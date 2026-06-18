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

## Phase 2 Preview (not in scope)

- PageSpeed API integration for real site health scores
- WordPress JWT auth bridge for identity
- Magic-link login
- Dashboard pages (`/dashboard`, `/dashboard/scans`, `/dashboard/scans/[id]`, `/dashboard/settings`)
- Persistent scan history per user account
