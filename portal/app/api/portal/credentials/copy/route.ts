import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, wpRestFetch } from "@/lib/wp-api";
import type { WPSubscriptionPost } from "@/lib/wp-api";
import { decrypt } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/auditLog";

// Rate limit: 5 copies per 60 seconds per wpUserId
const copyLog = new Map<number, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;

function isRateLimited(wpUserId: number): boolean {
  const now = Date.now();
  const timestamps = (copyLog.get(wpUserId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  copyLog.set(wpUserId, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as { wpUserId?: number; name?: string | null };
  const wpUserId = user.wpUserId;

  if (!wpUserId) {
    return NextResponse.json({ error: "No WP user ID in session" }, { status: 400 });
  }

  if (isRateLimited(wpUserId)) {
    return NextResponse.json(
      { error: "Please wait before copying again" },
      { status: 429 }
    );
  }

  let subscriptionId: number;
  let fieldLabel: string;
  try {
    const body = await req.json();
    subscriptionId = parseInt(String(body.subscriptionId), 10);
    fieldLabel = String(body.fieldLabel ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (isNaN(subscriptionId) || !fieldLabel) {
    return NextResponse.json({ error: "subscriptionId and fieldLabel are required" }, { status: 400 });
  }

  try {
    const clientPost = await findClientByWpUserId(wpUserId);
    if (!clientPost) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const sub = await wpRestFetch<WPSubscriptionPost>(
      `/wp/v2/bluu_subscription/${subscriptionId}`
    );

    if (sub.acf.client_id !== clientPost.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let labels: string[] = [];
    let encryptedValues: string[] = [];
    try {
      labels = JSON.parse(sub.acf.sub_sensitive_field_labels ?? "[]");
      encryptedValues = JSON.parse(sub.acf.sub_sensitive_field_values ?? "[]");
    } catch {
      return NextResponse.json({ error: "Failed to parse credentials" }, { status: 500 });
    }

    const fieldIndex = labels.indexOf(fieldLabel);
    if (fieldIndex === -1 || fieldIndex >= encryptedValues.length) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const plaintext = decrypt(encryptedValues[fieldIndex]);

    logAuditEvent({
      action: "portal.credential.copied",
      actorName: user.name ?? "Client",
      actorWpUserId: wpUserId,
      detail: `Subscription #${subscriptionId} field "${fieldLabel}"`,
      clientId: clientPost.id,
    }).catch((err) => console.error("[copy] auditLog failed:", err));

    return NextResponse.json({ value: plaintext });
  } catch (err) {
    console.error("[portal/credentials/copy] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
