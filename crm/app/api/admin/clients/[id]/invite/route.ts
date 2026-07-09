import { getSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getClientPost, updateClientPost } from "@/lib/wp-api";
import { sendPortalInvite } from "@/lib/resend";
import { decrypt } from "@/lib/encryption";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "bluu_admin") return null;
  return session;
}

function tryDecrypt(value: string): string {
  try { return decrypt(value); } catch { return value; }
}

// POST /api/admin/clients/[id]/invite
// Creates a Supabase auth user for the client (if they don't already have one),
// inserts them into client_users, and sends the Supabase magic-link invite.

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const supabase = createSupabaseAdminClient();
    const post = await getClientPost(postId);
    const { acf } = post;

    const portalEmail =
      acf.portal_email ||
      (acf.contact_email ? tryDecrypt(acf.contact_email) : null);

    if (!portalEmail) {
      return NextResponse.json(
        { error: "Client has no email address. Please edit the client and add one first." },
        { status: 422 }
      );
    }

    const contactName = acf.contact_name
      ? acf.contact_name.split(" ")[0]
      : post.title.rendered;

    // ── Ensure Supabase auth user exists ─────────────────────────────────────
    let supaUserId: string;

    const { data: existing } = await supabase.auth.admin.listUsers();
    const existingUser = existing?.users?.find(
      (u) => u.email?.toLowerCase() === portalEmail.toLowerCase()
    );

    if (existingUser) {
      supaUserId = existingUser.id;
    } else {
      // Create without confirming email — invite link will do that.
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email:          portalEmail,
        email_confirm:  false,
        user_metadata:  { full_name: acf.contact_name || post.title.rendered },
      });
      if (createErr || !created.user) {
        throw new Error(createErr?.message ?? "Failed to create Supabase user");
      }
      supaUserId = created.user.id;
    }

    // ── Ensure client_users row exists (links auth user → tenant + client) ───
    // Find the Supabase clients row by wp_post_id migration ref
    const { data: clientRow } = await supabase
      .from("clients")
      .select("id, tenant_id")
      .eq("wp_post_id", postId)
      .maybeSingle();

    if (clientRow) {
      await supabase
        .from("client_users")
        .upsert(
          {
            user_id:   supaUserId,
            tenant_id: clientRow.tenant_id,
            client_id: clientRow.id,
            wp_user_id: null,
          },
          { onConflict: "tenant_id,user_id" }
        );

      // Back-fill portal_user_id on the clients row if not set
      await supabase
        .from("clients")
        .update({ portal_user_id: supaUserId })
        .eq("id", clientRow.id)
        .is("portal_user_id", null);
    }

    // ── Send Supabase invite magic link ───────────────────────────────────────
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type:       "invite",
      email:      portalEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/portal/verify`,
      },
    });

    if (linkErr || !linkData?.properties?.action_link) {
      throw new Error(linkErr?.message ?? "Failed to generate invite link");
    }

    const inviteLink = linkData.properties.action_link;

    // Send via Resend so it uses our branded template
    await sendPortalInvite(portalEmail, {
      clientName: contactName,
      loginUrl:   inviteLink,
    });

    // Update WP CPT to record invite sent (still used by Phase 1 admin UI)
    await updateClientPost(postId, {
      acf: {
        portal_invited_at: new Date().toISOString(),
        portal_email:      portalEmail,
      },
    });

    return NextResponse.json({ success: true, sentTo: portalEmail });
  } catch (err: any) {
    console.error("[POST /api/admin/clients/[id]/invite]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send invite" }, { status: 502 });
  }
}
