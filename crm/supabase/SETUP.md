# BluuCRM — Supabase Project Setup

Step-by-step guide to go from a blank Supabase project to a working CRM.

---

## 1. Create the Supabase project

1. Go to **[app.supabase.com](https://app.supabase.com)** → New project.
2. Choose an organisation, pick a region close to your users (e.g. `eu-west-2` for UK, `us-east-1` for US), and set a strong database password — save it somewhere secure.
3. Wait for the project to provision (~60 s).
4. Copy these three values from **Project Settings → API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Deploy the schema

Open **SQL Editor** (left sidebar) → New query → paste the full contents of `schema.sql` → Run.

This creates all tables, RLS policies, helper functions, and indexes.

> **Tip:** The whole file is safe to re-run — tables use `IF NOT EXISTS`, and policies/triggers/the FK constraint drop-and-recreate themselves.

---

## 3. Deploy the access token hook + seed

Open another SQL Editor query → paste `functions.sql` → Run.

This:
- Creates `public.custom_access_token_hook` — the function Supabase calls when issuing every JWT
- Seeds Bluu Interactive as **tenant #1** (`id: 00000000-0000-0000-0000-000000000001`)

---

## 4. Register the custom access token hook

1. Go to **Authentication → Hooks** (left sidebar).
2. Click **Add hook** → select **Custom Access Token**.
3. Hook function: `public.custom_access_token_hook`
4. Save.

Without this hook, no JWT claims (tenant_id, user_type, crm_role) are injected and every RLS policy denies all access.

---

## 5. Configure Auth settings

Go to **Authentication → URL Configuration**:

| Setting | Value |
|---|---|
| Site URL | `https://crm.bluuhq.com` |
| Redirect URLs | `https://crm.bluuhq.com/api/auth/callback` |

Go to **Authentication → Email Templates** and customise the magic link and invite emails to use Bluu branding if you want Supabase to send them directly. (The CRM routes use Resend for production templates, so Supabase email is only used as a fallback.)

Go to **Authentication → Providers** to confirm email/password is enabled.

---

## 6. Set up environment variables

Copy `crm/.env.example` to `crm/.env.local` and fill in the values:

```bash
cp crm/.env.example crm/.env.local
```

Minimum required for the app to boot:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=https://crm.bluuhq.com

# Keep for any remaining WP-backed calls during Phase 1 transition
WORDPRESS_URL=https://bluuhq.com
WP_APP_USERNAME=<wp-app-user>
WP_APP_PASSWORD=<wp-app-password>
```

For Vercel, add these in **Project Settings → Environment Variables**.

---

## 7. Create the first admin user

Run the setup script from the repository root. It uses `tsx` (a zero-config
TypeScript runner) — `ts-node --esm` is flaky across Node versions and prone
to `ERR_UNKNOWN_FILE_EXTENSION` errors, so avoid it:

```bash
cd crm

ADMIN_EMAIL=yourname@bluuhq.com \
ADMIN_NAME="Your Name" \
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
NEXT_PUBLIC_SITE_URL=https://crm.bluuhq.com \
npx tsx scripts/setup-first-admin.ts
```

Or with a `.env.local` file already in place:

```bash
cd crm
npx dotenv-cli -e .env.local -- npx tsx scripts/setup-first-admin.ts
```

The script:
1. Ensures the Bluu Interactive tenant row exists
2. Creates a Supabase auth user for the email
3. Inserts a `team_members` row with `crm_role: super_admin`
4. Generates and prints a one-time invite link → share it with the admin

After clicking the invite link the admin lands at `/admin`, fully authenticated.

---

## 8. Verify the setup

1. Click the invite link → you should land at `/admin`.
2. Open your browser's DevTools → Application → Cookies. You should see `sb-*-auth-token` cookie(s) set by Supabase.
3. In the Supabase dashboard → Authentication → Users, you should see your user with **Confirmed** status.
4. In SQL Editor, run:
   ```sql
   select * from team_members;
   select * from tenants;
   ```
   You should see your user and the Bluu tenant.

---

## 9. Invite additional team members

From the CRM (once the app is deployed), go to **Settings → Team** and invite team members. Each invite:
1. Creates a Supabase auth user
2. Inserts a `team_members` row with the chosen CRM role
3. Sends a branded invite email via Resend

---

## What's next

- **Phase 2**: Tenant signup, Stripe billing, subdomain routing
- **Phase 3**: Migration script — import existing WP data into Supabase (`scripts/migrate-from-wp.ts`)
- **Phase 4**: White-label tier (custom domain, per-tenant branding)

---

## Useful Supabase SQL queries

```sql
-- List all users and their roles
select u.email, tm.crm_role, tm.status, t.name as tenant
from auth.users u
join team_members tm on tm.user_id = u.id
join tenants t on t.id = tm.tenant_id;

-- List all client portal users
select u.email, c.company_name, t.name as tenant
from auth.users u
join client_users cu on cu.user_id = u.id
join clients c on c.id = cu.client_id
join tenants t on t.id = cu.tenant_id;

-- Check affiliate registrations
select u.email, a.affiliate_code, a.status
from auth.users u
join affiliates a on a.user_id = u.id;
```
