import { Suspense } from "react";
import { OfficeShell } from "@/components/app/office-shell";
import { OfficeShellFallback } from "@/components/app/office-shell-fallback";
import { toDocketCases } from "@/lib/to-docket-cases";
import {
  listCasesForOffice,
  requireOfficeContext,
} from "@/server/case/case-service";

export default function OfficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<OfficeShellFallback />}>
      <OfficeLayoutShell>{children}</OfficeLayoutShell>
    </Suspense>
  );
}

async function OfficeLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const office = await requireOfficeContext();
  const cases = await listCasesForOffice(office.clerkOrgId);

  return <OfficeShell cases={toDocketCases(cases)}>{children}</OfficeShell>;
}
