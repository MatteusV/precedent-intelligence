/**
 * Placeholder for the office canvas while auth and case list resolve.
 */
export function OfficeShellFallback() {
  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-border/80 lg:flex lg:flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-3 w-10 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-2 px-4">
          <div className="h-16 animate-pulse rounded-md bg-muted/70" />
          <div className="h-16 animate-pulse rounded-md bg-muted/70" />
          <div className="h-16 animate-pulse rounded-md bg-muted/70" />
        </div>
      </aside>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="h-3 w-16 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 overflow-hidden rounded-xl border border-border">
          <div className="h-9 border-b border-border bg-muted/30" />
          <div className="h-16 border-b border-border bg-muted/20" />
          <div className="h-16 border-b border-border bg-muted/10" />
          <div className="h-16 bg-muted/20" />
        </div>
      </div>
    </div>
  );
}
