import type { JudgmentSource } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeContentHash } from "@/lib/content-hash";
import { readJurisprudenciasApiKey } from "@/lib/env";
import type { CandidateFilters } from "./retrieve-candidates";

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
    const response = await fetch("https://api.jurisprudencias.ai/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tribunal: filters.tribunal,
        query: filters.query,
        judge: filters.judgeName ?? undefined,
        organ: filters.organName ?? undefined,
        limit: 20,
      }),
    });

    if (!response.ok) {
      throw new Error(`Jurisprudências.ai request failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      results?: ExternalJudgmentPayload[];
    };

    return payload.results ?? [];
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

export async function ingestOnCoverageMiss(
  filters: CandidateFilters & { query: string },
  client: JurisprudenciasClient,
): Promise<{ inserted: number; failed: boolean }> {
  try {
    const results = await client.search(filters);
    const inserted = await upsertJudgmentsFromApi(results, filters.themeId);
    return { inserted, failed: false };
  } catch {
    return { inserted: 0, failed: true };
  }
}
