import type { CaseNextAction, CaseStageProgress } from "@/lib/case-stages";

export interface DocketCase {
  readonly id: string;
  readonly title: string;
  readonly tribunalLabel: string;
  readonly judgeName: string | null;
  readonly updatedAt: Date;
  readonly stages: readonly CaseStageProgress[];
  readonly nextAction: CaseNextAction;
}
