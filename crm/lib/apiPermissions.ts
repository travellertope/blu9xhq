import { getSessionFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { hasPermission, canAccessClient, type Role } from "@/lib/permissions";
import type { BluuSession } from "@/lib/auth";

export type AuthedSession = BluuSession;

export type PermissionResult =
  | { ok: true; session: AuthedSession }
  | NextResponse;

/**
 * Server-side permission check for API route handlers.
 *
 * Usage:
 *   const result = await requirePermission(req, 'create_invoices')
 *   if (result instanceof NextResponse) return result
 *   const { session } = result
 */
export async function requirePermission(
  _req: NextRequest,
  permission: string,
  clientId?: string
): Promise<PermissionResult> {
  const session = getSessionFromRequest(_req);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "NO_SESSION" },
      { status: 401 }
    );
  }

  const user = session.user;

  if (user.status === "deactivated") {
    return NextResponse.json(
      { error: "Account deactivated", code: "DEACTIVATED" },
      { status: 403 }
    );
  }

  const role = (user.bluuhqRole ?? "viewer") as Role;

  if (!hasPermission(role, permission)) {
    return NextResponse.json(
      { error: "Forbidden", code: "NO_PERMISSION", permission },
      { status: 403 }
    );
  }

  if (clientId !== undefined) {
    const assignedClients = (user.assignedClients ?? []) as string[];
    if (!canAccessClient(role, assignedClients, clientId)) {
      return NextResponse.json(
        { error: "Client not assigned to you", code: "CLIENT_NOT_ASSIGNED" },
        { status: 403 }
      );
    }
  }

  return { ok: true, session };
}

/**
 * Lightweight session-only check — no permission key.
 * Use for routes that only need an authenticated bluu_admin session.
 */
export async function requireSession(_req: NextRequest): Promise<PermissionResult> {
  const session = getSessionFromRequest(_req);
  if (!session?.user || session.user.role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized", code: "NO_SESSION" }, { status: 401 });
  }
  return { ok: true, session };
}

/**
 * Client session check — verifies role === 'bluu_client'.
 * Use for all portal API routes.
 */
export async function requireClientSession(_req: NextRequest): Promise<PermissionResult> {
  const session = getSessionFromRequest(_req);
  if (!session?.user || session.user.role !== "bluu_client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { ok: true, session };
}
