import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, wpRestFetch } from "@/lib/wp-api";
import { syncContact } from "@/lib/loops";

export async function PATCH(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as {
    wpUserId?: number;
    name?: string | null;
  };
  const wpUserId = user.wpUserId;

  if (!wpUserId) {
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();

  // Fire and forget — don't block the response
  Promise.all([
    wpRestFetch(`/wp/v2/users/${wpUserId}`, {
      method: "POST",
      body: JSON.stringify({ meta: { portal_last_login: now } }),
    }).catch((err) => console.error("[login-ping] updateWPUser failed:", err)),
    findClientByWpUserId(wpUserId)
      .then((clientPost) => {
        if (!clientPost) return;
        return syncContact({
          id: clientPost.id,
          portalEmail: clientPost.acf.portal_email,
          contactName: clientPost.acf.contact_name ?? user.name ?? "",
          companyName: clientPost.acf.company_name,
          status: clientPost.acf.status,
          healthStatus: clientPost.acf.health_status,
          activeSubscriptionCount: clientPost.acf.active_subscription_count,
          lastLoginAt: now,
        });
      })
      .catch((err) => console.error("[login-ping] syncContact failed:", err)),
  ]).catch(() => undefined);

  return NextResponse.json({ ok: true });
}
