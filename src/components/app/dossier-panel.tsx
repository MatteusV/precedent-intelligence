"use client";

import { useFormStatus } from "react-dom";
import { useCaseGeneration } from "@/components/app/case-generation-provider";
import { Folio } from "@/components/app/folio";
import { GenerationProgress } from "@/components/app/generation-progress";
import { StanceMark } from "@/components/app/stance-mark";
import { WorkSection } from "@/components/app/work-section";
import { Button } from "@/components/ui/button";
import { generateDossierAction } from "@/app/actions/case-actions";
import { isDossierJobInFlight } from "@/lib/case-stages";
import { getDossierJobSteps, getJobStatusLabel } from "@/lib/generation-jobs";

interface DossierPrecedentView {
  readonly id: string;
  readonly stance: "supporting" | "opposing" | "dissent";
  readonly excerpt: string;
  readonly judgment: {
    readonly caseNumber: string | null;
  };
}

interface DossierView {
  readonly patternSummary: string;
  readonly organPatternLabel: string;
  readonly coverageNote: string | null;
  readonly precedents: readonly DossierPrecedentView[];
}

/**
 * Cited dossiê on the folio reading surface.
 */
export function DossierPanel({
  legalCaseId,
  dossier,
  dossierJobStatus,
}: {
  readonly legalCaseId: string;
  readonly dossier: DossierView | null;
  readonly dossierJobStatus: string | null;
}) {
  const live = useCaseGeneration();
  const jobStatus = live?.dossierJobStatus ?? dossierJobStatus;
  const isBusy = live?.isDossierBusy ?? isDossierJobInFlight(jobStatus);
  const isFailed = live?.isDossierFailed ?? jobStatus === "failed";
  const steps = getDossierJobSteps(jobStatus, { isFailed });
  const statusLabel = isBusy || isFailed ? getJobStatusLabel("dossier", jobStatus) : null;

  return (
    <WorkSection
      actions={
        statusLabel ? (
          <p className="font-mono text-xs text-primary">{statusLabel}</p>
        ) : null
      }
      id="dossie"
      label="Dossiê"
      title="Padrão daquele juízo"
    >
      {isBusy || isFailed ? (
        <GenerationProgress
          steps={steps}
          title={
            isFailed
              ? "A geração do dossiê parou"
              : "Gerando o dossiê deste recorte"
          }
        />
      ) : null}

      {!dossier && !isBusy && !isFailed ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-5">
          <DossierGenerateForm
            isBusy={isBusy}
            legalCaseId={legalCaseId}
            onStart={() => live?.markGenerating("dossier")}
          />
        </div>
      ) : null}

      {dossier ? (
        <Folio>
          <p className="text-lg leading-8">{dossier.patternSummary}</p>
          <p className="mt-3 font-mono text-xs tracking-wider text-folio-ink/60 uppercase">
            {dossier.organPatternLabel}
          </p>
          {dossier.coverageNote ? (
            <p className="mt-4 border-l-2 border-stamp pl-3 text-sm text-stamp">
              {dossier.coverageNote}
            </p>
          ) : null}

          <ol className="mt-8 divide-y divide-folio-ink/15">
            {dossier.precedents.map((precedent) => (
              <li
                className="grid gap-3 py-5 sm:grid-cols-[7rem_minmax(0,1fr)]"
                key={precedent.id}
              >
                <div className="space-y-1">
                  <StanceMark stance={precedent.stance} />
                  <p className="font-mono text-[11px] text-folio-ink/55">
                    {precedent.judgment.caseNumber ?? "Sem número"}
                  </p>
                </div>
                <p className="text-sm leading-7">{precedent.excerpt}</p>
              </li>
            ))}
          </ol>
        </Folio>
      ) : null}

      {!isBusy && (dossier || isFailed) ? (
        <DossierGenerateForm
          isBusy={isBusy}
          legalCaseId={legalCaseId}
          onStart={() => live?.markGenerating("dossier")}
          variant={dossier ? "outline" : "default"}
        />
      ) : null}
    </WorkSection>
  );
}

function DossierGenerateForm({
  legalCaseId,
  isBusy,
  onStart,
  variant = "default",
}: {
  readonly legalCaseId: string;
  readonly isBusy: boolean;
  readonly onStart: () => void;
  readonly variant?: "default" | "outline";
}) {
  return (
    <form action={generateDossierAction} onSubmit={onStart}>
      <input name="legalCaseId" type="hidden" value={legalCaseId} />
      {!isBusy && variant === "default" ? (
        <p className="mb-4 max-w-xl text-sm leading-6 text-muted-foreground">
          Sem precedente no dossiê, não há afirmação de jurisprudência.
        </p>
      ) : null}
      <DossierGenerateButton isBusy={isBusy} variant={variant} />
    </form>
  );
}

function DossierGenerateButton({
  isBusy,
  variant,
}: {
  readonly isBusy: boolean;
  readonly variant: "default" | "outline";
}) {
  const { pending } = useFormStatus();
  const isGenerating = isBusy || pending;

  return (
    <Button disabled={isGenerating} type="submit" variant={variant}>
      {isGenerating ? "Gerando dossiê" : variant === "outline" ? "Gerar novo dossiê" : "Gerar dossiê"}
    </Button>
  );
}
