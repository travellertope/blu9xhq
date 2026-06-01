export default function TicketsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-7 w-28 bg-muted rounded animate-pulse" />
        <div className="h-9 w-32 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="rounded-xl border bg-white divide-y animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-64 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
            <div className="h-5 w-16 bg-muted rounded-full" />
            <div className="h-5 w-14 bg-muted rounded-full" />
            <div className="h-4 w-4 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
