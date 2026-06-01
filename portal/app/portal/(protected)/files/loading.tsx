export default function FilesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-24 bg-muted rounded animate-pulse" />
      {[1, 2].map((section) => (
        <div key={section} className="space-y-3 animate-pulse">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="rounded-xl border bg-white divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 bg-muted rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
