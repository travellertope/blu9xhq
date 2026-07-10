export default function InvoicesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-32 bg-muted rounded animate-pulse" />
      <div className="rounded-xl border bg-white overflow-hidden animate-pulse">
        <div className="h-11 bg-muted/60 border-b" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b last:border-0">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-20 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded-full ml-auto" />
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
