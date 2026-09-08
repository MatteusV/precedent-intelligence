import { cn } from "@/lib/utils";

/**
 * Reading surface for dossiê and petição — the work product, not the chrome.
 */
export function Folio({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "folio-sheet rounded-sm bg-folio px-6 py-8 text-folio-ink shadow-2xl ring-1 ring-folio-ink/10 sm:px-10 sm:py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
