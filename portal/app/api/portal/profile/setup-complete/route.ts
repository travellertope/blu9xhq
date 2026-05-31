import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";

export async function PATCH(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;

  if (!wpUserId) {
    return NextResponse.json({ error: "No WP user ID in session" }, { status: 400 });
  }

  try {
    await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
      method: "POST",
      body: JSON.stringify({
        meta: {
          portal_setup_complete: "1",
          portal_setup_completed_at: new Date().toISOString(),
        },
      }),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/profile/setup-complete] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
