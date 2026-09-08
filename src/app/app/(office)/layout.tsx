import { OfficeShell } from "@/components/app/office-shell";
import { toDocketCases } from "@/lib/to-docket-cases";
import {
  listCasesForOffice,
  requireOfficeContext,
} from "@/server/case/case-service";

export default async function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const office = await requireOfficeContext();
  const cases = await listCasesForOffice(office.clerkOrgId);

  return <OfficeShell cases={toDocketCases(cases)}>{children}</OfficeShell>;
}
