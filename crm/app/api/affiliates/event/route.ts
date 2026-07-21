import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch } from "@/lib/wp-api";
import { z } from "zod";
import type { AffiliateProduct, ConversionType } from "@/types";

const schema = z.object({
  affiliateCode:   z.string().regex(/^[A-Z0-9]{4,20}$/i),
  product:         z.enum(["scan_tool", "portal", "shop_tool", "hosting_mgmt", "content_ops", "web_dev", "ai_integration"]),
  conversionType:  z.enum(["scan", "lead", "trial", "paid_subscription", "one_time_purchase", "project_signed"]),
  grossAmount:     z.number().nonnegative().optional(),
  currency:        z.string().length(3).optional(),
  externalRef:     z.string().optional(),
  metadata:        z.record(z.unknown()).optional(),
});

// Commission rates per product (recurring %)
const COMMISSION_RATES: Record<AffiliateProduct, number> = {
  scan_tool:      0.30,
  portal:         0.30,
  shop_tool:      0.30,
  hosting_mgmt:   0.30,
  content_ops:    0.15,
  web_dev:        0.10,
  ai_integration: 0.10,
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-bluu-internal-secret");
  if (!secret || secret !== process.env.BLUU_INTERNAL_SECRET) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation error." }, { status: 422 });
  }

  const { affiliateCode, product, conversionType, grossAmount, currency, externalRef, metadata } = parsed.data;

  const rate = COMMISSION_RATES[product as AffiliateProduct];
  const commissionAmount = grossAmount != null ? parseFloat((grossAmount * rate).toFixed(2)) : null;

  try {
    // Record conversion CPT
    await wpRestFetch("/wp/v2/bluu_aff_conversion", {
      method: "POST",
      body: JSON.stringify({
        status: "publish",
        title:  `${product} — ${conversionType} — ${affiliateCode}`,
        meta: {
          affiliate_code:   affiliateCode,
          product,
          conversion_type:  conversionType,
          gross_amount:     grossAmount ?? 0,
          currency:         currency ?? "USD",
          commission_amount: commissionAmount ?? 0,
          commission_rate:  rate,
          external_ref:     externalRef ?? "",
          conversion_status: "pending",
          converted_at:     new Date().toISOString(),
          metadata:         metadata ? JSON.stringify(metadata) : "",
        },
      }),
    });

    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error("[POST /api/affiliates/event]", err);
    return NextResponse.json({ error: "Failed to record event." }, { status: 502 });
  }
}
