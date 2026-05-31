import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { decrypt, encrypt } from "@/lib/encryption";
import { getClientPost, updateClientPost, listClientSubscriptions, type WPClientACF } from "@/lib/wp-api";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "bluu_admin") return null;
  return session;
}

// ─── GET /api/admin/clients/[id] ──────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const [post, subs] = await Promise.all([
      getClientPost(postId),
      listClientSubscriptions(postId),
    ]);

    // Decrypt PII for admin consumption
    const acf = post.acf;
    const decrypted = {
      ...acf,
      contact_email: acf.contact_email ? tryDecrypt(acf.contact_email) : "",
      contact_phone: acf.contact_phone ? tryDecrypt(acf.contact_phone) : "",
    };

    const activeSubscriptions = subs.items.filter(
      (s) => s.acf.client_id === postId && s.acf.status === "active"
    );

    return NextResponse.json({
      post: { ...post, acf: decrypted },
      subscriptions: activeSubscriptions,
      subscriptionCount: activeSubscriptions.length,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/clients/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

function tryDecrypt(value: string): string {
  try {
    return decrypt(value);
  } catch {
    return value; // Return as-is if not encrypted yet
  }
}

// ─── PATCH /api/admin/clients/[id] ────────────────────────────────────────────

const patchSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["active", "inactive", "churned", "onboarding"]).optional(),
  healthStatus: z.enum(["healthy", "needs_attention", "at_risk"]).optional(),
  healthNote: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });

  const d = parsed.data;
  const acfUpdate: Partial<WPClientACF> = {};

  if (d.email) {
    acfUpdate.contact_email = encrypt(d.email);
    acfUpdate.portal_email = d.email;
  }
  if (d.phone !== undefined) acfUpdate.contact_phone = d.phone ? encrypt(d.phone) : "";
  if (d.company) acfUpdate.company_name = d.company;
  if (d.status) acfUpdate.status = d.status;
  if (d.healthStatus) {
    acfUpdate.health_status = d.healthStatus;
    acfUpdate.health_overridden_at = new Date().toISOString();
  }
  if (d.healthNote !== undefined) acfUpdate.health_note = d.healthNote;
  if (d.tags) acfUpdate.tags = d.tags.join(",");
  if (d.notes !== undefined) acfUpdate.notes = d.notes;

  const titleParts: string[] = [];
  if (d.firstName || d.lastName) {
    const current = d.firstName && d.lastName
      ? `${d.firstName} ${d.lastName}`
      : d.firstName ?? d.lastName ?? undefined;
    if (current) {
      titleParts.push(current);
      acfUpdate.contact_name = current;
    }
  }

  try {
    const updated = await updateClientPost(postId, {
      ...(titleParts.length ? { title: titleParts[0] } : {}),
      acf: acfUpdate,
    });
    return NextResponse.json({ post: updated });
  } catch (err: any) {
    console.error("[PATCH /api/admin/clients/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── DELETE /api/admin/clients/[id] ───────────────────────────────────────────
// Soft delete — sets ACF status field to "churned". WP user is preserved.

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await updateClientPost(postId, { acf: { status: "churned" } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE /api/admin/clients/[id]]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
