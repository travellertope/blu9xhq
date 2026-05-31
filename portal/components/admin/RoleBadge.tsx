import { cn } from "@/lib/utils";
import { ROLE_LABELS, type Role } from "@/lib/permissions";

const ROLE_STYLES: Record<Role, string> = {
  super_admin:     "bg-purple-50 text-purple-700 ring-purple-600/20",
  account_manager: "bg-blue-50 text-blue-700 ring-blue-600/20",
  billing_manager: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  support_staff:   "bg-amber-50 text-amber-700 ring-amber-600/20",
  viewer:          "bg-slate-100 text-slate-600 ring-slate-500/20",
};

interface RoleBadgeProps {
  role: Role | string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const label = ROLE_LABELS[role as Role] ?? role;
  const style = ROLE_STYLES[role as Role] ?? "bg-slate-100 text-slate-600 ring-slate-500/20";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
