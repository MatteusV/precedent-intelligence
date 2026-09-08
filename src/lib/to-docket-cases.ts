import type { DocketCase } from "@/lib/docket-case";
import {
  getCaseNextAction,
  getCaseStages,
  toCaseStageInput,
} from "@/lib/case-stages";
import { getTribunalBySlug } from "@/lib/tribunals";

interface CaseRecord {
  readonly id: string;
  readonly status: "draft" | "confirmed";
  readonly tribunal: string;
  readonly judgeName: string | null;
  readonly updatedAt: Date;
  readonly currentDossierId: string | null;
  readonly dossierJobStatus: string | null;
  readonly theme: { readonly name: string } | null;
  readonly currentPetition: { readonly status: "current" | "stale" } | null;
}

/**
 * Maps persisted cases onto the docket view model.
 */
export function toDocketCases(
  cases: readonly CaseRecord[],
): readonly DocketCase[] {
  return cases.map((legalCase) => {
    const stages = getCaseStages(toCaseStageInput(legalCase));

    return {
      id: legalCase.id,
      title: legalCase.theme?.name ?? "Aguardando confirmação de tema",
      tribunalLabel:
        getTribunalBySlug(legalCase.tribunal)?.label ??
        legalCase.tribunal.toUpperCase(),
      judgeName: legalCase.judgeName,
      updatedAt: legalCase.updatedAt,
      stages,
      nextAction: getCaseNextAction(legalCase.id, stages),
    };
  });
}
