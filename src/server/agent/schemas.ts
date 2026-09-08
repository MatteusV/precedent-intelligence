import { z } from "zod";

export const inferResultSchema = z.object({
  themeSlug: z.string().min(1),
  claim: z.string().min(1),
});

export const dossierPrecedentDraftSchema = z.object({
  judgmentId: z.string().min(1),
  stance: z.enum(["supporting", "opposing", "dissent"]),
  excerpt: z.string().min(1),
});

export const dossierDraftSchema = z.object({
  patternSummary: z.string().min(1),
  organPatternLabel: z.string().min(1),
  coverageNote: z.string().optional(),
  precedents: z.array(dossierPrecedentDraftSchema),
});

export const petitionSectionDraftSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  paragraphs: z.array(
    z.object({
      text: z.string().min(1),
      judgmentId: z.string().optional(),
      isHypothesis: z.boolean().optional(),
    }),
  ),
});

export const petitionDraftSchema = z.object({
  sections: z.array(petitionSectionDraftSchema).min(1),
});

export type InferResult = z.infer<typeof inferResultSchema>;
export type DossierDraft = z.infer<typeof dossierDraftSchema>;
export type PetitionDraft = z.infer<typeof petitionDraftSchema>;

export interface InferInput {
  materialText: string;
  tribunal: string;
  productThemeSlugs: readonly string[];
}

export interface DossierPromptInput {
  materialText: string;
  claim: string;
  themeName: string;
  tribunal: string;
  judgeName?: string | null;
  organName?: string | null;
  judgments: readonly {
    id: string;
    caseNumber: string | null;
    rapporteur: string | null;
    organ: string | null;
    result: string | null;
    ementa: string | null;
    rawText: string;
  }[];
}

export interface PetitionPromptInput {
  materialText: string;
  claim: string;
  themeName: string;
  tribunal: string;
  patternSummary: string;
  precedents: readonly {
    id: string;
    judgmentId: string;
    caseNumber: string | null;
    stance: string;
    excerpt: string;
  }[];
}

export interface AgentPort {
  inferThemeAndClaim(input: InferInput): Promise<InferResult>;
  draftDossier(input: DossierPromptInput): Promise<DossierDraft>;
  draftPetition(input: PetitionPromptInput): Promise<PetitionDraft>;
}
