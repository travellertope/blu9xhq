import { cn } from "@/lib/utils";

type Status = "active" | "inactive" | "churned" | "onboarding" | string;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active:     { label: "Active",     className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20" },
  inactive:   { label: "Inactive",   className: "bg-slate-100 text-slate-600 ring-slate-500/20" },
  churned:    { label: "Churned",    className: "bg-red-50 text-red-700 ring-red-600/20" },
  onboarding: { label: "Onboarding", className: "bg-blue-50 text-blue-700 ring-blue-600/20" },
};

interface ClientStatusBadgeProps {
  status: Status;
  className?: string;
}

export function ClientStatusBadge({ status, className }: ClientStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
