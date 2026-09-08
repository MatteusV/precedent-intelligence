/**
 * Placeholder for the app header while auth resolves.
 */
export function AppChromeFallback() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="h-8 w-16 animate-pulse rounded-md bg-muted/70" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-24 animate-pulse rounded-md bg-muted/70" />
          <div className="size-8 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </header>
  );
}
