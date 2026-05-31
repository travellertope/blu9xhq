import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import { findClientByWpUserId, wpRestFetch } from "@/lib/wp-api";
import type { WPSubscriptionPost } from "@/lib/wp-api";
import { decrypt } from "@/lib/encryption";
import { logAuditEvent } from "@/lib/auditLog";
import { sendEmail } from "@/lib/resend";

// Rate limiting: 60-second TTL per user+subscription+field combo
const copyCooldowns = new Map<string, number>();

function checkRateLimit(key: string): boolean {
  const last = copyCooldowns.get(key);
  if (last && Date.now() - last < 60_000) return false;
  copyCooldowns.set(key, Date.now());
  return true;
}

interface SensitiveFieldEntry {
  label: string;
  encrypted_value: string;
}

export async function POST(req: NextRequest) {
  const result = await requireClientSession(req);
  if (result instanceof NextResponse) return result;
  const { session } = result;

  const user = session.user as {
    wpUserId?: number;
    name?: string | null;
    email?: string | null;
    id?: string;
  };
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

  const { subscriptionId, fieldLabel } = body as {
    subscriptionId?: unknown;
    fieldLabel?: unknown;
  };

  if (typeof subscriptionId !== "number" || typeof fieldLabel !== "string") {
    return NextResponse.json({ error: "subscriptionId and fieldLabel are required" }, { status: 400 });
  }

  const sessionUserId = user.id ?? String(wpUserId);
  const rateLimitKey = `${sessionUserId}:${subscriptionId}:${fieldLabel}`;

  if (!checkRateLimit(rateLimitKey)) {
    return NextResponse.json(
      { error: "Please wait before copying again" },
      { status: 429 }
    );
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

    if (!sub.acf.sensitive_field_values) {
      return NextResponse.json({ error: "No credentials found" }, { status: 404 });
    }

    let fields: SensitiveFieldEntry[] = [];
    try {
      fields = JSON.parse(sub.acf.sensitive_field_values) as SensitiveFieldEntry[];
    } catch {
      return NextResponse.json({ error: "Failed to parse credentials" }, { status: 500 });
    }

    const entry = fields.find((f) => f.label === fieldLabel);
    if (!entry) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const plaintext = decrypt(entry.encrypted_value);

    // Fire and forget: audit + email
    logAuditEvent({
      action: "credential_copied",
      actorName: user.name ?? "Client",
      actorWpUserId: wpUserId,
      detail: `Field: ${fieldLabel} on subscription ${subscriptionId} (copied)`,
      clientId: clientPost.id,
    }).catch((err) => console.error("[copy] auditLog failed:", err));

    const adminEmail = process.env.ADMIN_EMAIL ?? "hello@bluuhq.com";
    sendEmail({
      to: adminEmail,
      subject: `Credential copied — ${fieldLabel}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Credential Copied</h2>
          <p><strong>Client:</strong> ${user.name ?? "Unknown"} (${user.email ?? ""})</p>
          <p><strong>Subscription ID:</strong> ${subscriptionId}</p>
          <p><strong>Field:</strong> ${fieldLabel}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
      text: `Credential copied\nClient: ${user.name ?? "Unknown"}\nField: ${fieldLabel}\nSubscription: ${subscriptionId}`,
      tags: [{ name: "type", value: "credential_copy" }],
    }).catch((err) => console.error("[copy] email failed:", err));

    return NextResponse.json({ value: plaintext });
  } catch (err) {
    console.error("[portal/credentials/copy] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
