import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CaseWorkbench } from "@/components/app/case-workbench";
import { FormField } from "@/components/app/form-field";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { CONTROL_CLASS_NAME } from "@/lib/control-class";
import { getCaseStages, toCaseStageInput } from "@/lib/case-stages";
import { PRODUCT_THEMES } from "@/lib/product-themes";
import { confirmCaseAction } from "@/app/actions/case-actions";
import { getCaseForOffice, requireOfficeContext } from "@/server/case/case-service";
import OfficeLoading from "../../../loading";

interface ConfirmCasePageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Confirmar tema",
};

export default function ConfirmCasePage({ params }: ConfirmCasePageProps) {
  return (
    <Suspense fallback={<OfficeLoading />}>
      <ConfirmCaseContent params={params} />
    </Suspense>
  );
}

async function ConfirmCaseContent({ params }: ConfirmCasePageProps) {
  const { id } = await params;
  const office = await requireOfficeContext();
  const legalCase = await getCaseForOffice(id, office.clerkOrgId);

  if (!legalCase) {
    notFound();
  }

  const stages = getCaseStages(toCaseStageInput(legalCase));

  return (
    <CaseWorkbench caseId={legalCase.id} stages={stages}>
      <PageHeader
        description="O recorte precisa caber no tema. Sem tema fechado, o dossiê não ensina nada."
        eyebrow="Confirmação"
        title="Tema e pedido"
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <form action={confirmCaseAction} className="flex flex-col gap-5">
          <input name="legalCaseId" type="hidden" value={legalCase.id} />

          <FormField htmlFor="themeSlug" label="Tema de produto">
            <select
              className={CONTROL_CLASS_NAME}
              defaultValue={legalCase.inferredThemeSlug ?? ""}
              id="themeSlug"
              name="themeSlug"
            >
              {PRODUCT_THEMES.map((theme) => (
                <option key={theme.slug} value={theme.slug}>
                  {theme.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            hint="Use apenas se nenhum tema de produto servir."
            htmlFor="outroName"
            label="Outro recorte"
          >
            <input
              className={CONTROL_CLASS_NAME}
              id="outroName"
              name="outroName"
              placeholder="Nome curto do recorte"
            />
          </FormField>

          <FormField htmlFor="claim" label="Pedido">
            <textarea
              className={`${CONTROL_CLASS_NAME} resize-y`}
              defaultValue={legalCase.inferredClaim ?? ""}
              id="claim"
              name="claim"
              required
              rows={5}
            />
          </FormField>

          <div className="sticky bottom-4 flex justify-end rounded-lg border border-border bg-background/90 p-3 backdrop-blur-md">
            <Button type="submit">Confirmar e salvar caso</Button>
          </div>
        </form>

        <aside className="space-y-3 rounded-lg border border-border bg-card/40 px-4 py-4 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:border-l lg:pl-6">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            Material
          </p>
          <p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground">
            {legalCase.materialText}
          </p>
        </aside>
      </div>
    </CaseWorkbench>
  );
}
