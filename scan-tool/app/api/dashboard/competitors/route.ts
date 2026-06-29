import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { addTrackedCompetitor, removeTrackedCompetitor, getTrackedCompetitors, getUser } from "@/lib/redis";
import { TIER_COMPETITOR_LIMITS } from "@/lib/stripe";

const DomainSchema = z.object({
  domain: z
    .string()
    .min(1)
    .transform((d) => d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "")),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ competitors: await getTrackedCompetitors(email) });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = DomainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const user = await getUser(email);
  const limit = TIER_COMPETITOR_LIMITS[user?.tier || "free"];
  if (limit === 0) {
    return NextResponse.json(
      { error: "forbidden", message: "Competitor tracking requires the Monitor plan or higher." },
      { status: 403 }
    );
  }

  const result = await addTrackedCompetitor(email, parsed.data.domain, limit);
  if (!result.ok) {
    return NextResponse.json({ error: "add_failed", message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = DomainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  await removeTrackedCompetitor(email, parsed.data.domain);
  return NextResponse.json({ ok: true });
}
