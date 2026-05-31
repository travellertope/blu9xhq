import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch, findClientByWpUserId } from "@/lib/wp-api";
import { syncContact } from "@/lib/loops";

export async function PATCH(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) {
    return NextResponse.json({ error: "No WP user ID in session" }, { status: 400 });
  }

  const now = new Date().toISOString();

  try {
    await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
      method: "POST",
      body: JSON.stringify({
        meta: {
          portal_setup_complete: "1",
          portal_setup_completed_at: now,
          portal_last_login: now,
        },
      }),
    });

    const clientPost = await findClientByWpUserId(wpUserId);
    if (clientPost) {
      void syncContact({
        id: clientPost.id,
        portalEmail: clientPost.acf.portal_email,
        contactName: clientPost.acf.contact_name,
        companyName: clientPost.acf.company_name,
        status: clientPost.acf.status,
        healthStatus: clientPost.acf.health_status,
        lastLoginAt: now,
        portalSetupComplete: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/profile/setup-complete] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
