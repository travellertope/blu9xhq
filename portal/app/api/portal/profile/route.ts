import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {wpRestFetch, resolveClientPost} from "@/lib/wp-api";
import { syncContact } from "@/lib/loops";
import type { WPUser } from "@/lib/wp-api";

export async function GET(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; clientId?: number | string; email?: string | null };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const [wpUser, clientPost] = await Promise.all([
      wpRestFetch<WPUser>("/wp/v2/users/" + wpUserId),
      resolveClientPost(sessionClientId, wpUserId),
    ]);

    const meta = wpUser.meta as Record<string, unknown>;
    const nameParts = (wpUser.name ?? "").trim().split(" ");
    const firstName = String(meta.first_name ?? nameParts[0] ?? "");
    const lastName = String(meta.last_name ?? nameParts.slice(1).join(" ") ?? "");

    let billingAddress: Record<string, string> = {};
    try {
      const raw = meta.billing_address;
      if (raw && typeof raw === "string") billingAddress = JSON.parse(raw);
      else if (raw && typeof raw === "object") billingAddress = raw as Record<string, string>;
    } catch { billingAddress = {}; }

    return NextResponse.json({
      firstName,
      lastName,
      email: wpUser.email,
      phone: String(meta.portal_phone ?? ""),
      company: clientPost?.acf.company_name ?? "",
      billingAddress,
      notificationPreferences: Array.isArray(meta.notification_preferences)
        ? meta.notification_preferences
        : ["invoice_reminders", "new_files", "service_updates"],
    });
  } catch (err) {
    console.error("[GET /api/portal/profile]", err);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as { wpUserId?: number; clientId?: number | string; email?: string | null };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  let body: { firstName?: string; lastName?: string; phone?: string; billingAddress?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { firstName, lastName, phone, billingAddress } = body;

  const meta: Record<string, unknown> = {};
  if (typeof firstName === "string") meta.first_name = firstName;
  if (typeof lastName === "string") meta.last_name = lastName;
  if (typeof phone === "string") meta.portal_phone = phone;
  if (billingAddress && typeof billingAddress === "object") {
    meta.billing_address = JSON.stringify(billingAddress);
  }

  const payload: Record<string, unknown> = { meta };
  if (typeof firstName === "string" || typeof lastName === "string") {
    const wpUser = await wpRestFetch<WPUser>("/wp/v2/users/" + wpUserId);
    const existing = wpUser.name ?? "";
    const existingMeta = wpUser.meta as Record<string, unknown>;
    const fn = typeof firstName === "string" ? firstName : String(existingMeta.first_name ?? existing.split(" ")[0] ?? "");
    const ln = typeof lastName === "string" ? lastName : String(existingMeta.last_name ?? existing.split(" ").slice(1).join(" ") ?? "");
    payload.name = (fn + " " + ln).trim();
  }

  try {
    await wpRestFetch("/wp/v2/users/" + wpUserId, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (clientPost) {
      void syncContact({
        id: clientPost.id,
        portalEmail: clientPost.acf.portal_email,
        contactName: clientPost.acf.contact_name,
        companyName: clientPost.acf.company_name,
        status: clientPost.acf.status,
        healthStatus: clientPost.acf.health_status,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/portal/profile]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
