import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "@/components/app/section-label";
import { Button } from "@/components/ui/button";
import type { CaseNextAction } from "@/lib/case-stages";

/**
 * Persistent next-step cue on a case file.
 */
export function NextActionBanner({
  action,
  detail,
}: {
  readonly action: CaseNextAction;
  readonly detail?: string;
}) {
  const isReady = action.stageId === null;

  return (
    <div
      aria-busy={action.isBusy}
      className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary/8 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-1">
        <SectionLabel>
          {isReady ? "Arquivo" : action.isBusy ? "Gerando" : "Próximo passo"}
        </SectionLabel>
        <p className="text-sm text-foreground">{detail ?? action.label}</p>
      </div>
      {isReady || action.isBusy ? null : (
        <Button asChild>
          <Link href={action.href}>
            Continuar
            <ArrowRight />
          </Link>
        </Button>
      )}
      {action.isBusy ? (
        <p className="font-mono text-xs tracking-wider text-primary uppercase">
          Em andamento
        </p>
      ) : null}
    </div>
  );
}
