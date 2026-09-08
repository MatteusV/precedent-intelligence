import { describe, expect, it } from "vitest";
import { getCaseForOfficeSelect } from "@/server/case/get-case-for-office-select";

describe("getCaseForOfficeSelect", () => {
  it("loads only the current snapshot fields for reopen", () => {
    expect(getCaseForOfficeSelect).toMatchObject({
      materialText: true,
      claim: true,
      currentDossier: {
        select: {
          precedents: {
            select: {
              judgment: {
                select: { caseNumber: true },
              },
            },
          },
        },
      },
      currentPetition: {
        select: {
          status: true,
          disclaimer: true,
          sections: true,
        },
      },
    });
  });

  it("does not request judgment rawText, anchors, or history", () => {
    const serialized = JSON.stringify(getCaseForOfficeSelect);

    expect(serialized).not.toContain("rawText");
    expect(serialized).not.toContain("anchors");
    expect(serialized).not.toContain("dossiers");
    expect(serialized).not.toContain("petitions");
  });
});
