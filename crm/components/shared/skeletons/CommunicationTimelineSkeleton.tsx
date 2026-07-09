export function CommunicationTimelineSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3 p-4 border rounded-lg">
          <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
