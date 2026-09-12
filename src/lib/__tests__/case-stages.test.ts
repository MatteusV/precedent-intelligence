import { describe, expect, it } from "vitest";
import {
  getCaseNextAction,
  getCaseStages,
  getCurrentStageId,
  getNewCaseStages,
  isDossierJobInFlight,
  overlayLiveStages,
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
      isGeneratingPetition: false,
    });

    expect(getCurrentStageId({
      status: "draft",
      hasDossier: false,
      hasCurrentPetition: false,
      isGeneratingDossier: false,
      isGeneratingPetition: false,
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
      isGeneratingPetition: false,
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
      isGeneratingPetition: false,
      dossierJobStatus: "analyzing",
    });

    expect(stages.find((stage) => stage.id === "dossier")).toMatchObject({
      state: "current",
      isBusy: true,
      note: "Analisando o padrão",
    });
  });

  it("keeps a drafting petition on the petition stage", () => {
    const stages = getCaseStages({
      status: "confirmed",
      hasDossier: true,
      hasCurrentPetition: false,
      isGeneratingDossier: false,
      isGeneratingPetition: true,
      petitionJobStatus: "drafting",
    });

    expect(stages.find((stage) => stage.id === "petition")).toMatchObject({
      state: "current",
      isBusy: true,
      note: "Redigindo a peça",
    });
    expect(getCaseNextAction("c1", stages)).toEqual({
      stageId: "petition",
      label: "Redigindo a peça",
      href: "/app/casos/c1#peticao",
      isBusy: true,
    });
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
      isGeneratingPetition: false,
      dossierJobStatus: null,
      petitionJobStatus: null,
    });
  });
});

describe("overlayLiveStages", () => {
  it("marks the dossier stage busy from a live poll", () => {
    const stages = getCaseStages({
      status: "confirmed",
      hasDossier: false,
      hasCurrentPetition: false,
      isGeneratingDossier: false,
      isGeneratingPetition: false,
    });

    expect(
      overlayLiveStages(stages, {
        isDossierBusy: true,
        isPetitionBusy: false,
        dossierJobStatus: "ingesting",
        petitionJobStatus: null,
      }).find((stage) => stage.id === "dossier"),
    ).toMatchObject({
      state: "current",
      isBusy: true,
      note: "Conferindo cobertura",
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
      isGeneratingPetition: false,
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
