import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch } from "@/lib/wp-api";
import { z } from "zod";

const schema = z.object({
  affiliateCode: z.string().regex(/^[A-Z0-9]{4,20}$/i),
  source:        z.string().optional(),
  page:          z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid affiliate code." }, { status: 422 });
  }

  const { affiliateCode, source, page } = parsed.data;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
           ?? req.headers.get("x-real-ip")
           ?? "unknown";

  try {
    await wpRestFetch("/wp/v2/bluu_aff_click", {
      method: "POST",
      body: JSON.stringify({
        status: "publish",
        title:  `Click — ${affiliateCode} — ${new Date().toISOString()}`,
        meta: {
          affiliate_code: affiliateCode,
          click_source:   source ?? "direct",
          click_page:     page ?? "",
          ip_hash:        Buffer.from(ip).toString("base64").slice(0, 16),
          clicked_at:     new Date().toISOString(),
        },
      }),
    });
    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error("[POST /api/affiliates/track]", err);
    // Non-critical — return ok so client doesn't block
    return NextResponse.json({ recorded: false });
  }
}
