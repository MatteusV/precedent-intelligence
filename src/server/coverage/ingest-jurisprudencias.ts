import type { JudgmentSource } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeContentHash } from "@/lib/content-hash";
import { readJurisprudenciasApiKey } from "@/lib/env";
import type { CandidateFilters } from "./retrieve-candidates";
import {
  JURISPRUDENCIAS_API_BASE_URL,
  JURISPRUDENCIAS_SEARCH_MAX_RESULTS,
  mapSearchResponseToPayloads,
  type JurisprudenciasSearchResponse,
} from "./jurisprudencias-api-mapper";

export interface ExternalJudgmentPayload {
  tribunal: string;
  organ?: string | null;
  rapporteur?: string | null;
  caseNumber?: string | null;
  judgmentDate?: Date | null;
  result?: string | null;
  holding?: string | null;
  ementa?: string | null;
  grounds?: string | null;
  operativePart?: string | null;
  rawText: string;
  externalId?: string | null;
  sourceUrl?: string | null;
}

export interface JurisprudenciasClient {
  search(filters: CandidateFilters & { query: string }): Promise<ExternalJudgmentPayload[]>;
}

export class JurisprudenciasApiClient implements JurisprudenciasClient {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(
    filters: CandidateFilters & { query: string },
  ): Promise<ExternalJudgmentPayload[]> {
    const url = new URL(
      `${JURISPRUDENCIAS_API_BASE_URL}/courts/${filters.tribunal}/decisions`,
    );
    url.searchParams.set("q", filters.query);
    url.searchParams.set("page", "0");
    url.searchParams.set("sort_by", "trial_date");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Jurisprudências.ai request failed: ${response.status}`);
    }

    const payload = (await response.json()) as JurisprudenciasSearchResponse;

    return mapSearchResponseToPayloads(payload, filters.tribunal).slice(
      0,
      JURISPRUDENCIAS_SEARCH_MAX_RESULTS,
    );
  }
}

export function createJurisprudenciasClient(): JurisprudenciasClient {
  const apiKey = readJurisprudenciasApiKey();
  if (!apiKey) {
    throw new Error("JURISPRUDENCIAS_API_KEY is not configured");
  }

  return new JurisprudenciasApiClient(apiKey);
}

export async function upsertJudgmentsFromApi(
  payloads: ExternalJudgmentPayload[],
  themeId: string,
  source: JudgmentSource = "jurisprudencias_api",
): Promise<number> {
  let inserted = 0;

  for (const payload of payloads) {
    const contentHash = computeContentHash(payload.rawText);

    const judgment = await prisma.judgment.upsert({
      where: { contentHash },
      create: {
        tribunal: payload.tribunal,
        organ: payload.organ,
        rapporteur: payload.rapporteur,
        caseNumber: payload.caseNumber,
        judgmentDate: payload.judgmentDate,
        result: payload.result,
        holding: payload.holding,
        ementa: payload.ementa,
        grounds: payload.grounds,
        operativePart: payload.operativePart,
        rawText: payload.rawText,
        source,
        externalId: payload.externalId,
        sourceUrl: payload.sourceUrl,
        fetchedAt: new Date(),
        contentHash,
      },
      update: {
        fetchedAt: new Date(),
      },
    });

    await prisma.judgmentTheme.upsert({
      where: {
        judgmentId_themeId: {
          judgmentId: judgment.id,
          themeId,
        },
      },
      create: {
        judgmentId: judgment.id,
        themeId,
      },
      update: {},
    });

    inserted += 1;
  }

  return inserted;
}

export interface IngestOnCoverageMissResult {
  readonly inserted: number;
  readonly failed: boolean;
  readonly failureReason?: string;
}

export function formatIngestFailureNote(
  failureReason?: string,
): string | undefined {
  if (!failureReason) {
    return undefined;
  }

  if (failureReason.includes("429")) {
    return "A busca na Jurisprudências.ai não foi concluída: limite diário de requisições atingido. Tente novamente após o reset do plano ou use outro tribunal com acervo local.";
  }

  if (failureReason.includes("401")) {
    return "A busca na Jurisprudências.ai não foi concluída: token de API inválido ou ausente.";
  }

  return "A busca na Jurisprudências.ai não foi concluída. O dossiê foi montado apenas com o acervo local.";
}

export async function ingestOnCoverageMiss(
  filters: CandidateFilters & { query: string },
  client: JurisprudenciasClient,
): Promise<IngestOnCoverageMissResult> {
  try {
    const results = await client.search(filters);
    const inserted = await upsertJudgmentsFromApi(results, filters.themeId);
    return { inserted, failed: false };
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : "Jurisprudências.ai request failed";

    return { inserted: 0, failed: true, failureReason };
  }
}
