export default function TicketDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-7 w-80 bg-muted rounded" />
        <div className="flex gap-2 mt-1">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
      </div>

      {/* Thread */}
      <div className="rounded-xl border bg-white divide-y">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-muted rounded-full" />
              <div className="h-4 w-28 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded ml-auto" />
            </div>
            <div className="space-y-1 ml-9">
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Reply box */}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="h-24 bg-muted rounded-lg" />
        <div className="h-9 w-28 bg-muted rounded-lg ml-auto" />
      </div>
    </div>
  );
}
