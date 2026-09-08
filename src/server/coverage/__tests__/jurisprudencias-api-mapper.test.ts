import { describe, expect, it } from "vitest";
import {
  mapDecisionToPayload,
  mapSearchResponseToPayloads,
  parseJudgmentDate,
} from "@/server/coverage/jurisprudencias-api-mapper";

describe("jurisprudencias-api-mapper", () => {
  it("parses Brazilian trial dates", () => {
    expect(parseJudgmentDate("31/10/2024", "2024-10-31")).toEqual(
      new Date(2024, 9, 31),
    );
  });

  it("falls back to publication date when trial date is missing", () => {
    expect(parseJudgmentDate(undefined, "2024-10-31")).toEqual(
      new Date("2024-10-31"),
    );
  });

  it("maps API decisions into persisted judgment payloads", () => {
    const payload = mapDecisionToPayload(
      {
        process_number: "0817508-04.2022.8.19.0210",
        process_type: "APELAÇÃO",
        rapporteur: "Des(a). RENATO LIMA CHARNAUX SERTA",
        adjudicating_body: "DECIMA QUARTA CAMARA DE DIREITO PRIVADO",
        publication_date: "2024-10-31",
        trial_date: "31/10/2024",
        excerpt: "APELAÇÃO CÍVEL. RELAÇÃO DE CONSUMO.",
        url: "https://example.com/decision",
      },
      "tjrj",
    );

    expect(payload).toEqual({
      tribunal: "tjrj",
      organ: "DECIMA QUARTA CAMARA DE DIREITO PRIVADO",
      rapporteur: "Des(a). RENATO LIMA CHARNAUX SERTA",
      caseNumber: "0817508-04.2022.8.19.0210",
      judgmentDate: new Date(2024, 9, 31),
      result: "APELAÇÃO",
      holding: "APELAÇÃO CÍVEL. RELAÇÃO DE CONSUMO.",
      ementa: "APELAÇÃO CÍVEL. RELAÇÃO DE CONSUMO.",
      rawText: "APELAÇÃO CÍVEL. RELAÇÃO DE CONSUMO.",
      sourceUrl: "https://example.com/decision",
    });
  });

  it("drops decisions without excerpt or summary", () => {
    expect(
      mapDecisionToPayload(
        {
          process_number: "0000000-00.0000.8.19.0001",
        },
        "tjrj",
      ),
    ).toBeNull();
  });

  it("maps search responses and filters empty decisions", () => {
    const payloads = mapSearchResponseToPayloads(
      {
        data: [
          {
            process_number: "0000000-00.0000.8.19.0001",
            excerpt: "Dano moral em relação de consumo.",
          },
          {
            process_number: "0000000-00.0000.8.19.0002",
          },
        ],
      },
      "tjrj",
    );

    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.caseNumber).toBe("0000000-00.0000.8.19.0001");
  });
});
