import { describe, expect, it } from "vitest";
import {
  getCaseNextAction,
  getCaseStages,
  getCurrentStageId,
  getNewCaseStages,
  isDossierJobInFlight,
  toCaseStageInput,
} from "@/lib/case-stages";

describe("isDossierJobInFlight", () => {
  it("treats retrieving as in flight", () => {
    expect(isDossierJobInFlight("retrieving")).toBe(true);
  });

  it("treats completed and failed as settled", () => {
    expect(isDossierJobInFlight("completed")).toBe(false);
    expect(isDossierJobInFlight("failed")).toBe(false);
  });
});

describe("getCaseStages", () => {
  it("puts a draft on theme confirmation after material exists", () => {
    const stages = getCaseStages({
      status: "draft",
      hasDossier: false,
      hasCurrentPetition: false,
      isGeneratingDossier: false,
    });

    expect(getCurrentStageId({
      status: "draft",
      hasDossier: false,
      hasCurrentPetition: false,
      isGeneratingDossier: false,
    })).toBe("theme");
    expect(stages.map((stage) => stage.state)).toEqual([
      "complete",
      "current",
      "upcoming",
      "upcoming",
    ]);
  });

  it("puts a confirmed case without a dossier on dossier", () => {
    const stages = getCaseStages({
      status: "confirmed",
      hasDossier: false,
      hasCurrentPetition: false,
      isGeneratingDossier: false,
    });

    expect(stages.map((stage) => `${stage.id}:${stage.state}`)).toEqual([
      "material:complete",
      "theme:complete",
      "dossier:current",
      "petition:upcoming",
    ]);
  });

  it("keeps regenerating dossiers on the dossier stage", () => {
    const stages = getCaseStages({
      status: "confirmed",
      hasDossier: true,
      hasCurrentPetition: true,
      isGeneratingDossier: true,
    });

    expect(stages.find((stage) => stage.id === "dossier")?.state).toBe("current");
  });

  it("maps persisted fields onto stage input", () => {
    expect(
      toCaseStageInput({
        status: "confirmed",
        currentDossierId: "d1",
        currentPetition: { status: "stale" },
        dossierJobStatus: null,
      }),
    ).toEqual({
      status: "confirmed",
      hasDossier: true,
      hasCurrentPetition: false,
      isGeneratingDossier: false,
    });
  });
});

describe("getNewCaseStages", () => {
  it("starts on material", () => {
    expect(getNewCaseStages()[0]).toEqual({ id: "material", state: "current" });
  });
});

describe("getCaseNextAction", () => {
  it("marks a finished petition as complete with no current stage", () => {
    const input = {
      status: "confirmed" as const,
      hasDossier: true,
      hasCurrentPetition: true,
      isGeneratingDossier: false,
    };

    expect(getCurrentStageId(input)).toBeNull();
    expect(getCaseStages(input).map((stage) => `${stage.id}:${stage.state}`)).toEqual([
      "material:complete",
      "theme:complete",
      "dossier:complete",
      "petition:complete",
    ]);
    expect(getCaseNextAction("c1", getCaseStages(input))).toEqual({
      stageId: null,
      label: "Peça pronta",
      href: "/app/casos/c1#peticao",
    });
  });
});
