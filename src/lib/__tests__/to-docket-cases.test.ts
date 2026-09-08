import { describe, expect, it } from "vitest";
import { toDocketCases } from "@/lib/to-docket-cases";

describe("toDocketCases", () => {
  it("labels unconfirmed cases and maps tribunal slugs", () => {
    const [docketCase] = toDocketCases([
      {
        id: "c1",
        status: "draft",
        tribunal: "tjsp",
        updatedAt: new Date("2026-09-07T12:00:00Z"),
        currentDossierId: null,
        dossierJobStatus: null,
        theme: null,
        currentPetition: null,
      },
    ]);

    expect(docketCase.title).toBe("Aguardando confirmação de tema");
    expect(docketCase.tribunalLabel).toBe("TJSP");
    expect(docketCase.stages.map((stage) => stage.state)).toEqual([
      "complete",
      "current",
      "upcoming",
      "upcoming",
    ]);
  });
});
