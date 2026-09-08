import Link from "next/link";
import { notFound } from "next/navigation";
import { confirmCaseAction } from "@/app/actions/case-actions";
import { getCaseForOffice, requireOfficeContext } from "@/server/case/case-service";
import { PRODUCT_THEMES } from "@/lib/product-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConfirmCasePageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmCasePage({ params }: ConfirmCasePageProps) {
  const { id } = await params;
  const office = await requireOfficeContext();
  const legalCase = await getCaseForOffice(id, office.clerkOrgId);

  if (!legalCase) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Confirmar Tema e Pedido</h1>
        <Button asChild variant="outline">
          <Link href="/app">Casos</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inferência inicial</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={confirmCaseAction} className="flex flex-col gap-4">
            <input type="hidden" name="legalCaseId" value={legalCase.id} />

            <label className="flex flex-col gap-2 text-sm">
              Tema de produto
              <select
                name="themeSlug"
                defaultValue={legalCase.inferredThemeSlug ?? ""}
                className="rounded-md border bg-background px-3 py-2"
              >
                {PRODUCT_THEMES.map((theme) => (
                  <option key={theme.slug} value={theme.slug}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Outro (nome curto do recorte)
              <input
                name="outroName"
                className="rounded-md border bg-background px-3 py-2"
                placeholder="Use apenas se nenhum Tema de produto servir"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Pedido
              <textarea
                name="claim"
                required
                rows={4}
                defaultValue={legalCase.inferredClaim ?? ""}
                className="rounded-md border bg-background px-3 py-2"
              />
            </label>

            <Button type="submit">Confirmar e salvar Caso</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
