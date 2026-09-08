import { Folio } from "@/components/app/folio";
import { StanceMark } from "@/components/app/stance-mark";
import { WorkSection } from "@/components/app/work-section";
import { Button } from "@/components/ui/button";
import { generateDossierAction } from "@/app/actions/case-actions";
import { isDossierJobInFlight } from "@/lib/case-stages";

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

const JOB_STATUS_COPY: Record<string, string> = {
  retrieving: "Recuperando precedentes",
  ingesting: "Ingerindo acervo",
  analyzing: "Analisando o padrão",
  pending: "Na fila",
};

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
  const isGenerating = isDossierJobInFlight(dossierJobStatus);
  const statusLabel = dossierJobStatus
    ? JOB_STATUS_COPY[dossierJobStatus]
    : null;

  return (
    <WorkSection
      actions={
        isGenerating && statusLabel ? (
          <p className="font-mono text-xs text-primary">{statusLabel}</p>
        ) : null
      }
      id="dossie"
      label="Dossiê"
      title="Padrão daquele juízo"
    >
      {!dossier ? (
        <div className="rounded-lg border border-dashed border-border bg-card/40 px-4 py-5">
          <form action={generateDossierAction}>
            <input name="legalCaseId" type="hidden" value={legalCaseId} />
            <p className="mb-4 max-w-xl text-sm leading-6 text-muted-foreground">
              Sem precedente no dossiê, não há afirmação de jurisprudência.
            </p>
            <Button disabled={isGenerating} type="submit">
              {isGenerating ? "Gerando dossiê" : "Gerar dossiê"}
            </Button>
          </form>
        </div>
      ) : (
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
      )}
      {dossier ? (
        <form action={generateDossierAction}>
          <input name="legalCaseId" type="hidden" value={legalCaseId} />
          <Button type="submit" variant="outline">
            Gerar novo dossiê
          </Button>
        </form>
      ) : null}
    </WorkSection>
  );
}
