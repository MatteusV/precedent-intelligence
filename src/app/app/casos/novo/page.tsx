import Link from "next/link";
import { createCaseAction } from "@/app/actions/case-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_TRIBUNALS } from "@/lib/tribunals";

export default function NewCasePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Novo Caso</h1>
        <Button asChild variant="outline">
          <Link href="/app">Voltar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material do Caso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCaseAction} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm">
              Material do Caso
              <textarea
                name="materialText"
                required
                rows={8}
                className="rounded-md border bg-background px-3 py-2"
                placeholder="Descreva os fatos e o contexto do cliente..."
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Tribunal
              <select
                name="tribunal"
                required
                className="rounded-md border bg-background px-3 py-2"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecione o tribunal
                </option>
                {SUPPORTED_TRIBUNALS.map((tribunal) => (
                  <option key={tribunal.slug} value={tribunal.slug}>
                    {tribunal.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Juiz (opcional)
              <input
                name="judgeName"
                className="rounded-md border bg-background px-3 py-2"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              Órgão (opcional)
              <input
                name="organName"
                className="rounded-md border bg-background px-3 py-2"
              />
            </label>

            <Button type="submit">Continuar para confirmação</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
