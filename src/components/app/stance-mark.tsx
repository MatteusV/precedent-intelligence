import { cn } from "@/lib/utils";

const STANCE_COPY = {
  supporting: { label: "Cola", className: "text-primary" },
  opposing: { label: "Morre", className: "text-opposing" },
  dissent: { label: "Divergência", className: "text-stamp" },
} as const;

/**
 * Marks a dossiê excerpt with product language: cola, morre, divergência.
 */
export function StanceMark({
  stance,
}: {
  readonly stance: keyof typeof STANCE_COPY;
}) {
  const copy = STANCE_COPY[stance];

  return (
    <span
      className={cn(
        "font-mono text-[11px] tracking-[0.16em] uppercase",
        copy.className,
      )}
    >
      {copy.label}
    </span>
  );
}
