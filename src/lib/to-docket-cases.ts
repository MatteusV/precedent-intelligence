import type { DocketCase } from "@/lib/docket-case";
import { getCaseStages, toCaseStageInput } from "@/lib/case-stages";
import { getTribunalBySlug } from "@/lib/tribunals";

interface CaseRecord {
  readonly id: string;
  readonly status: "draft" | "confirmed";
  readonly tribunal: string;
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
  return cases.map((legalCase) => ({
    id: legalCase.id,
    title: legalCase.theme?.name ?? "Aguardando confirmação de tema",
    tribunalLabel:
      getTribunalBySlug(legalCase.tribunal)?.label ??
      legalCase.tribunal.toUpperCase(),
    updatedAt: legalCase.updatedAt,
    stages: getCaseStages(toCaseStageInput(legalCase)),
  }));
}
