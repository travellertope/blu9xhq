export default function SubscriptionsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 bg-muted rounded animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border bg-white p-6 space-y-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-4 w-28 bg-muted rounded" />
            </div>
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
          <div className="h-px bg-muted" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-1">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
