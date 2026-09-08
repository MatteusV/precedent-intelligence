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

export interface CaseStageCopy {
  readonly label: string;
  readonly description: string;
  readonly action: string;
}

export interface CaseNextAction {
  readonly stageId: CaseStageId | null;
  readonly label: string;
  readonly href: string;
}

export const CASE_STAGE_COPY: Record<CaseStageId, CaseStageCopy> = {
  material: {
    label: "Material",
    description: "Fatos e contexto do cliente",
    action: "Cole o material",
  },
  theme: {
    label: "Tema e pedido",
    description: "Recorte que o dossiê vai julgar",
    action: "Confirmar tema",
  },
  dossier: {
    label: "Dossiê",
    description: "Padrão citado daquele juízo",
    action: "Gerar dossiê",
  },
  petition: {
    label: "Petição",
    description: "Peça ancorada no dossiê",
    action: "Gerar petição",
  },
};

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
 * Returns the stage the lawyer should work on next, or null when the file is complete.
 */
export function getCurrentStageId(input: CaseStageInput): CaseStageId | null {
  if (input.status !== "confirmed") {
    return "theme";
  }

  if (!input.hasDossier || input.isGeneratingDossier) {
    return "dossier";
  }

  if (!input.hasCurrentPetition) {
    return "petition";
  }

  return null;
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
    if (currentId && id === currentId) {
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

/**
 * Returns the lawyer-facing next step for a case spine.
 */
export function getCaseNextAction(
  caseId: string,
  stages: readonly CaseStageProgress[],
): CaseNextAction {
  const current = stages.find((stage) => stage.state === "current");

  if (!current) {
    return {
      stageId: null,
      label: "Peça pronta",
      href: `/app/casos/${caseId}#peticao`,
    };
  }

  return {
    stageId: current.id,
    label: CASE_STAGE_COPY[current.id].action,
    href: getCaseStageHref(caseId, current.id, current.state) ?? `/app/casos/${caseId}`,
  };
}

/**
 * Returns an in-file or confirmation href for a reachable stage.
 */
export function getCaseStageHref(
  caseId: string,
  stageId: CaseStageId,
  state: CaseStageState,
): string | undefined {
  if (state === "upcoming") {
    return undefined;
  }

  if (stageId === "theme" && state === "current") {
    return `/app/casos/${caseId}/confirmar`;
  }

  const fragment: Record<CaseStageId, string> = {
    material: "material",
    theme: "pedido",
    dossier: "dossie",
    petition: "peticao",
  };

  return `/app/casos/${caseId}#${fragment[stageId]}`;
}
