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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { firstName, lastName, phone } = body as {
    firstName?: unknown;
    lastName?: unknown;
    phone?: unknown;
  };

  const name =
    typeof firstName === "string" && typeof lastName === "string"
      ? `${firstName} ${lastName}`.trim()
      : typeof firstName === "string"
      ? firstName
      : undefined;

  const payload: Record<string, unknown> = {};
  if (name) payload.name = name;
  if (typeof phone === "string") {
    payload.meta = { portal_phone: phone };
  }

  try {
    await wpRestFetch(`/wp/v2/users/${wpUserId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[portal/profile] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
