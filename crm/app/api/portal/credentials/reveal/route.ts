import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/auditLog";

// Rate limit: 5 reveals per 60 seconds per user
const revealLog = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (revealLog.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  revealLog.set(userId, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const clientId = session.user.clientId;
  const tenantId = session.user.tenantId!;
  const userId = session.user.id;

  if (!clientId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: "Please wait before revealing again" },
      { status: 429 }
    );
  }

  let subscriptionId: string;
  let fieldLabel: string;
  try {
    const body = await req.json();
    subscriptionId = String(body.subscriptionId ?? "");
    fieldLabel = String(body.fieldLabel ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!subscriptionId || !fieldLabel) {
    return NextResponse.json({ error: "subscriptionId and fieldLabel are required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data: sub, error } = await supabase
      .from("subscriptions")
      .select("sensitive_field_labels, sensitive_field_values")
      .eq("id", subscriptionId)
      .eq("tenant_id", tenantId)
      .eq("client_id", clientId)
      .maybeSingle();
    if (error) throw error;
    if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const labels: string[] = sub.sensitive_field_labels ?? [];
    const encryptedValues: string[] = sub.sensitive_field_values ?? [];

    const fieldIndex = labels.indexOf(fieldLabel);
    if (fieldIndex === -1 || fieldIndex >= encryptedValues.length) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const plaintext = decrypt(encryptedValues[fieldIndex]);

    logAuditEvent({
      action: "portal.credential.revealed",
      actorName: session.user.name ?? "Client",
      detail: `Subscription ${subscriptionId} field "${fieldLabel}"`,
      clientId,
    }).catch((err) => console.error("[reveal] auditLog failed:", err));

    return NextResponse.json({ value: plaintext });
  } catch (err) {
    console.error("[portal/credentials/reveal] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
