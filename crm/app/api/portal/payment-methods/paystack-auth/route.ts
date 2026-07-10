import { NextRequest, NextResponse } from "next/server";
import { requireClientSession } from "@/lib/apiPermissions";
import {resolveClientPost} from "@/lib/wp-api";
import { initializePaystackTransaction } from "@/lib/paystack";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const auth = await requireClientSession(req);
  if (auth instanceof NextResponse) return auth;
  const { session } = auth;

  const user = session.user as {
    wpUserId?: number;
    clientId?: number | string;
    email?: string | null;
  };
  const wpUserId = user.wpUserId;
  const sessionClientId = user.clientId ? Number(user.clientId) : undefined;
  if (!wpUserId) return NextResponse.json({ error: "No WP user ID" }, { status: 400 });

  try {
    const clientPost = await resolveClientPost(sessionClientId, wpUserId);
    if (!clientPost) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const email = user.email ?? clientPost.acf.portal_email;
    const reference = `auth_${wpUserId}_${crypto.randomBytes(8).toString("hex")}`;
    const callbackUrl =
      (process.env.NEXTAUTH_URL ?? "") + "/portal/payment-methods/paystack-callback";

    const tx = await initializePaystackTransaction({
      email,
      amount: 50,
      currency: "NGN",
      reference,
      callback_url: callbackUrl,
      metadata: { wpUserId, type: "auth_only" },
    });

    return NextResponse.json({ authorizationUrl: tx.authorization_url });
  } catch (err) {
    console.error("[POST /api/portal/payment-methods/paystack-auth]", err);
    return NextResponse.json({ error: "Failed to initialize Paystack auth" }, { status: 500 });
  }
}
