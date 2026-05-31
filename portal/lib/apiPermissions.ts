import { getServerSession, type Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasPermission, canAccessClient, type Role } from "@/lib/permissions";

export type AuthedSession = Session;

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
 *
 * Pass `clientId` on routes that operate on a specific client so account_managers
 * cannot reach unassigned clients via direct API calls.
 */
export async function requirePermission(
  req: NextRequest,
  permission: string,
  clientId?: number
): Promise<PermissionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized", code: "NO_SESSION" },
      { status: 401 }
    );
  }

  const user = session.user as any;

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
    const assignedClients = (user.assignedClients ?? []) as number[];
    if (!canAccessClient(role, assignedClients, clientId)) {
      return NextResponse.json(
        { error: "Client not assigned to you", code: "CLIENT_NOT_ASSIGNED" },
        { status: 403 }
      );
    }
  }

  return { ok: true, session: session as AuthedSession };
}

/**
 * Lightweight session-only check (no permission key).
 * Use for routes that only need an authenticated bluu_admin session.
 */
export async function requireSession(req: NextRequest): Promise<PermissionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "bluu_admin") {
    return NextResponse.json({ error: "Unauthorized", code: "NO_SESSION" }, { status: 401 });
  }
  return { ok: true, session: session as AuthedSession };
}
