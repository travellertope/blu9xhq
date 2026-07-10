#!/usr/bin/env npx tsx
/**
 * BluuCRM — first-admin setup script
 *
 * Creates the first Bluu Interactive team member in Supabase.
 * Run once after deploying schema.sql and functions.sql.
 *
 * Usage (from the crm/ directory):
 *   ADMIN_EMAIL=you@bluuhq.com ADMIN_NAME="Your Name" \
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   npx tsx scripts/setup-first-admin.ts
 *
 * Or set env vars in crm/.env.local and run from the crm/ directory:
 *   cd crm && npx dotenv-cli -e .env.local -- npx tsx scripts/setup-first-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import { WebSocket } from "ws";

// @supabase/supabase-js constructs a realtime client eagerly, which needs a
// global WebSocket — only native on Node 22+. Polyfill it for older Node.
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = WebSocket;
}

const BLUU_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const url    = process.env.NEXT_PUBLIC_SUPABASE_URL;
const srvKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email  = process.env.ADMIN_EMAIL;
const name   = process.env.ADMIN_NAME ?? "Bluu Admin";

if (!url || !srvKey || !email) {
  console.error(
    "Missing required env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL"
  );
  process.exit(1);
}

const supabase = createClient(url, srvKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`\n🔧 BluuCRM first-admin setup`);
  console.log(`   Supabase: ${url}`);
  console.log(`   Email:    ${email}`);
  console.log(`   Name:     ${name}\n`);

  // ── 1. Ensure Bluu tenant exists ──────────────────────────────────────────
  console.log("1/4  Ensuring Bluu Interactive tenant exists…");
  const { error: tenantErr } = await supabase
    .from("tenants")
    .upsert(
      {
        id:           BLUU_TENANT_ID,
        name:         "Bluu Interactive",
        slug:         "bluu",
        plan:         "agency",
        status:       "active",
        accent_colour:"#2F5FE0",
      },
      { onConflict: "id" }
    );
  if (tenantErr) throw new Error(`tenant upsert: ${tenantErr.message}`);
  console.log("     ✓ tenant ready");

  // ── 2. Create (or find) Supabase auth user ────────────────────────────────
  console.log("2/4  Creating Supabase auth user…");

  const { data: existingList } = await supabase.auth.admin.listUsers();
  let userId: string;
  const existing = existingList?.users?.find(
    (u) => u.email?.toLowerCase() === (email as string).toLowerCase()
  );

  if (existing) {
    userId = existing.id;
    console.log(`     ✓ user already exists (${userId})`);
  } else {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      email_confirm:  true,
      user_metadata:  { full_name: name },
    });
    if (createErr || !created.user) throw new Error(createErr?.message ?? "create user failed");
    userId = created.user.id;
    console.log(`     ✓ created auth user (${userId})`);
  }

  // ── 3. Insert team_members row ────────────────────────────────────────────
  console.log("3/4  Inserting team_members row as super_admin…");
  const { error: tmErr } = await supabase
    .from("team_members")
    .upsert(
      {
        user_id:   userId,
        tenant_id: BLUU_TENANT_ID,
        crm_role:  "super_admin",
        status:    "active",
      },
      { onConflict: "tenant_id,user_id" }
    );
  if (tmErr) throw new Error(`team_members upsert: ${tmErr.message}`);
  console.log("     ✓ team_members row ready");

  // ── 4. Send magic link so admin can log in ────────────────────────────────
  // "invite" only works for emails with no existing user — but step 2 above
  // always creates (or finds) the user first, so this must be "magiclink".
  console.log("4/4  Sending magic link…");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { data: link, error: linkErr } = await supabase.auth.admin.generateLink({
    type:    "magiclink",
    email:   email as string,
    options: { redirectTo: `${siteUrl}/admin` },
  });
  if (linkErr) {
    console.warn(`     ⚠ Could not generate magic link: ${linkErr.message}`);
    console.warn("     Set a password manually in the Supabase dashboard → Authentication → Users");
  } else {
    console.log("\n     ✓ Magic link generated — share this with the admin:\n");
    console.log("     " + link?.properties?.action_link);
    console.log();
  }

  console.log("✅  Setup complete. The admin can now log in at /admin-login.\n");
}

main().catch((err) => {
  console.error("\n❌  Setup failed:", err.message);
  process.exit(1);
});
