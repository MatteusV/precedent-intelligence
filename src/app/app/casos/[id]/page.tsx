import Link from "next/link";
import { notFound } from "next/navigation";
import {
  generateDossierAction,
  generatePetitionAction,
} from "@/app/actions/case-actions";
import { getCaseForOffice, requireOfficeContext } from "@/server/case/case-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const office = await requireOfficeContext();
  const legalCase = await getCaseForOffice(id, office.clerkOrgId);

  if (!legalCase) {
    notFound();
  }

  const dossier = legalCase.currentDossier;
  const petition = legalCase.currentPetition;
  const isGenerating = Boolean(legalCase.dossierJobStatus &&
    legalCase.dossierJobStatus !== "completed" &&
    legalCase.dossierJobStatus !== "failed");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Caso</p>
          <h1 className="text-2xl font-semibold">
            {legalCase.theme?.name ?? "Rascunho"}
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/app">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material do Caso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="whitespace-pre-wrap">{legalCase.materialText}</p>
          <p>
            Tribunal: <strong>{legalCase.tribunal.toUpperCase()}</strong>
          </p>
          {legalCase.claim ? (
            <p>
              Pedido confirmado: <strong>{legalCase.claim}</strong>
            </p>
          ) : (
            <Button asChild>
              <Link href={`/app/casos/${legalCase.id}/confirmar`}>
                Confirmar Tema e Pedido
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {legalCase.status === "confirmed" ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dossiê</CardTitle>
            {isGenerating ? (
              <Badge variant="secondary">
                {legalCase.dossierJobStatus === "retrieving" && "Recuperando"}
                {legalCase.dossierJobStatus === "ingesting" && "Ingerindo"}
                {legalCase.dossierJobStatus === "analyzing" && "Analisando"}
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {!dossier ? (
              <form action={generateDossierAction}>
                <input type="hidden" name="legalCaseId" value={legalCase.id} />
                <Button type="submit">Gerar Dossiê</Button>
              </form>
            ) : (
              <>
                <p className="text-sm">{dossier.patternSummary}</p>
                <p className="text-sm text-muted-foreground">
                  Padrão do órgão: {dossier.organPatternLabel}
                </p>
                {dossier.coverageNote ? (
                  <p className="text-sm text-amber-300">{dossier.coverageNote}</p>
                ) : null}
                <div className="space-y-3">
                  {dossier.precedents.map((precedent) => (
                    <div key={precedent.id} className="rounded-md border p-3 text-sm">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge>{precedent.stance}</Badge>
                        <span>{precedent.judgment.caseNumber}</span>
                      </div>
                      <p>{precedent.excerpt}</p>
                    </div>
                  ))}
                </div>
                <form action={generateDossierAction}>
                  <input type="hidden" name="legalCaseId" value={legalCase.id} />
                  <Button type="submit" variant="outline">
                    Gerar novo Dossiê
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {dossier ? (
        <Card>
          <CardHeader>
            <CardTitle>Petição inicial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!petition || petition.status === "stale" ? (
              <>
                {petition?.status === "stale" ? (
                  <p className="text-sm text-amber-300">
                    A petição anterior ficou obsoleta após um novo Dossiê.
                  </p>
                ) : null}
                <form action={generatePetitionAction}>
                  <input type="hidden" name="legalCaseId" value={legalCase.id} />
                  <Button type="submit">Gerar Petição</Button>
                </form>
              </>
            ) : (
              <>
                <p className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                  {petition.disclaimer}
                </p>
                {(petition.sections as Array<{
                  key: string;
                  title: string;
                  paragraphs: Array<{ text: string; isHypothesis?: boolean }>;
                }>).map((section) => (
                  <section key={section.key} className="space-y-2">
                    <h3 className="font-medium">{section.title}</h3>
                    {section.paragraphs.map((paragraph, index) => (
                      <p key={`${section.key}-${index}`} className="text-sm">
                        {paragraph.isHypothesis ? (
                          <span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs">
                            Hipótese
                          </span>
                        ) : null}
                        {paragraph.text}
                      </p>
                    ))}
                  </section>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
