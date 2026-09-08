import type { ExternalJudgmentPayload } from "./ingest-jurisprudencias";

export const JURISPRUDENCIAS_API_BASE_URL =
  "https://jurisprudencias.ai/api/v1";

export const JURISPRUDENCIAS_SEARCH_MAX_RESULTS = 20;

export interface JurisprudenciasDecision {
  readonly process_number?: string;
  readonly process_type?: string;
  readonly rapporteur?: string;
  readonly adjudicating_body?: string;
  readonly publication_date?: string;
  readonly trial_date?: string;
  readonly excerpt?: string;
  readonly summary?: string;
  readonly url?: string;
}

export interface JurisprudenciasSearchResponse {
  readonly data?: readonly JurisprudenciasDecision[];
  readonly meta?: {
    readonly page?: number;
    readonly per_page?: number;
    readonly has_next_page?: boolean;
  };
}

export function parseJudgmentDate(
  trialDate?: string,
  publicationDate?: string,
): Date | null {
  if (trialDate) {
    const brazilianDateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trialDate);
    if (brazilianDateMatch) {
      const [, day, month, year] = brazilianDateMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }

    const parsedTrialDate = new Date(trialDate);
    if (!Number.isNaN(parsedTrialDate.getTime())) {
      return parsedTrialDate;
    }
  }

  if (publicationDate) {
    const parsedPublicationDate = new Date(publicationDate);
    if (!Number.isNaN(parsedPublicationDate.getTime())) {
      return parsedPublicationDate;
    }
  }

  return null;
}

export function mapDecisionToPayload(
  decision: JurisprudenciasDecision,
  tribunal: string,
): ExternalJudgmentPayload | null {
  const rawText = decision.summary ?? decision.excerpt;
  if (!rawText) {
    return null;
  }

  return {
    tribunal,
    organ: decision.adjudicating_body ?? null,
    rapporteur: decision.rapporteur ?? null,
    caseNumber: decision.process_number ?? null,
    judgmentDate: parseJudgmentDate(
      decision.trial_date,
      decision.publication_date,
    ),
    result: decision.process_type ?? null,
    holding: decision.excerpt ?? null,
    ementa: decision.excerpt ?? decision.summary ?? null,
    rawText,
    sourceUrl: decision.url ?? null,
  };
}

export function mapSearchResponseToPayloads(
  response: JurisprudenciasSearchResponse,
  tribunal: string,
): ExternalJudgmentPayload[] {
  const decisions = response.data ?? [];

  return decisions
    .map((decision) => mapDecisionToPayload(decision, tribunal))
    .filter((payload): payload is ExternalJudgmentPayload => payload !== null);
}
