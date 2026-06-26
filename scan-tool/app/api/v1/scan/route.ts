import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { z } from "zod";
import { authenticateApiKey } from "@/lib/api-auth";
import { addScanToUserIndex, checkAndIncrementMonthlyScans } from "@/lib/redis";
import { TIER_SCAN_LIMITS } from "@/lib/stripe";
import { createScanId, initScan, runScan } from "@/lib/scan/engine";
import type { ScanInput } from "@/lib/scan/types";

export const maxDuration = 300;

const ScanSchema = z.object({
  domain: z.string().optional(),
  brand: z.string().optional(),
  niche: z.string().optional(),
  noSite: z.boolean().default(false),
});

function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

export async function POST(request: Request) {
  const user = await authenticateApiKey(request);
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (user.tier !== "monitor_pro") {
    return NextResponse.json(
      { error: "forbidden", message: "API access requires the Monitor Pro plan." },
      { status: 403 }
    );
  }

  const withinLimit = await checkAndIncrementMonthlyScans(user.email, TIER_SCAN_LIMITS[user.tier]);
  if (!withinLimit) {
    return NextResponse.json(
      { error: "scan_limit_reached", message: "You've used all your scans this month." },
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

  const parsed = ScanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const { domain, brand, niche, noSite } = parsed.data;

  if (!noSite && !domain) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "Either a domain or 'noSite: true' with a brand name is required.",
      },
      { status: 400 }
    );
  }

  if (noSite && !brand && !niche) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "When no site is provided, brand or niche is required.",
      },
      { status: 400 }
    );
  }

  const input: ScanInput = {
    domain: domain ? normalizeDomain(domain) : undefined,
    brand: brand?.trim() || undefined,
    niche: niche?.trim() || undefined,
    noSite,
  };

  const id = createScanId();
  await initScan(id, input);

  waitUntil(
    runScan(id, input)
      .then(() => addScanToUserIndex(user.email, id))
      .catch(() => {})
  );

  return NextResponse.json({
    id,
    status: "processing",
    createdAt: new Date().toISOString(),
  });
}
