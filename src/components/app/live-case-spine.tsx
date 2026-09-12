"use client";

import { useCaseGeneration } from "@/components/app/case-generation-provider";
import { CaseSpine } from "@/components/app/case-spine";
import { overlayLiveStages, type CaseStageProgress } from "@/lib/case-stages";

/**
 * Case spine that reflects the generation step currently in flight.
 */
export function LiveCaseSpine({
  stages,
  caseId,
  variant,
}: {
  readonly stages: readonly CaseStageProgress[];
  readonly caseId?: string;
  readonly variant?: "full" | "ticks";
}) {
  const live = useCaseGeneration();

  return (
    <CaseSpine
      caseId={caseId}
      stages={overlayLiveStages(stages, live)}
      variant={variant}
    />
  );
}
