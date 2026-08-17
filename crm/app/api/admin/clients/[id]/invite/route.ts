import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendPortalInvite } from "@/lib/resend";
import { decrypt } from "@/lib/encryption";

function tryDecrypt(value: string): string {
  try { return decrypt(value); } catch { return value; }
}

// POST /api/admin/clients/[id]/invite
// Creates a Supabase auth user for the client (if they don't already have one),
// inserts them into client_users, and sends the Supabase magic-link invite.

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission(req, "send_portal_invites");
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;
  const tenantId = session.user.tenantId!;

  try {
    const supabase = createSupabaseAdminClient();
    const admin = createSupabaseAdminClient();

    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id, tenant_id, contact_name, contact_email, portal_email")
      .eq("id", params.id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (clientErr) throw clientErr;
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const portalEmail =
      client.portal_email ||
      (client.contact_email ? tryDecrypt(client.contact_email) : null);

    if (!portalEmail) {
      return NextResponse.json(
        { error: "Client has no email address. Please edit the client and add one first." },
        { status: 422 }
      );
    }

    const contactName = client.contact_name?.split(" ")[0] ?? "there";

    // ── Ensure Supabase auth user exists + generate their sign-in link ───────
    // "invite" only works for emails with no existing user (it creates the
    // user as part of generating the link) — calling createUser() first and
    // then generateLink({type:"invite"}) always fails "already registered".
    // For an existing user, "magiclink" is the correct type instead.
    let supaUserId: string;
    let inviteLink: string;

    const { data: existing } = await admin.auth.admin.listUsers();
    const existingUser = existing?.users?.find(
      (u) => u.email?.toLowerCase() === portalEmail.toLowerCase()
    );

    if (existingUser) {
      supaUserId = existingUser.id;
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type:    "magiclink",
        email:   portalEmail,
        options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/verify` },
      });
      if (linkErr || !linkData?.properties?.action_link) {
        throw new Error(linkErr?.message ?? "Failed to generate sign-in link");
      }
      inviteLink = linkData.properties.action_link;
    } else {
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
        type:    "invite",
        email:   portalEmail,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/verify`,
          data:       { full_name: client.contact_name },
        },
      });
      if (linkErr || !linkData?.properties?.action_link || !linkData.user) {
        throw new Error(linkErr?.message ?? "Failed to generate invite link");
      }
      supaUserId = linkData.user.id;
      inviteLink = linkData.properties.action_link;
    }

    // ── Ensure client_users row exists (links auth user → tenant + client) ───
    await supabase
      .from("client_users")
      .upsert(
        {
          user_id:    supaUserId,
          tenant_id:  tenantId,
          client_id:  client.id,
          wp_user_id: null,
        },
        { onConflict: "tenant_id,user_id" }
      );

    // Send via Resend so it uses our branded template
    await sendPortalInvite(portalEmail, {
      clientName: contactName,
      loginUrl:   inviteLink,
    });

    // Back-fill portal_user_id / portal_email / portal_invited_at on the client row
    await supabase
      .from("clients")
      .update({
        portal_user_id:    supaUserId,
        portal_email:      portalEmail,
        portal_invited_at: new Date().toISOString(),
      })
      .eq("id", client.id);

    return NextResponse.json({ success: true, sentTo: portalEmail });
  } catch (err: any) {
    console.error("[POST /api/admin/clients/[id]/invite]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send invite" }, { status: 502 });
  }
}
