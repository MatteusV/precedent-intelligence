import { describe, expect, it } from "vitest";
import {
  getDossierJobSteps,
  getJobStatusLabel,
  getPetitionJobSteps,
  isGenerationJobInFlight,
} from "@/lib/generation-jobs";

describe("isGenerationJobInFlight", () => {
  it("treats drafting as in flight", () => {
    expect(isGenerationJobInFlight("drafting")).toBe(true);
  });

  it("treats completed and failed as settled", () => {
    expect(isGenerationJobInFlight("completed")).toBe(false);
    expect(isGenerationJobInFlight("failed")).toBe(false);
  });
});

describe("getDossierJobSteps", () => {
  it("marks retrieving current and later steps upcoming", () => {
    const steps = getDossierJobSteps("retrieving");

    expect(steps.map((step) => `${step.id}:${step.state}`)).toEqual([
      "pending:complete",
      "retrieving:current",
      "ingesting:upcoming",
      "analyzing:upcoming",
    ]);
  });

  it("keeps coverage as complete when analysis starts", () => {
    const steps = getDossierJobSteps("analyzing");

    expect(steps.map((step) => `${step.id}:${step.state}`)).toEqual([
      "pending:complete",
      "retrieving:complete",
      "ingesting:complete",
      "analyzing:current",
    ]);
  });

  it("marks the last known step as failed", () => {
    const steps = getDossierJobSteps("ingesting", { isFailed: true });

    expect(steps.find((step) => step.id === "ingesting")?.state).toBe("failed");
    expect(steps.find((step) => step.id === "analyzing")?.state).toBe("upcoming");
  });
});

describe("getPetitionJobSteps", () => {
  it("starts on pending when status is empty", () => {
    expect(getPetitionJobSteps(null)[0]).toMatchObject({
      id: "pending",
      state: "current",
    });
  });

  it("marks drafting current", () => {
    expect(
      getPetitionJobSteps("drafting").map((step) => `${step.id}:${step.state}`),
    ).toEqual(["pending:complete", "drafting:current", "anchoring:upcoming"]);
  });
});

describe("getJobStatusLabel", () => {
  it("uses the step label for a live status", () => {
    expect(getJobStatusLabel("dossier", "analyzing")).toBe("Analisando o padrão");
    expect(getJobStatusLabel("petition", "anchoring")).toBe("Ancorando citações");
  });
});
