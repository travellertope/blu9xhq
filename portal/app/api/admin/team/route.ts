import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/apiPermissions";
import { wpRestFetch } from "@/lib/wp-api";
import { logAuditEvent, AUDIT_ACTIONS } from "@/lib/auditLog";
import { sendEmailHtml } from "@/lib/resend";
import { z } from "zod";
import crypto from "crypto";

// ─── GET /api/admin/team ───────────────────────────────────────────────────────
// Uses the custom WP endpoint that returns bluu_team + bluu_admin users with meta.

export async function GET(req: NextRequest) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;

  try {
    const members = await wpRestFetch<any[]>(
      "/bluuhq/v1/team",
      { cache: "no-store" } as any
    );
    return NextResponse.json({ members });
  } catch (err: any) {
    console.error("[GET /api/admin/team]", err);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}

// ─── POST /api/admin/team (invite) ────────────────────────────────────────────

const inviteSchema = z.object({
  firstName:       z.string().min(1),
  lastName:        z.string().min(1),
  email:           z.string().email(),
  role:            z.enum(["super_admin", "account_manager", "billing_manager", "support_staff", "viewer"]),
  assignedClients: z.array(z.number()).optional().default([]),
});

export async function POST(req: NextRequest) {
  const result = await requirePermission(req, "manage_team");
  if (result instanceof NextResponse) return result;
  const { session } = result;
  const actor = session.user as any;

  const parsed = inviteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const d = parsed.data;
  const fullName = `${d.firstName} ${d.lastName}`;
  const tempPassword = crypto.randomBytes(16).toString("base64url");

  try {
    // Create WP user with bluu_team role
    const wpUser = await wpRestFetch<any>("/wp/v2/users", {
      method: "POST",
      body: JSON.stringify({
        username:     d.email,
        email:        d.email,
        password:     tempPassword,
        name:         fullName,
        roles:        ["bluu_team"],
        meta: {
          bluuhq_role:             d.role,
          bluuhq_status:           "active",
          bluuhq_assigned_clients: d.assignedClients,
          bluuhq_last_active:      new Date().toISOString(),
        },
      }),
    });

    // Send invite email via Resend
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
    await sendEmailHtml({
      to: d.email,
      subject: "You've been invited to the BluuHQ team workspace",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
          <h2>Welcome to BluuHQ, ${d.firstName}!</h2>
          <p>You've been added to the BluuHQ CRM as <strong>${d.role.replace("_", " ")}</strong>.</p>
          <p>Use the credentials below to sign in for the first time, then update your password in your profile.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="font-family:monospace">${d.email}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">Temporary Password</td><td style="font-family:monospace">${tempPassword}</td></tr>
          </table>
          <a href="${loginUrl}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
            Sign in to BluuHQ
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">Please change your password after signing in.</p>
        </div>
      `,
      tags: [{ name: "type", value: "team_invite" }],
    });

    await logAuditEvent({
      action:       AUDIT_ACTIONS.TEAM_MEMBER_INVITED,
      actorName:    actor.name ?? actor.email,
      actorWpUserId: actor.wpUserId,
      detail:       `Invited ${fullName} (${d.email}) as ${d.role}`,
    });

    return NextResponse.json({ member: wpUser }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/admin/team]", err);
    return NextResponse.json({ error: err.message ?? "Failed to invite team member" }, { status: 502 });
  }
}
