export type GenerationJobKind = "dossier" | "petition";

export type GenerationStepState =
  | "complete"
  | "current"
  | "upcoming"
  | "failed";

export interface GenerationStepDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface GenerationStepView extends GenerationStepDefinition {
  readonly state: GenerationStepState;
}

export const DOSSIER_JOB_STEPS: readonly GenerationStepDefinition[] = [
  {
    id: "pending",
    label: "Na fila",
    description: "O pedido foi aceito e a geração vai começar.",
  },
  {
    id: "retrieving",
    label: "Recuperando precedentes",
    description: "Buscando julgados persistidos deste tema, tribunal e órgão.",
  },
  {
    id: "ingesting",
    label: "Conferindo cobertura",
    description:
      "Se o acervo local for fino, buscamos julgados novos antes de analisar.",
  },
  {
    id: "analyzing",
    label: "Analisando o padrão",
    description:
      "O agente lê os julgados e monta o padrão daquele juízo. Pode levar um minuto.",
  },
];

export const PETITION_JOB_STEPS: readonly GenerationStepDefinition[] = [
  {
    id: "pending",
    label: "Na fila",
    description: "O pedido foi aceito e a redação vai começar.",
  },
  {
    id: "drafting",
    label: "Redigindo a peça",
    description:
      "O agente redige a petição só com o que está no dossiê. Pode levar um minuto.",
  },
  {
    id: "anchoring",
    label: "Ancorando citações",
    description:
      "Conferindo âncoras. Sem precedente no dossiê, o trecho vira hipótese.",
  },
];

/**
 * Returns whether a persisted generation job is still running.
 */
export function isGenerationJobInFlight(
  jobStatus: string | null | undefined,
): boolean {
  return Boolean(
    jobStatus && jobStatus !== "completed" && jobStatus !== "failed",
  );
}

/**
 * Maps a dossier job status onto the visible generation checklist.
 */
export function getDossierJobSteps(
  jobStatus: string | null | undefined,
  options?: { readonly isFailed?: boolean },
): readonly GenerationStepView[] {
  return mapJobSteps(DOSSIER_JOB_STEPS, jobStatus, options);
}

/**
 * Maps a petition job status onto the visible generation checklist.
 */
export function getPetitionJobSteps(
  jobStatus: string | null | undefined,
  options?: { readonly isFailed?: boolean },
): readonly GenerationStepView[] {
  return mapJobSteps(PETITION_JOB_STEPS, jobStatus, options);
}

/**
 * Returns the lawyer-facing label for a generation job status.
 */
export function getJobStatusLabel(
  kind: GenerationJobKind,
  jobStatus: string | null | undefined,
): string {
  if (jobStatus === "failed") {
    return kind === "dossier" ? "Falha ao gerar dossiê" : "Falha ao gerar petição";
  }

  if (jobStatus === "completed") {
    return kind === "dossier" ? "Dossiê pronto" : "Petição pronta";
  }

  const steps = kind === "dossier" ? DOSSIER_JOB_STEPS : PETITION_JOB_STEPS;
  const match = steps.find((step) => step.id === jobStatus);

  return (
    match?.label ??
    (kind === "dossier" ? "Gerando dossiê" : "Gerando petição")
  );
}

function mapJobSteps(
  steps: readonly GenerationStepDefinition[],
  jobStatus: string | null | undefined,
  options?: { readonly isFailed?: boolean },
): readonly GenerationStepView[] {
  if (jobStatus === "completed") {
    return steps.map((step) => ({ ...step, state: "complete" }));
  }

  const isFailed = Boolean(options?.isFailed) || jobStatus === "failed";
  const activeId =
    !jobStatus || jobStatus === "failed" || jobStatus === "completed"
      ? steps[0]?.id
      : jobStatus;
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeId),
  );

  return steps.map((step, index) => {
    if (index < currentIndex) {
      return { ...step, state: "complete" };
    }

    if (index === currentIndex) {
      return { ...step, state: isFailed ? "failed" : "current" };
    }

    return { ...step, state: "upcoming" };
  });
}
