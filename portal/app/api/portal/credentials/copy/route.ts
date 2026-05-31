import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { getSubscription } from "@/lib/wp-api";
import { decrypt } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/auditLog";

// Shared rate limit bucket with reveal — max 5 per 60s per clientId
const copyLog = new Map<number, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;

function isRateLimited(clientId: number): boolean {
  const now = Date.now();
  const timestamps = (copyLog.get(clientId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  copyLog.set(clientId, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as any;
  const clientId = parseInt(user.clientId ?? "0", 10);

  if (!clientId) {
    return NextResponse.json({ error: "No client profile linked" }, { status: 403 });
  }

  if (isRateLimited(clientId)) {
    return NextResponse.json(
      { error: "Too many requests — please wait before copying again" },
      { status: 429 }
    );
  }

  let subscriptionId: number;
  let fieldIndex: number;
  try {
    const body = await req.json();
    subscriptionId = parseInt(String(body.subscriptionId), 10);
    fieldIndex = parseInt(String(body.fieldIndex), 10);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (isNaN(subscriptionId) || isNaN(fieldIndex) || fieldIndex < 0) {
    return NextResponse.json({ error: "Invalid subscriptionId or fieldIndex" }, { status: 400 });
  }

  try {
    const sub = await getSubscription(subscriptionId);

    if (sub.acf.client_id !== clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let encryptedValues: string[] = [];
    try {
      encryptedValues = JSON.parse(sub.acf.sub_sensitive_field_values ?? "[]");
    } catch {
      encryptedValues = [];
    }

    if (fieldIndex >= encryptedValues.length) {
      return NextResponse.json({ error: "Field index out of range" }, { status: 400 });
    }

    let labels: string[] = [];
    try {
      labels = JSON.parse(sub.acf.sub_sensitive_field_labels ?? "[]");
    } catch {
      labels = [];
    }

    const decrypted = decrypt(encryptedValues[fieldIndex]);

    logAuditEvent({
      action: "portal.credential.copied",
      actorName: user.name ?? user.email,
      actorWpUserId: user.wpUserId,
      detail: `Subscription #${subscriptionId} field "${labels[fieldIndex] ?? fieldIndex}"`,
      clientId,
    }).catch(() => {});

    return NextResponse.json({ value: decrypted });
  } catch (err) {
    console.error("[POST /api/portal/credentials/copy]", err);
    return NextResponse.json({ error: "Failed to copy credential" }, { status: 500 });
  }
}
