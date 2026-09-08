import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CaseWorkbench } from "@/components/app/case-workbench";
import { DossierPanel } from "@/components/app/dossier-panel";
import { HideCaseButton } from "@/components/app/hide-case-button";
import { NextActionBanner } from "@/components/app/next-action-banner";
import { PageHeader } from "@/components/app/page-header";
import { PetitionPanel } from "@/components/app/petition-panel";
import { WorkSection } from "@/components/app/work-section";
import { Button } from "@/components/ui/button";
import {
  getCaseNextAction,
  getCaseStages,
  toCaseStageInput,
} from "@/lib/case-stages";
import { getTribunalBySlug } from "@/lib/tribunals";
import { getCaseForOffice, requireOfficeContext } from "@/server/case/case-service";
import OfficeLoading from "../../loading";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Caso",
};

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  return (
    <Suspense fallback={<OfficeLoading />}>
      <CaseDetailContent params={params} />
    </Suspense>
  );
}

async function CaseDetailContent({ params }: CaseDetailPageProps) {
  const { id } = await params;
  const office = await requireOfficeContext();
  const legalCase = await getCaseForOffice(id, office.clerkOrgId);

  if (!legalCase) {
    notFound();
  }

  const stages = getCaseStages(toCaseStageInput(legalCase));
  const nextAction = getCaseNextAction(legalCase.id, stages);
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
        actions={<HideCaseButton legalCaseId={legalCase.id} />}
        description={
          [tribunalLabel, legalCase.judgeName, legalCase.organName]
            .filter(Boolean)
            .join(" · ")
        }
        eyebrow="Caso"
        title={legalCase.theme?.name ?? "Rascunho"}
      />

      <NextActionBanner action={nextAction} />

      <WorkSection id="material" label="Material">
        <div className="rounded-lg border border-border bg-card/40 px-4 py-4">
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {legalCase.materialText}
          </p>
        </div>
      </WorkSection>

      <WorkSection id="pedido" label="Tema e pedido">
        {legalCase.claim ? (
          <div className="rounded-lg border border-border bg-card/40 px-4 py-4">
            <p className="text-sm leading-7">{legalCase.claim}</p>
          </div>
        ) : (
          <Button asChild>
            <Link href={`/app/casos/${legalCase.id}/confirmar`}>
              Confirmar tema e pedido
            </Link>
          </Button>
        )}
      </WorkSection>

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
