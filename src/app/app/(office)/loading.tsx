export default function OfficeLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-4 space-y-3">
        <div className="h-14 animate-pulse rounded-md bg-muted/70" />
        <div className="h-14 animate-pulse rounded-md bg-muted/70" />
        <div className="h-14 animate-pulse rounded-md bg-muted/70" />
      </div>
    </div>
  );
}
