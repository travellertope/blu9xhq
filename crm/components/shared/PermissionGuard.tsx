"use client";

import { useEffect, type ReactNode, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { usePermissions } from "@/hooks/usePermissions";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

// ─── Inline guard — renders children only if permission is satisfied ───────────

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { can } = usePermissions();
  if (!can(permission)) return <>{fallback}</>;
  return <>{children}</>;
}

// ─── Page-level HOC — redirects to /admin?error=unauthorized ────────────────

export function withPermission(permission: string) {
  return function <T extends object>(Component: ComponentType<T>) {
    function ProtectedPage(props: T) {
      const { can } = usePermissions();
      const router = useRouter();
      const { status } = useSession();

      useEffect(() => {
        if (status === "authenticated" && !can(permission)) {
          router.replace("/admin?error=unauthorized");
        }
      }, [status, can, router]);

      if (status === "loading") return <LoadingSpinner />;
      if (status === "unauthenticated") return null;
      if (!can(permission)) return null;
      return <Component {...props} />;
    }
    ProtectedPage.displayName = `withPermission(${permission})`;
    return ProtectedPage;
  };
}
