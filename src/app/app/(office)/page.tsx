import Link from "next/link";
import { DocketTable } from "@/components/app/docket-table";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { toDocketCases } from "@/lib/to-docket-cases";
import {
  listCasesForOffice,
  requireOfficeContext,
} from "@/server/case/case-service";

export const metadata = {
  title: "Casos",
};

export default async function AppHomePage() {
  const office = await requireOfficeContext();
  const cases = await listCasesForOffice(office.clerkOrgId);

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
      <PageHeader
        actions={
          <Button asChild>
            <Link href="/app/casos/novo">Novo caso</Link>
          </Button>
        }
        description="O dossiê nasce do tema confirmado, não de um chat sobre a lei."
        eyebrow="Pauta"
        title="Casos"
      />
      <DocketTable cases={toDocketCases(cases)} />
    </main>
  );
}
