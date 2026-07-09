"use client";

import { useBluuSession } from "@/hooks/useBluuSession";
import { hasPermission, canAccessClient, getDashboardScope, ROLES, type Role } from "@/lib/permissions";

export function usePermissions() {
  const { user } = useBluuSession();
  const role            = (user?.bluuhqRole ?? ROLES.VIEWER) as Role;
  const assignedClients = (user?.assignedClients ?? []) as number[];
  const status          = (user?.status ?? "active") as string;

  return {
    role,
    status,
    assignedClients,
    can:             (permission: string) => hasPermission(role, permission),
    canAccessClient: (clientId: number)   => canAccessClient(role, assignedClients, clientId),
    dashboardScope:  getDashboardScope(role),
    isSuper:         role === ROLES.SUPER_ADMIN,
    isAccountManager: role === ROLES.ACCOUNT_MANAGER,
  };
}
