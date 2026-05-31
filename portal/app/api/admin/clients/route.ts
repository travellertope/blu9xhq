import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
import { createClientPost, createWPUser, listClientPosts } from "@/lib/wp-api";
import { sendPortalInvite } from "@/lib/resend";
import { z } from "zod";
import crypto from "crypto";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "bluu_admin") {
    return null;
  }
  return session;
}

// ─── GET /api/admin/clients ───────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const search = searchParams.get("search") ?? undefined;
  const orderby = searchParams.get("orderby") ?? "date";
  const order = (searchParams.get("order") ?? "desc") as "asc" | "desc";

  try {
    const result = await listClientPosts({ page, per_page: 20, search, orderby, order });
    return NextResponse.json({
      clients: result.items,
      total: result.total,
      totalPages: result.totalPages,
      page,
    });
  } catch (err) {
    console.error("[GET /api/admin/clients]", err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 502 });
  }
}

// ─── POST /api/admin/clients ──────────────────────────────────────────────────

const createClientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().min(1),
  status: z.enum(["active", "inactive", "churned", "onboarding"]).default("onboarding"),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  sendInvite: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const fullName = `${d.firstName} ${d.lastName}`;
  const tempPassword = crypto.randomBytes(16).toString("base64url");

  try {
    // 1. Create WP user with role bluu_client
    const wpUser = await createWPUser({
      username: d.email,
      email: d.email,
      password: tempPassword,
      name: fullName,
      roles: ["bluu_client"],
    });

    // 2. Create bluu_client CPT post (encrypt PII at rest)
    const post = await createClientPost({
      title: fullName,
      acf: {
        contact_name: fullName,
        contact_email: encrypt(d.email),
        contact_phone: d.phone ? encrypt(d.phone) : "",
        company_name: d.company,
        portal_email: d.email,
        wp_user_id: wpUser.id,
        status: d.status,
        tags: (d.tags ?? []).join(","),
        notes: d.notes ?? "",
        active_subscription_count: 0,
      },
    });

    // 3. Link WP user → client post via user meta
    // Requires `bluu_client_post_id` registered as a REST meta key in the WP plugin.
    await fetch(
      `${process.env.WORDPRESS_URL}/wp-json/wp/v2/users/${wpUser.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${process.env.WP_APP_USERNAME}:${process.env.WP_APP_PASSWORD}`).toString("base64")}`,
        },
        body: JSON.stringify({ meta: { bluu_client_post_id: String(post.id) } }),
      }
    ).catch(() => null); // non-fatal — meta registration may not be set up yet

    // 4. Send portal invite if requested
    if (d.sendInvite) {
      const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal-login`;
      await sendPortalInvite(d.email, {
        clientName: d.firstName,
        loginUrl: inviteLink,
      }).catch(console.error);
    }

    return NextResponse.json({ client: post, wpUserId: wpUser.id }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/clients]", err);
    return NextResponse.json({ error: err.message ?? "Failed to create client" }, { status: 502 });
  }
}
