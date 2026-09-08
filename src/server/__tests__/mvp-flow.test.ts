import { describe, expect, it, vi } from "vitest";
import type { Judgment } from "@prisma/client";
import { createFakeAgentPort } from "@/server/agent/fake-agent-port";
import {
  validateDossierDraft,
  validatePetitionDraft,
} from "@/server/validators/citation-validator";
import { shouldTriggerIngest } from "@/server/coverage/coverage-rules";
import { ingestOnCoverageMiss } from "@/server/coverage/ingest-jurisprudencias";
import { createDraftCase } from "@/server/case/case-service";
import {
  isProductThemeName,
  OUTRO_THEME_MIN_LENGTH,
} from "@/lib/product-themes";
import {
  readCursorApiKey,
  readJurisprudenciasApiKey,
} from "@/lib/env";

describe("coverage threshold", () => {
  it("triggers ingest below five matches", () => {
    expect(shouldTriggerIngest(4)).toBe(true);
    expect(shouldTriggerIngest(5)).toBe(false);
  });
});

describe("citation validator", () => {
  const judgment: Judgment = {
    id: "j1",
    tribunal: "tjsp",
    organ: "10ª Câmara",
    rapporteur: "Des. Maria",
    caseNumber: "1000-23.2024.8.26.0100",
    judgmentDate: new Date("2024-01-01"),
    result: "Procedente",
    holding: null,
    ementa: "Dano moral em relação de consumo confirmado.",
    grounds: null,
    operativePart: null,
    rawText: "Dano moral em relação de consumo confirmado.",
    source: "seed",
    externalId: null,
    sourceUrl: null,
    fetchedAt: null,
    contentHash: "hash",
    ingestionStatus: "structured",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("rejects unknown judgment ids from a lying agent", () => {
    const validated = validateDossierDraft(
      {
        patternSummary: "Padrão",
        organPatternLabel: "TJSP",
        precedents: [
          {
            judgmentId: "fake-id",
            stance: "supporting",
            excerpt: "Dano moral",
          },
        ],
      },
      [judgment],
    );

    expect(validated.precedents).toHaveLength(0);
  });

  it("strips invented case numbers from petition text", () => {
    const validated = validatePetitionDraft(
      {
        sections: [
          {
            key: "law",
            title: "Do direito",
            paragraphs: [
              {
                text: "Conforme o acórdão 9999999-99.2024.8.26.0100, procede o pedido.",
              },
            ],
          },
        ],
      },
      new Set(["1000-23.2024.8.26.0100"]),
      new Map(),
    );

    expect(validated.sections[0]?.paragraphs[0]?.isHypothesis).toBe(true);
  });
});

describe("outro theme rules", () => {
  it("blocks product theme names", () => {
    expect(isProductThemeName("dano moral em relação de consumo")).toBe(true);
  });

  it("requires minimum length", () => {
    expect(OUTRO_THEME_MIN_LENGTH).toBeGreaterThanOrEqual(8);
  });
});

describe("fake agent port", () => {
  it("returns infer JSON without Cursor key", async () => {
    const port = createFakeAgentPort();
    const result = await port.inferThemeAndClaim({
      materialText: "Consumidor cobrou indenização por dano moral.",
      tribunal: "tjsp",
      productThemeSlugs: ["dano-moral-relacao-consumo"],
    });

    expect(result.themeSlug).toBeTruthy();
    expect(result.claim).toBeTruthy();
  });
});

describe("ingest trigger contract", () => {
  it("documents that >= 5 skips API at service layer", () => {
    const count = vi.fn(() => 6);
    expect(shouldTriggerIngest(count())).toBe(false);
  });
});

describe("intake validation", () => {
  const office = {
    clerkOrgId: "org_test",
    clerkUserId: "user_test",
  };
  const agentPort = createFakeAgentPort();

  it("rejects missing material before inserting a case", async () => {
    await expect(
      createDraftCase(
        { materialText: "   ", tribunal: "tjsp" },
        office,
        agentPort,
      ),
    ).rejects.toThrow("Material do Caso é obrigatório");
  });

  it("rejects a tribunal outside the supported list", async () => {
    await expect(
      createDraftCase(
        { materialText: "Fatos do cliente consumidor.", tribunal: "xyz" },
        office,
        agentPort,
      ),
    ).rejects.toThrow("Tribunal inválido");
  });
});

describe("coverage ingest failure", () => {
  it("returns failed without throwing when the API client errors", async () => {
    const result = await ingestOnCoverageMiss(
      {
        themeId: "theme-1",
        tribunal: "tjsp",
        query: "dano moral",
      },
      {
        search: async () => {
          throw new Error("jurisprudencias down");
        },
      },
    );

    expect(result.failed).toBe(true);
    expect(result.inserted).toBe(0);
  });
});

describe("product keys", () => {
  it("exposes readers for Cursor and Jurisprudências.ai keys", () => {
    expect(typeof readCursorApiKey()).toBe("string");
    expect(typeof readJurisprudenciasApiKey()).toBe("string");
  });
});
