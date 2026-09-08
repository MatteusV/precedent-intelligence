import { CaseSpine } from "@/components/app/case-spine";
import type { CaseStageProgress } from "@/lib/case-stages";

/**
 * Case work area: spine on the left, file contents on the right.
 */
export function CaseWorkbench({
  stages,
  caseId,
  children,
}: {
  readonly stages: readonly CaseStageProgress[];
  readonly caseId?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row md:gap-10">
      <div className="md:hidden">
        <CaseSpine caseId={caseId} stages={stages} variant="ticks" />
      </div>
      <aside className="hidden w-48 shrink-0 pt-2 md:block">
        <div className="sticky top-24">
          <CaseSpine caseId={caseId} stages={stages} />
        </div>
      </aside>
      <div className="min-w-0 flex-1 space-y-8">{children}</div>
    </div>
  );
}
