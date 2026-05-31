import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientPost, updateClientPost } from "@/lib/wp-api";
import { sendPortalInvite } from "@/lib/resend";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "bluu_admin") return null;
  return session;
}

// POST /api/admin/clients/[id]/invite
// Sends a portal invite email to the client's portal_email address.
// Uses the portal-login page — clients can use the "Magic Link" tab to sign in.

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const post = await getClientPost(postId);
    const { acf } = post;

    const portalEmail = acf.portal_email;
    if (!portalEmail) {
      return NextResponse.json({ error: "Client has no portal email" }, { status: 422 });
    }

    // Derive client first name — prefer contact_name, fallback to post title
    const contactName = acf.contact_name
      ? acf.contact_name.split(" ")[0]
      : post.title.rendered;

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal-login`;

    await sendPortalInvite(portalEmail, {
      clientName: contactName,
      loginUrl: portalUrl,
    });

    // Record invite timestamp in WP
    await updateClientPost(postId, {
      acf: { portal_invited_at: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, sentTo: portalEmail });
  } catch (err: any) {
    console.error("[POST /api/admin/clients/[id]/invite]", err);
    return NextResponse.json({ error: err.message ?? "Failed to send invite" }, { status: 502 });
  }
}
