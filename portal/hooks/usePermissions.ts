"use client";

import { useSession } from "next-auth/react";
import { hasPermission, canAccessClient, getDashboardScope, ROLES, type Role } from "@/lib/permissions";

export function usePermissions() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = (user?.bluuhqRole ?? ROLES.VIEWER) as Role;
  const assignedClients = (user?.assignedClients ?? []) as number[];
  const status = (user?.status ?? "active") as string;

  return {
    role,
    status,
    assignedClients,
    /** True if the user has the given permission key. */
    can: (permission: string) => hasPermission(role, permission),
    /** True if the user can access a specific client. */
    canAccessClient: (clientId: number) => canAccessClient(role, assignedClients, clientId),
    /** 'full' for super_admin + billing_manager; 'scoped' for everyone else. */
    dashboardScope: getDashboardScope(role),
    isSuper: role === ROLES.SUPER_ADMIN,
    isAccountManager: role === ROLES.ACCOUNT_MANAGER,
  };
}
