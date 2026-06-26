import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createApiKey, getApiKeyForUser, revokeApiKey, getUser } from "@/lib/redis";

async function regenerate(email: string) {
  await revokeApiKey(email);
  return createApiKey(email);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const apiKey = await getApiKeyForUser(email);
  return NextResponse.json({ apiKey });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await getUser(email);
  if (user?.tier !== "monitor_pro") {
    return NextResponse.json(
      { error: "forbidden", message: "API access requires the Monitor Pro plan." },
      { status: 403 }
    );
  }

  const apiKey = await regenerate(email);
  return NextResponse.json({ apiKey });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await revokeApiKey(email);
  return NextResponse.json({ ok: true });
}
