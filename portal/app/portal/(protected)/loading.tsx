export default function PortalLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-56 bg-muted rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-48 bg-muted rounded-xl animate-pulse" />
    </div>
  );
}
