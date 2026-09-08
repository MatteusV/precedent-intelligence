import { SectionLabel } from "@/components/app/section-label";

/**
 * Labeled block on the case file: material, theme, dossiê, petição.
 */
export function WorkSection({
  id,
  label,
  title,
  actions,
  children,
}: {
  readonly id: string;
  readonly label: string;
  readonly title?: string;
  readonly actions?: React.ReactNode;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24 space-y-4" id={id}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <SectionLabel>{label}</SectionLabel>
          {title ? (
            <h2 className="font-folio text-2xl tracking-tight">{title}</h2>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
