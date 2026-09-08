import type { Judgment } from "@prisma/client";
import type { DossierDraft } from "@/server/agent/schemas";
import { extractCaseNumbers } from "@/lib/content-hash";

export interface ValidatedPrecedent {
  judgmentId: string;
  stance: "supporting" | "opposing" | "dissent";
  excerpt: string;
}

export interface ValidatedDossierDraft {
  patternSummary: string;
  organPatternLabel: string;
  coverageNote?: string;
  precedents: ValidatedPrecedent[];
}

export function validateDossierDraft(
  draft: DossierDraft,
  allowlist: Judgment[],
): ValidatedDossierDraft {
  const byId = new Map(allowlist.map((judgment) => [judgment.id, judgment]));

  const precedents = draft.precedents.flatMap((item) => {
    const judgment = byId.get(item.judgmentId);
    if (!judgment || !judgment.caseNumber) {
      return [];
    }

    const haystack = judgment.rawText.toLowerCase();
    const excerpt = item.excerpt.trim();
    if (!haystack.includes(excerpt.toLowerCase())) {
      return [];
    }

    return [
      {
        judgmentId: judgment.id,
        stance: item.stance,
        excerpt,
      },
    ];
  });

  return {
    patternSummary: draft.patternSummary,
    organPatternLabel: draft.organPatternLabel,
    coverageNote: draft.coverageNote,
    precedents,
  };
}

export interface PetitionParagraph {
  text: string;
  dossierPrecedentId?: string;
  isHypothesis: boolean;
}

export interface ValidatedPetitionSection {
  key: string;
  title: string;
  paragraphs: PetitionParagraph[];
}

export interface ValidatedPetitionDraft {
  sections: ValidatedPetitionSection[];
}

export function validatePetitionDraft(
  draft: import("@/server/agent/schemas").PetitionDraft,
  allowlistedCaseNumbers: Set<string>,
  precedentByJudgmentId: Map<string, string>,
): ValidatedPetitionDraft {
  return {
    sections: draft.sections.map((section) => ({
      key: section.key,
      title: section.title,
      paragraphs: section.paragraphs.map((paragraph) => {
        const caseNumbers = extractCaseNumbers(paragraph.text);
        const hasUnknownCaseNumber = caseNumbers.some(
          (caseNumber) => !allowlistedCaseNumbers.has(caseNumber),
        );

        if (hasUnknownCaseNumber) {
          return {
            text: paragraph.text,
            isHypothesis: true,
          };
        }

        if (paragraph.judgmentId) {
          const dossierPrecedentId = precedentByJudgmentId.get(
            paragraph.judgmentId,
          );

          if (!dossierPrecedentId) {
            return {
              text: paragraph.text,
              isHypothesis: true,
            };
          }

          return {
            text: paragraph.text,
            dossierPrecedentId,
            isHypothesis: false,
          };
        }

        return {
          text: paragraph.text,
          isHypothesis: paragraph.isHypothesis ?? true,
        };
      }),
    })),
  };
}
