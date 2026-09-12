import type { Prisma } from "@prisma/client";

/**
 * Prisma select for reopening a live Caso in the office UI.
 */
export const getCaseForOfficeSelect = {
  id: true,
  materialText: true,
  claim: true,
  tribunal: true,
  judgeName: true,
  organName: true,
  status: true,
  inferredThemeSlug: true,
  inferredClaim: true,
  currentDossierId: true,
  dossierJobStatus: true,
  petitionJobStatus: true,
  theme: {
    select: { name: true },
  },
  currentDossier: {
    select: {
      patternSummary: true,
      organPatternLabel: true,
      coverageNote: true,
      precedents: {
        select: {
          id: true,
          stance: true,
          excerpt: true,
          sortOrder: true,
          judgment: {
            select: { caseNumber: true },
          },
        },
        orderBy: { sortOrder: "asc" as const },
      },
    },
  },
  currentPetition: {
    select: {
      id: true,
      status: true,
      disclaimer: true,
      sections: true,
    },
  },
} satisfies Prisma.LegalCaseSelect;
