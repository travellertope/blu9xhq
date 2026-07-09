export default function ProfileLoading() {
  return (
    <div className="max-w-lg space-y-6 animate-pulse">
      <div className="h-7 w-28 bg-muted rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border bg-white p-6 space-y-4">
          <div className="h-5 w-36 bg-muted rounded" />
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded-lg" />
            <div className="h-10 bg-muted rounded-lg" />
          </div>
          <div className="h-9 w-28 bg-muted rounded-lg" />
        </div>
      ))}
    </div>
  );
}
