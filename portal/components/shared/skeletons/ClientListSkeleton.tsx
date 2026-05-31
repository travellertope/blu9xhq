export function ClientListSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-9 w-full bg-slate-100 rounded animate-pulse mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border rounded-lg">
          <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
          <div className="h-5 w-12 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
