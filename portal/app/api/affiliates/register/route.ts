import { NextRequest, NextResponse } from "next/server";
import { wpRestFetch } from "@/lib/wp-api";
import { z } from "zod";

const schema = z.object({
  name:         z.string().min(2),
  email:        z.string().email(),
  password:     z.string().min(8),
  website:      z.string().url().optional().or(z.literal("")),
  howHeard:     z.string().optional(),
  agreedToTerms: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms." }) }),
});

function generateAffiliateCode(name: string): string {
  const prefix = name.replace(/\s+/g, "").replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}${suffix}`;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation error." }, { status: 422 });
  }

  const { name, email, password, website, howHeard } = parsed.data;

  // Check if email already exists in WP
  try {
    const existing = await wpRestFetch<any[]>(`/wp/v2/users?search=${encodeURIComponent(email)}&context=edit`);
    if (existing.length > 0 && existing.some((u: any) => u.email === email)) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
  } catch {
    // search may fail for non-admins; proceed
  }

  // Generate unique affiliate code (retry up to 5 times)
  let affiliateCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateAffiliateCode(name);
    try {
      const check = await wpRestFetch<any[]>(
        `/wp/v2/users?meta_key=bluu_affiliate_code&meta_value=${candidate}&context=edit`
      );
      if (check.length === 0) {
        affiliateCode = candidate;
        break;
      }
    } catch {
      affiliateCode = candidate;
      break;
    }
  }
  if (!affiliateCode) affiliateCode = generateAffiliateCode(name + Date.now());

  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0];
  const lastName  = nameParts.slice(1).join(" ") || "";

  try {
    const wpUser = await wpRestFetch<any>("/wp/v2/users", {
      method: "POST",
      body: JSON.stringify({
        username:   email,
        email,
        password,
        first_name: firstName,
        last_name:  lastName,
        name,
        roles:      ["bluu_affiliate"],
        meta: {
          bluu_affiliate_code:    affiliateCode,
          bluu_affiliate_status:  "active",
          bluu_affiliate_website: website ?? "",
          bluu_affiliate_agreed_at: new Date().toISOString(),
          ...(howHeard ? { bluu_affiliate_how_heard: howHeard } : {}),
        },
      }),
    });

    return NextResponse.json({ success: true, userId: wpUser.id, affiliateCode }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Registration failed.";
    if (msg.includes("existing_user_email") || msg.includes("already registered")) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }
    console.error("[POST /api/affiliates/register]", err);
    return NextResponse.json({ error: "Failed to create account. Please try again." }, { status: 502 });
  }
}
