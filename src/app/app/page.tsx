import Link from "next/link";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { listCasesForOffice, requireOfficeContext } from "@/server/case/case-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AppHomePage() {
  const office = await requireOfficeContext();
  const cases = await listCasesForOffice(office.clerkOrgId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Escritório</p>
          <h1 className="text-2xl font-semibold">Casos</h1>
        </div>
        <div className="flex items-center gap-3">
          <OrganizationSwitcher hidePersonal />
          <UserButton />
        </div>
      </header>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/app/casos/novo">Novo Caso</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {cases.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-muted-foreground">
              Nenhum Caso ainda. Comece descrevendo o Material do Caso.
            </CardContent>
          </Card>
        ) : (
          cases.map((legalCase) => (
            <Card key={legalCase.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  <Link href={`/app/casos/${legalCase.id}`} className="hover:underline">
                    {legalCase.theme?.name ?? "Aguardando confirmação de Tema"}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Tribunal: {legalCase.tribunal.toUpperCase()} · Status: {legalCase.status}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
