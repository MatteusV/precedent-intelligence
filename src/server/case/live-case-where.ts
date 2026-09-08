import type { Prisma } from "@prisma/client";

/**
 * Shared predicate for live (not hidden) cases of an Escritório.
 */
export function liveCaseWhere(
  clerkOrgId: string,
  legalCaseId?: string,
): Prisma.LegalCaseWhereInput {
  return {
    clerkOrgId,
    deletedAt: null,
    ...(legalCaseId !== undefined ? { id: legalCaseId } : {}),
  };
}
