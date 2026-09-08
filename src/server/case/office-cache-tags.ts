import { updateTag } from "next/cache";

/**
 * Cache tags for Escritório-scoped office reads.
 */
export function officeCasesCacheTag(clerkOrgId: string): string {
  return `office:${clerkOrgId}:cases`;
}

export function officeCaseCacheTag(
  clerkOrgId: string,
  legalCaseId: string,
): string {
  return `office:${clerkOrgId}:case:${legalCaseId}`;
}

export function invalidateOfficeCases(clerkOrgId: string): void {
  updateTag(officeCasesCacheTag(clerkOrgId));
}

export function invalidateOfficeCase(
  clerkOrgId: string,
  legalCaseId: string,
): void {
  invalidateOfficeCases(clerkOrgId);
  updateTag(officeCaseCacheTag(clerkOrgId, legalCaseId));
}
