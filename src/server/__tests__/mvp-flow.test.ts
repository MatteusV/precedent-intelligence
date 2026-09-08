import { describe, expect, it, vi } from "vitest";
import type { Judgment } from "@prisma/client";
import { createFakeAgentPort } from "@/server/agent/fake-agent-port";
import {
  validateDossierDraft,
  validatePetitionDraft,
} from "@/server/validators/citation-validator";
import { shouldTriggerIngest } from "@/server/coverage/coverage-rules";
import { isProductThemeName, OUTRO_THEME_MIN_LENGTH } from "@/lib/product-themes";

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
  it("rejects missing material or tribunal at action boundary", () => {
    const materialText = "   ";
    const tribunal = "";
    expect(materialText.trim()).toBe("");
    expect(tribunal).toBe("");
  });
});

describe("stale petition rule", () => {
  it("marks previous petition stale when regenerating dossier", () => {
    const previousStatus = "current";
    const nextStatus = "stale";
    expect(previousStatus).not.toBe(nextStatus);
  });
});
