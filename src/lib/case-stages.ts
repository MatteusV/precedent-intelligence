import {
  getJobStatusLabel,
  isGenerationJobInFlight,
} from "@/lib/generation-jobs";

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
  readonly isGeneratingPetition: boolean;
  readonly dossierJobStatus?: string | null;
  readonly petitionJobStatus?: string | null;
}

export interface CaseStageProgress {
  readonly id: CaseStageId;
  readonly state: CaseStageState;
  readonly note?: string;
  readonly isBusy?: boolean;
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
  readonly isBusy?: boolean;
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
  return isGenerationJobInFlight(dossierJobStatus);
}

/**
 * Maps persisted case fields onto the stage machine input.
 */
export function toCaseStageInput(legalCase: {
  readonly status: "draft" | "confirmed";
  readonly currentDossierId: string | null;
  readonly currentPetition: { readonly status: "current" | "stale" } | null;
  readonly dossierJobStatus: string | null;
  readonly petitionJobStatus?: string | null;
}): CaseStageInput {
  return {
    status: legalCase.status,
    hasDossier: Boolean(legalCase.currentDossierId),
    hasCurrentPetition: legalCase.currentPetition?.status === "current",
    isGeneratingDossier: isGenerationJobInFlight(legalCase.dossierJobStatus),
    isGeneratingPetition: isGenerationJobInFlight(legalCase.petitionJobStatus),
    dossierJobStatus: legalCase.dossierJobStatus,
    petitionJobStatus: legalCase.petitionJobStatus ?? null,
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

  if (!input.hasCurrentPetition || input.isGeneratingPetition) {
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
      const isBusy =
        (id === "dossier" && input.isGeneratingDossier) ||
        (id === "petition" && input.isGeneratingPetition);
      const note = isBusy
        ? getJobStatusLabel(
            id === "dossier" ? "dossier" : "petition",
            id === "dossier"
              ? (input.dossierJobStatus ?? "pending")
              : (input.petitionJobStatus ?? "pending"),
          )
        : undefined;

      return {
        id,
        state: "current",
        ...(isBusy ? { note, isBusy: true } : {}),
      };
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
    label: current.isBusy
      ? (current.note ?? CASE_STAGE_COPY[current.id].action)
      : CASE_STAGE_COPY[current.id].action,
    href:
      getCaseStageHref(caseId, current.id, current.state) ??
      `/app/casos/${caseId}`,
    ...(current.isBusy ? { isBusy: true } : {}),
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

/**
 * Overlays optimistic/polled generation status onto server-rendered stages.
 */
export function overlayLiveStages(
  stages: readonly CaseStageProgress[],
  live: {
    readonly isDossierBusy: boolean;
    readonly isPetitionBusy: boolean;
    readonly dossierJobStatus: string | null;
    readonly petitionJobStatus: string | null;
  } | null,
): readonly CaseStageProgress[] {
  if (!live || (!live.isDossierBusy && !live.isPetitionBusy)) {
    return stages;
  }

  return stages.map((stage) => {
    if (stage.id === "dossier" && live.isDossierBusy) {
      return {
        id: "dossier",
        state: "current",
        isBusy: true,
        note: getJobStatusLabel("dossier", live.dossierJobStatus ?? "pending"),
      };
    }

    if (stage.id === "petition" && live.isPetitionBusy) {
      return {
        id: "petition",
        state: "current",
        isBusy: true,
        note: getJobStatusLabel("petition", live.petitionJobStatus ?? "pending"),
      };
    }

    if (live.isDossierBusy && stage.id === "petition" && stage.state === "current") {
      return { id: "petition", state: "upcoming" };
    }

    return stage;
  });
}
