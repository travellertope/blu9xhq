import { cn } from "@/lib/utils";

type HealthStatus = "healthy" | "needs_attention" | "at_risk" | string;

const HEALTH_CONFIG: Record<string, { dot: string; label: string }> = {
  healthy:          { dot: "bg-emerald-500", label: "Healthy" },
  needs_attention:  { dot: "bg-amber-400",   label: "Needs Attention" },
  at_risk:          { dot: "bg-red-500",      label: "At Risk" },
};

interface HealthIndicatorProps {
  status?: HealthStatus;
  showLabel?: boolean;
  className?: string;
}

export function HealthIndicator({ status, showLabel = false, className }: HealthIndicatorProps) {
  const config = HEALTH_CONFIG[status ?? ""] ?? { dot: "bg-slate-300", label: "Unknown" };
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", config.dot)} />
      {showLabel && <span className="text-xs text-slate-600">{config.label}</span>}
    </span>
  );
}
