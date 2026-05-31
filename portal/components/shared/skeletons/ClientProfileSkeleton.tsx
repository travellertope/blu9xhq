export function ClientProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-slate-100 animate-pulse shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
          <div className="flex gap-2 mt-1">
            <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      {/* Chart placeholder */}
      <div className="h-48 bg-slate-100 rounded-xl animate-pulse" />
      {/* Timeline placeholder */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}
