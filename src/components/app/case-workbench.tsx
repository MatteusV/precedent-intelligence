import {
  CaseGenerationProvider,
  type CaseGenerationSnapshot,
} from "@/components/app/case-generation-provider";
import { CaseSpine } from "@/components/app/case-spine";
import { LiveCaseSpine } from "@/components/app/live-case-spine";
import type { CaseStageProgress } from "@/lib/case-stages";

/**
 * Case work area: spine on the left, file contents on the right.
 */
export function CaseWorkbench({
  stages,
  caseId,
  generation,
  children,
}: {
  readonly stages: readonly CaseStageProgress[];
  readonly caseId?: string;
  readonly generation?: CaseGenerationSnapshot;
  readonly children: React.ReactNode;
}) {
  const body = (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 md:flex-row md:gap-12">
      <div className="md:hidden">
        {generation && caseId ? (
          <LiveCaseSpine caseId={caseId} stages={stages} variant="ticks" />
        ) : (
          <CaseSpine caseId={caseId} stages={stages} variant="ticks" />
        )}
      </div>
      <aside className="hidden w-48 shrink-0 pt-2 md:block">
        <div className="sticky top-24">
          {generation && caseId ? (
            <LiveCaseSpine caseId={caseId} stages={stages} />
          ) : (
            <CaseSpine caseId={caseId} stages={stages} />
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1 space-y-8">{children}</div>
    </div>
  );

  if (!generation || !caseId) {
    return body;
  }

  return (
    <CaseGenerationProvider initial={generation} legalCaseId={caseId}>
      {body}
    </CaseGenerationProvider>
  );
}
