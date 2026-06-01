import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientPost, updateClientPost } from "@/lib/wp-api";
import { sendPortalInvite } from "@/lib/resend";
import { decrypt } from "@/lib/encryption";

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

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal-login`;

    await sendPortalInvite(portalEmail, {
      clientName: contactName,
      loginUrl:   portalUrl,
    });

    await updateClientPost(postId, {
      acf: {
        portal_invited_at: new Date().toISOString(),
        // Ensure portal_email is persisted for future use
        portal_email: portalEmail,
      },
    });

    return NextResponse.json({ success: true, sentTo: portalEmail });
  } catch (err: any) {
    console.error("[POST /api/admin/clients/[id]/invite]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send invite" }, { status: 502 });
  }
}
