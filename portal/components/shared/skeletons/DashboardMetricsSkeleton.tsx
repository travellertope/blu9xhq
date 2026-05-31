export function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
          </div>
          <div className="h-7 w-16 bg-slate-100 rounded animate-pulse" />
          <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
