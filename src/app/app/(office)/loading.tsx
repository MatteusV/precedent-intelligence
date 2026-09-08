export default function OfficeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-2 overflow-hidden rounded-xl border border-border">
        <div className="h-9 border-b border-border bg-muted/30" />
        <div className="space-y-0">
          <div className="h-16 border-b border-border bg-muted/20" />
          <div className="h-16 border-b border-border bg-muted/10" />
          <div className="h-16 bg-muted/20" />
        </div>
      </div>
    </div>
  );
}
