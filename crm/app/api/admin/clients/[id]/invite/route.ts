import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientPost, updateClientPost, createWPUser, updateWPUser, getUserByEmail } from "@/lib/wp-api";
import { findWPClientByEmail } from "@/lib/magicToken";
import { sendPortalInvite } from "@/lib/resend";
import { decrypt } from "@/lib/encryption";
import crypto from "crypto";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "bluu_admin") return null;
  return session;
}

function tryDecrypt(value: string): string {
  try { return decrypt(value); } catch { return value; }
}

// POST /api/admin/clients/[id]/invite
// Sends a portal invite email to the client's portal_email address.
// Falls back to contact_email (decrypted) if portal_email is not set.
// Also ensures a WP user with bluu_client role exists so magic-link login works.

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const post = await getClientPost(postId);
    const { acf } = post;

    // Prefer portal_email; fall back to decrypted contact_email
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

    // Ensure the client has a WP user account with bluu_client role.
    // Without this, findWPClientByEmail returns null and magic-link emails are never sent.
    let wpUser = await findWPClientByEmail(portalEmail);
    if (!wpUser) {
      const tempPassword = crypto.randomBytes(16).toString("base64url");
      wpUser = await createWPUser({
        username: portalEmail,
        email:    portalEmail,
        password: tempPassword,
        name:     acf.contact_name || post.title.rendered,
        roles:    ["bluu_client"],
      }).catch(async (err: Error) => {
        if (!err.message?.includes("existing_user_email")) throw err;
        // Email already registered under a different role — upgrade it
        const existing = await getUserByEmail(portalEmail);
        if (!existing) throw err;
        return updateWPUser(existing.id, { roles: ["bluu_client"] });
      });

      // Link WP user ↔ client CPT post (both directions)
      await updateClientPost(postId, { acf: { wp_user_id: wpUser.id } });
      await fetch(
        `${process.env.WORDPRESS_URL}/wp-json/wp/v2/users/${wpUser.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${process.env.WP_APP_USERNAME}:${process.env.WP_APP_PASSWORD}`
            ).toString("base64")}`,
          },
          body: JSON.stringify({ meta: { bluu_client_post_id: String(postId) } }),
        }
      );
    }

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal-login`;

    await sendPortalInvite(portalEmail, {
      clientName: contactName,
      loginUrl:   portalUrl,
    });

    await updateClientPost(postId, {
      acf: {
        portal_invited_at: new Date().toISOString(),
        portal_email: portalEmail,
      },
    });

    return NextResponse.json({ success: true, sentTo: portalEmail });
  } catch (err: any) {
    console.error("[POST /api/admin/clients/[id]/invite]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send invite" }, { status: 502 });
  }
}
