import type { CaseStageProgress } from "@/lib/case-stages";

export interface DocketCase {
  readonly id: string;
  readonly title: string;
  readonly tribunalLabel: string;
  readonly updatedAt: Date;
  readonly stages: readonly CaseStageProgress[];
}
