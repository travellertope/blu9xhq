# BluuHQ — CRM & Client Portal

Headless WordPress + Next.js 14 CRM and client portal for BluuHQ agency.

---

## Repository Structure

```
bluuhq/
├── portal/         # Next.js 14 CRM + client portal (Vercel)
│   ├── app/        # App Router pages and API routes
│   ├── components/ # React components (admin + portal)
│   └── lib/        # WP API, Stripe, Paystack, Resend, R2, Loops
├── wordpress/
│   └── plugins/
│       └── bluuhq-cpts/  # Custom post types, ACF fields, REST endpoints
└── theme/          # WordPress theme for bluuhq.com
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| Node.js 18+ | `nvm use 18` |
| WordPress on PHP 8+ | Shared or managed hosting |
| ACF Pro | Required for custom field groups |
| WPGraphQL | Free plugin |
| Cloudflare R2 | Object storage |
| Stripe account | Card payments |
| Paystack account | African markets |
| Resend account | Transactional email (domain verified) |
| Loops account | Email sequences / CRM sync |
| Google Cloud (Gemini) | AI mood analysis |
| Vercel | Deployment |

---

## WordPress Setup

1. Install plugins: **Advanced Custom Fields Pro**, **WPGraphQL**, **WPGraphQL for ACF**, **WP Application Passwords**, **WP Mail SMTP**
2. Upload and activate `wordpress/plugins/bluuhq-cpts/bluuhq-cpts.php`
3. In WP Admin → ACF → Import field groups from the JSON files in `wordpress/acf-exports/` (if present)
4. Confirm WPGraphQL endpoint responds at `/graphql`
5. Create an Application Password: Users → Profile → Application Passwords → name it `NextJS CRM`
6. Set WP Mail SMTP to use Resend's SMTP relay (`smtp.resend.com`, port 465, SSL)

---

## Cloudflare R2 Setup

1. Create an R2 bucket — set `CLOUDFLARE_R2_BUCKET_NAME` to its name
2. Enable public access or set up a custom domain; set `CLOUDFLARE_R2_PUBLIC_URL`
3. Create an R2 API token with **Object Read & Write** permissions
4. Configure CORS on the bucket to allow `GET` from your portal domain

---

## Environment Variables

Create `portal/.env.local` with the following:

```env
# NextAuth
NEXTAUTH_URL=https://portal.yourdomain.com
NEXTAUTH_SECRET=<random 32+ char secret>

# WordPress
WORDPRESS_URL=https://yourdomain.com
WP_APP_USERNAME=nextjs-crm
WP_APP_PASSWORD=<application password from WP>

# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET_NAME=bluuhq-files
CLOUDFLARE_R2_ACCESS_KEY_ID=<r2 access key>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<r2 secret key>
CLOUDFLARE_R2_PUBLIC_URL=https://files.yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_NAME=BluuHQ
RESEND_FROM_EMAIL=hello@yourdomain.com
RESEND_REPLY_TO=hello@yourdomain.com

# Loops
LOOPS_API_KEY=<loops api key>

# Google Gemini
GEMINI_API_KEY=<gemini api key>

# Cron security
CRON_SECRET=<random secret>

# App URL
NEXT_PUBLIC_APP_URL=https://portal.yourdomain.com
```

---

## External Service Configuration

### Resend
- Verify your sending domain in the Resend dashboard
- Set `RESEND_FROM_EMAIL` to an address on your verified domain

### Stripe
- Webhooks → Add endpoint → `https://your-portal.vercel.app/api/webhooks/stripe`
- Subscribe to: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

### Paystack
- Settings → API Keys & Webhooks → set webhook URL to `https://your-portal.vercel.app/api/webhooks/paystack`

### Loops
- Copy your API key to `LOOPS_API_KEY`
- Configure email sequences in the Loops UI using trigger event names returned by `createOrUpdateSequence()`

---

## First-Run Checklist

1. **Deploy to Vercel** — set root directory to `portal`, add all environment variables
2. **Run seed script** (from `portal/` directory):
   ```bash
   npx ts-node --project tsconfig.json scripts/seedTemplates.ts
   ```
3. **Create Super Admin in WordPress** — create a WP user with the `administrator` role, then add user meta `bluuhq_role = super_admin`
4. **Log in** at `/admin-login` using WP credentials
5. **Complete setup checklist** shown on the admin dashboard

---

## Manual Integration Test Checklist

- [ ] Super Admin can log in at `/admin-login`
- [ ] Super Admin can invite a team member with Account Manager role
- [ ] Account Manager can log in and only sees their assigned clients
- [ ] Billing Manager can create and mark invoices paid but cannot access settings or sequences
- [ ] Support Staff can log communications and upload files but cannot access invoices or settings
- [ ] Viewer can browse the CRM read-only with no action buttons visible
- [ ] Deactivated team member is rejected on login
- [ ] Audit log records all significant actions with the correct actor
- [ ] Admin can create a client and send portal invite
- [ ] Client receives invite email, completes setup wizard, sees dashboard
- [ ] Admin can create a service with action buttons and credential fields
- [ ] Admin can assign subscription to client with credentials filled
- [ ] Client can see subscription, use action buttons, and reveal credentials (rate limited)
- [ ] Credential reveal is logged in admin audit trail and Resend audit email fires
- [ ] Admin can create and send an invoice
- [ ] Client can pay invoice with Stripe (card payment)
- [ ] Client can pay invoice with Paystack
- [ ] Payment receipt email arrives after payment
- [ ] Admin can upload a file (shared) to client; client receives notification email
- [ ] Client can upload a file; admin receives notification email
- [ ] Admin can log a communication — Gemini suggests mood score
- [ ] Mood trend chart updates on client profile after logging communications
- [ ] Admin can create a sequence, sync to Loops, and manually enrol a client
- [ ] Client requests subscription cancellation — admin sees it in the cancellation queue
- [ ] Admin approves cancellation — client receives confirmation email
- [ ] Invoice overdue cron marks invoice overdue and sends day-1 reminder email
- [ ] All Resend notification emails render correctly and arrive in inbox (not spam)
- [ ] Portal is fully functional on mobile (375px)
