"use client";

import { useFormStatus } from "react-dom";
import { useCaseGeneration } from "@/components/app/case-generation-provider";
import { Folio } from "@/components/app/folio";
import { GenerationProgress } from "@/components/app/generation-progress";
import { WorkSection } from "@/components/app/work-section";
import { Button } from "@/components/ui/button";
import { generatePetitionAction } from "@/app/actions/case-actions";
import { getPetitionJobSteps, getJobStatusLabel, isGenerationJobInFlight } from "@/lib/generation-jobs";

interface PetitionParagraph {
  readonly text: string;
  readonly isHypothesis?: boolean;
}

interface PetitionSection {
  readonly key: string;
  readonly title: string;
  readonly paragraphs: readonly PetitionParagraph[];
}

interface PetitionView {
  readonly status: "current" | "stale";
  readonly disclaimer: string;
  readonly sections: readonly PetitionSection[];
}

/**
 * Anchored petition on the folio reading surface.
 */
export function PetitionPanel({
  legalCaseId,
  petition,
}: {
  readonly legalCaseId: string;
  readonly petition: PetitionView | null;
}) {
  const live = useCaseGeneration();
  const jobStatus = live?.petitionJobStatus ?? null;
  const isBusy = live?.isPetitionBusy ?? isGenerationJobInFlight(jobStatus);
  const isFailed = live?.isPetitionFailed ?? jobStatus === "failed";
  const needsGeneration = !petition || petition.status === "stale" || isFailed;
  const steps = getPetitionJobSteps(jobStatus, { isFailed });
  const statusLabel = isBusy || isFailed ? getJobStatusLabel("petition", jobStatus) : null;

  return (
    <WorkSection
      actions={
        statusLabel ? (
          <p className="font-mono text-xs text-primary">{statusLabel}</p>
        ) : null
      }
      id="peticao"
      label="Petição"
      title="Peça ancorada"
    >
      {isBusy || isFailed ? (
        <GenerationProgress
          steps={steps}
          title={
            isFailed
              ? "A geração da petição parou"
              : "Gerando a petição ancorada no dossiê"
          }
        />
      ) : null}

      {needsGeneration && !isBusy ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-5">
          {petition?.status === "stale" ? (
            <p className="mb-4 text-sm text-stamp">
              A petição anterior ficou obsoleta após um novo dossiê.
            </p>
          ) : (
            <p className="mb-4 max-w-xl text-sm leading-6 text-muted-foreground">
              A peça cita só o que está no dossiê. Sem âncora, o trecho vira
              hipótese.
            </p>
          )}
          <PetitionGenerateForm
            isBusy={isBusy}
            legalCaseId={legalCaseId}
            onStart={() => live?.markGenerating("petition")}
          />
        </div>
      ) : null}

      {petition ? (
        <Folio>
          <p className="border-l-2 border-stamp pl-3 text-sm leading-6 text-folio-ink/70">
            {petition.disclaimer}
          </p>
          <div className="mt-10 space-y-8">
            {petition.sections.map((section) => (
              <section className="space-y-3" key={section.key}>
                <h3 className="font-medium tracking-tight">{section.title}</h3>
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    className="text-[15px] leading-7"
                    key={`${section.key}-${index}`}
                  >
                    {paragraph.isHypothesis ? (
                      <span className="mr-2 font-mono text-[10px] tracking-[0.14em] text-stamp uppercase">
                        Hipótese
                      </span>
                    ) : null}
                    {paragraph.text}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Folio>
      ) : null}

    </WorkSection>
  );
}

function PetitionGenerateForm({
  legalCaseId,
  isBusy,
  onStart,
}: {
  readonly legalCaseId: string;
  readonly isBusy: boolean;
  readonly onStart: () => void;
}) {
  return (
    <form action={generatePetitionAction} onSubmit={onStart}>
      <input name="legalCaseId" type="hidden" value={legalCaseId} />
      <PetitionGenerateButton isBusy={isBusy} />
    </form>
  );
}

function PetitionGenerateButton({
  isBusy,
}: {
  readonly isBusy: boolean;
}) {
  const { pending } = useFormStatus();
  const isGenerating = isBusy || pending;

  return (
    <Button disabled={isGenerating} type="submit">
      {isGenerating ? "Gerando petição" : "Gerar petição"}
    </Button>
  );
}
