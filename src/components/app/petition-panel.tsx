import { Folio } from "@/components/app/folio";
import { Button } from "@/components/ui/button";
import { generatePetitionAction } from "@/app/actions/case-actions";

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
  const needsGeneration = !petition || petition.status === "stale";

  return (
    <section className="space-y-4 scroll-mt-24" id="peticao">
      <div>
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
          Petição
        </p>
        <h2 className="font-folio text-2xl tracking-tight">Peça ancorada</h2>
      </div>

      {needsGeneration ? (
        <div className="space-y-4">
          {petition?.status === "stale" ? (
            <p className="text-sm text-stamp">
              A petição anterior ficou obsoleta após um novo dossiê.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              A peça cita só o que está no dossiê. Sem âncora, o trecho vira hipótese.
            </p>
          )}
          <form action={generatePetitionAction}>
            <input name="legalCaseId" type="hidden" value={legalCaseId} />
            <Button type="submit">Gerar petição</Button>
          </form>
        </div>
      ) : (
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
      )}
    </section>
  );
}
