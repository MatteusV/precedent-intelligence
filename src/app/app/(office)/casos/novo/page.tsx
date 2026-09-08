import { CaseWorkbench } from "@/components/app/case-workbench";
import { FormField } from "@/components/app/form-field";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { CONTROL_CLASS_NAME } from "@/lib/control-class";
import { getNewCaseStages } from "@/lib/case-stages";
import { SUPPORTED_TRIBUNALS } from "@/lib/tribunals";
import { createCaseAction } from "@/app/actions/case-actions";

export const metadata = {
  title: "Novo caso",
};

export default function NewCasePage() {
  return (
    <CaseWorkbench stages={getNewCaseStages()}>
      <PageHeader
        description="Cole os fatos. Tribunal, juiz e órgão afinam o recorte — o tema fecha no passo seguinte."
        eyebrow="Abertura"
        title="Novo caso"
      />

      <form action={createCaseAction} className="flex flex-col gap-6">
        <FormField htmlFor="materialText" label="Material do caso">
          <textarea
            className={`${CONTROL_CLASS_NAME} min-h-48 resize-y`}
            id="materialText"
            name="materialText"
            placeholder="Descreva os fatos e o contexto do cliente..."
            required
            rows={10}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField htmlFor="tribunal" label="Tribunal">
            <select
              className={CONTROL_CLASS_NAME}
              defaultValue=""
              id="tribunal"
              name="tribunal"
              required
            >
              <option disabled value="">
                Selecione
              </option>
              {SUPPORTED_TRIBUNALS.map((tribunal) => (
                <option key={tribunal.slug} value={tribunal.slug}>
                  {tribunal.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField htmlFor="judgeName" label="Juiz">
            <input
              className={CONTROL_CLASS_NAME}
              id="judgeName"
              name="judgeName"
              placeholder="Opcional"
            />
          </FormField>

          <FormField htmlFor="organName" label="Órgão">
            <input
              className={CONTROL_CLASS_NAME}
              id="organName"
              name="organName"
              placeholder="Opcional"
            />
          </FormField>
        </div>

        <div className="sticky bottom-4 flex justify-end rounded-lg border border-border bg-background/90 p-3 backdrop-blur-md">
          <Button type="submit">Continuar para confirmação</Button>
        </div>
      </form>
    </CaseWorkbench>
  );
}
