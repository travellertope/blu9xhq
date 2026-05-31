import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { decrypt, encrypt } from "@/lib/encryption";
import {
  getClientPost, updateClientPost, listClientSubscriptions,
  listClientCommunications, type WPClientACF,
} from "@/lib/wp-api";
import { calculateHealthScore } from "@/lib/healthScore";
import { z } from "zod";
import type { BluuCommunication, CommMoodSentiment, CommMoodSource, CommChannel, CommDirection, CommType, CommEmailStatus } from "@/types";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "bluu_admin") return null;
  return session;
}

function isTruthy(v: boolean | string | number | undefined): boolean {
  return v === true || v === 1 || v === "1" || v === "true";
}

function safeJson(s?: string): string[] {
  if (!s) return [];
  try { return JSON.parse(s); } catch { return []; }
}

// ─── GET /api/admin/clients/[id] ──────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const postId = parseInt(params.id, 10);
  if (isNaN(postId)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const [post, subs, commsResult] = await Promise.all([
      getClientPost(postId),
      listClientSubscriptions(postId),
      listClientCommunications(postId, { per_page: 90 }),
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

    // Transform communications for health score calculation
    const communications: BluuCommunication[] = commsResult.items.map(p => ({
      id:           p.id,
      date:         p.date,
      clientId:     p.acf.comm_client,
      type:         (p.acf.comm_type || "manual") as CommType,
      direction:    (p.acf.comm_direction || "internal") as CommDirection,
      channel:      (p.acf.comm_channel || "other") as CommChannel,
      subject:      p.acf.comm_subject ?? "",
      content:      p.acf.comm_content ?? "",
      occurredAt:   p.acf.comm_occurred_at || p.date,
      loggedBy:     p.acf.comm_logged_by ?? 0,
      mood:         p.acf.comm_mood as CommMoodSentiment | undefined,
      moodSource:   p.acf.comm_mood_source as CommMoodSource | undefined,
      redFlags:     safeJson(p.acf.comm_red_flags),
      followUpNeeded:    isTruthy(p.acf.comm_follow_up_needed),
      followUpDue:       p.acf.comm_follow_up_due,
      followUpCompleted: isTruthy(p.acf.comm_follow_up_completed),
    }));

    // Auto health score calculation — background update, never blocks response
    const autoScore = calculateHealthScore(communications);
    const hasManualOverride = !!acf.health_note;

    if (!hasManualOverride && acf.health_status !== autoScore) {
      // Background write — do not await
      updateClientPost(postId, { acf: { health_status: autoScore, health_auto_score: autoScore } })
        .catch(err => console.error("[health auto-update]", err));
      decrypted.health_status = autoScore;
    } else if (hasManualOverride && acf.health_auto_score !== autoScore) {
      // Store auto score separately but keep manual override as current status
      updateClientPost(postId, { acf: { health_auto_score: autoScore } })
        .catch(err => console.error("[health auto-score store]", err));
    }

    return NextResponse.json({
      post:              { ...post, acf: decrypted },
      subscriptions:     activeSubscriptions,
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
    return value;
  }
}

// ─── PATCH /api/admin/clients/[id] ────────────────────────────────────────────

const patchSchema = z.object({
  firstName:    z.string().min(1).optional(),
  lastName:     z.string().min(1).optional(),
  email:        z.string().email().optional(),
  phone:        z.string().optional(),
  company:      z.string().optional(),
  status:       z.enum(["active", "inactive", "churned", "onboarding"]).optional(),
  healthStatus: z.enum(["healthy", "needs_attention", "at_risk"]).optional(),
  healthNote:   z.string().optional(),
  tags:         z.array(z.string()).optional(),
  notes:        z.string().optional(),
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
    acfUpdate.portal_email  = d.email;
  }
  if (d.phone !== undefined) acfUpdate.contact_phone = d.phone ? encrypt(d.phone) : "";
  if (d.company)             acfUpdate.company_name  = d.company;
  if (d.status)              acfUpdate.status        = d.status;
  if (d.healthStatus) {
    acfUpdate.health_status       = d.healthStatus;
    acfUpdate.health_overridden_at = new Date().toISOString();
  }
  if (d.healthNote !== undefined) acfUpdate.health_note = d.healthNote;
  if (d.tags)                acfUpdate.tags  = d.tags.join(",");
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
