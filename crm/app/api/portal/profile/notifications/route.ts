import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";

const VALID_PREFS = new Set(["invoice_reminders", "new_files", "service_updates"]);

export async function PATCH(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number };
  const wpUserId = user.wpUserId;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  let body: { preferences?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (!Array.isArray(body.preferences)) {
    return NextResponse.json({ error: "preferences must be an array" }, { status: 400 });
  }

  const cleaned = body.preferences.filter(
    (k): k is string => typeof k === "string" && VALID_PREFS.has(k)
  );

  try {
    await wpRestFetch("/wp/v2/users/" + wpUserId, {
      method: "POST",
      body: JSON.stringify({ meta: { notification_preferences: cleaned } }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/portal/profile/notifications]", err);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
