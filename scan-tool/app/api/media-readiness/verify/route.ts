import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { checkRateLimit } from "@/lib/redis";
import { createVerificationId, initVerification, runVerification } from "@/lib/mediaReadiness/engine";

// Grounded search + generation can take longer than the default 10s.
export const maxDuration = 60;

const VerifySchema = z.object({
  name: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  website: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Try again in an hour." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const parsed = VerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const id = createVerificationId();
  await initVerification(id, input);

  waitUntil(runVerification(id, input).catch(() => {}));

  return NextResponse.json({ id, status: "processing", createdAt: new Date().toISOString() });
}
