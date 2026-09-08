import type { Judgment, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { MAX_CANDIDATES } from "@/lib/constants";
export { shouldTriggerIngest } from "./coverage-rules";

export interface CandidateFilters {
  themeId: string;
  tribunal: string;
  judgeName?: string | null;
  organName?: string | null;
}

export async function countMatchingJudgments(
  filters: CandidateFilters,
): Promise<number> {
  return prisma.judgment.count({
    where: buildJudgmentWhere(filters),
  });
}

export async function retrieveCandidateJudgments(
  filters: CandidateFilters,
): Promise<Judgment[]> {
  return prisma.judgment.findMany({
    where: buildJudgmentWhere(filters),
    orderBy: [{ judgmentDate: "desc" }, { createdAt: "desc" }],
    take: MAX_CANDIDATES,
  });
}

function buildJudgmentWhere(filters: CandidateFilters): Prisma.JudgmentWhereInput {
  const where: Prisma.JudgmentWhereInput = {
    deletedAt: null,
    caseNumber: { not: null },
    tribunal: filters.tribunal,
    themes: {
      some: {
        themeId: filters.themeId,
      },
    },
  };

  if (filters.judgeName) {
    where.rapporteur = {
      contains: filters.judgeName,
      mode: "insensitive",
    };
  }

  if (filters.organName) {
    where.organ = {
      contains: filters.organName,
      mode: "insensitive",
    };
  }

  return where;
}
