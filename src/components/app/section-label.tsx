import { cn } from "@/lib/utils";

/**
 * Mono eyebrow used to label office sections and workflow stages.
 */
export function SectionLabel({
  children,
  className,
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] tracking-[0.18em] text-primary uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
