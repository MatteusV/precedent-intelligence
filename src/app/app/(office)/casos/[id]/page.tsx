import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseWorkbench } from "@/components/app/case-workbench";
import { DossierPanel } from "@/components/app/dossier-panel";
import { PageHeader } from "@/components/app/page-header";
import { PetitionPanel } from "@/components/app/petition-panel";
import { Button } from "@/components/ui/button";
import { getCaseStages, toCaseStageInput } from "@/lib/case-stages";
import { getTribunalBySlug } from "@/lib/tribunals";
import { getCaseForOffice, requireOfficeContext } from "@/server/case/case-service";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Caso",
};

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const office = await requireOfficeContext();
  const legalCase = await getCaseForOffice(id, office.clerkOrgId);

  if (!legalCase) {
    notFound();
  }

  const stages = getCaseStages(toCaseStageInput(legalCase));
  const tribunalLabel =
    getTribunalBySlug(legalCase.tribunal)?.label ??
    legalCase.tribunal.toUpperCase();
  const petition = legalCase.currentPetition
    ? {
        status: legalCase.currentPetition.status,
        disclaimer: legalCase.currentPetition.disclaimer,
        sections: legalCase.currentPetition.sections as Array<{
          key: string;
          title: string;
          paragraphs: Array<{ text: string; isHypothesis?: boolean }>;
        }>,
      }
    : null;

  return (
    <CaseWorkbench caseId={legalCase.id} stages={stages}>
      <PageHeader
        description={
          [tribunalLabel, legalCase.judgeName, legalCase.organName]
            .filter(Boolean)
            .join(" · ")
        }
        eyebrow="Caso"
        title={legalCase.theme?.name ?? "Rascunho"}
      />

      <section className="scroll-mt-24 space-y-3" id="material">
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
          Material
        </p>
        <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
          {legalCase.materialText}
        </p>
      </section>

      <section className="scroll-mt-24 space-y-3" id="pedido">
        <p className="font-mono text-[11px] tracking-[0.18em] text-primary uppercase">
          Tema e pedido
        </p>
        {legalCase.claim ? (
          <p className="text-sm leading-7">{legalCase.claim}</p>
        ) : (
          <Button asChild>
            <Link href={`/app/casos/${legalCase.id}/confirmar`}>
              Confirmar tema e pedido
            </Link>
          </Button>
        )}
      </section>

      {legalCase.status === "confirmed" ? (
        <DossierPanel
          dossier={legalCase.currentDossier}
          dossierJobStatus={legalCase.dossierJobStatus}
          legalCaseId={legalCase.id}
        />
      ) : null}

      {legalCase.currentDossier ? (
        <PetitionPanel legalCaseId={legalCase.id} petition={petition} />
      ) : null}
    </CaseWorkbench>
  );
}
