import { Folio } from "@/components/app/folio";
import { StanceMark } from "@/components/app/stance-mark";
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

  return (
    <section className="space-y-4 scroll-mt-24" id="dossie">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
            Dossiê
          </p>
          <h2 className="font-folio text-2xl tracking-tight">Padrão daquele juízo</h2>
        </div>
        {isGenerating ? (
          <p className="font-mono text-xs text-primary">
            {dossierJobStatus === "retrieving" && "Recuperando"}
            {dossierJobStatus === "ingesting" && "Ingerindo"}
            {dossierJobStatus === "analyzing" && "Analisando"}
            {dossierJobStatus === "pending" && "Na fila"}
          </p>
        ) : null}
      </div>

      {!dossier ? (
        <form action={generateDossierAction}>
          <input name="legalCaseId" type="hidden" value={legalCaseId} />
          <p className="mb-4 text-sm text-muted-foreground">
            Sem precedente no dossiê, não há afirmação de jurisprudência.
          </p>
          <Button disabled={isGenerating} type="submit">
            Gerar dossiê
          </Button>
        </form>
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
              <li className="grid gap-3 py-5 sm:grid-cols-[7rem_minmax(0,1fr)]" key={precedent.id}>
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
    </section>
  );
}
