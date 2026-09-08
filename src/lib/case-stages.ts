export const CASE_STAGE_IDS = [
  "material",
  "theme",
  "dossier",
  "petition",
] as const;

export type CaseStageId = (typeof CASE_STAGE_IDS)[number];

export type CaseStageState = "complete" | "current" | "upcoming";

export interface CaseStageInput {
  readonly status: "draft" | "confirmed";
  readonly hasDossier: boolean;
  readonly hasCurrentPetition: boolean;
  readonly isGeneratingDossier: boolean;
}

export interface CaseStageProgress {
  readonly id: CaseStageId;
  readonly state: CaseStageState;
}

/**
 * Returns whether a dossier generation job is still running.
 */
export function isDossierJobInFlight(
  dossierJobStatus: string | null | undefined,
): boolean {
  return Boolean(
    dossierJobStatus &&
      dossierJobStatus !== "completed" &&
      dossierJobStatus !== "failed",
  );
}

/**
 * Maps persisted case fields onto the stage machine input.
 */
export function toCaseStageInput(legalCase: {
  readonly status: "draft" | "confirmed";
  readonly currentDossierId: string | null;
  readonly currentPetition: { readonly status: "current" | "stale" } | null;
  readonly dossierJobStatus: string | null;
}): CaseStageInput {
  return {
    status: legalCase.status,
    hasDossier: Boolean(legalCase.currentDossierId),
    hasCurrentPetition: legalCase.currentPetition?.status === "current",
    isGeneratingDossier: isDossierJobInFlight(legalCase.dossierJobStatus),
  };
}

/**
 * Returns stages already finished for an existing case.
 */
export function getCompletedStageIds(
  input: CaseStageInput,
): readonly CaseStageId[] {
  const completed: CaseStageId[] = ["material"];

  if (input.status === "confirmed") {
    completed.push("theme");
  }

  if (input.hasDossier) {
    completed.push("dossier");
  }

  if (input.hasCurrentPetition) {
    completed.push("petition");
  }

  return completed;
}

/**
 * Returns the stage the lawyer should work on next.
 */
export function getCurrentStageId(input: CaseStageInput): CaseStageId {
  if (input.status !== "confirmed") {
    return "theme";
  }

  if (!input.hasDossier || input.isGeneratingDossier) {
    return "dossier";
  }

  return "petition";
}

/**
 * Builds Material → Tema → Dossiê → Petição progress for a case.
 */
export function getCaseStages(
  input: CaseStageInput,
): readonly CaseStageProgress[] {
  const currentId = getCurrentStageId(input);
  const completed = new Set(getCompletedStageIds(input));

  return CASE_STAGE_IDS.map((id) => {
    if (id === currentId) {
      return { id, state: "current" };
    }

    if (completed.has(id)) {
      return { id, state: "complete" };
    }

    return { id, state: "upcoming" };
  });
}

/**
 * Progress for the new-case form, before a case exists.
 */
export function getNewCaseStages(): readonly CaseStageProgress[] {
  return [
    { id: "material", state: "current" },
    { id: "theme", state: "upcoming" },
    { id: "dossier", state: "upcoming" },
    { id: "petition", state: "upcoming" },
  ];
}
