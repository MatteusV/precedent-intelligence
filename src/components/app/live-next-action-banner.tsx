"use client";

import { useCaseGeneration } from "@/components/app/case-generation-provider";
import { NextActionBanner } from "@/components/app/next-action-banner";
import {
  getCaseNextAction,
  overlayLiveStages,
  type CaseNextAction,
  type CaseStageProgress,
} from "@/lib/case-stages";

/**
 * Next-action banner that follows the live generation step.
 */
export function LiveNextActionBanner({
  action,
  caseId,
  stages,
}: {
  readonly action: CaseNextAction;
  readonly caseId: string;
  readonly stages: readonly CaseStageProgress[];
}) {
  const live = useCaseGeneration();
  const liveAction = live
    ? getCaseNextAction(caseId, overlayLiveStages(stages, live))
    : action;

  return <NextActionBanner action={liveAction} />;
}
