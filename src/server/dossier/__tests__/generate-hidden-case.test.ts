import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeAgentPort } from "@/server/agent/fake-agent-port";
import { liveCaseWhere } from "@/server/case/live-case-where";
import {
  generateDossierForCase,
  generatePetitionForCase,
} from "@/server/dossier/generate-dossier";

const { findFirst, update } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    legalCase: {
      findFirst,
      update,
    },
    $transaction: vi.fn(),
  },
}));

describe("generate on hidden cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not start dossier generation when the case is hidden", async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      generateDossierForCase("case_hidden", "org_a", createFakeAgentPort()),
    ).rejects.toThrow("Caso não confirmado para geração de dossiê");

    expect(findFirst).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a", "case_hidden"),
      include: { theme: true },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("does not start petition generation when the case is hidden", async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      generatePetitionForCase("case_hidden", "org_a", createFakeAgentPort()),
    ).rejects.toThrow("Caso sem dossiê atual para gerar petição");

    expect(findFirst).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a", "case_hidden"),
      include: {
        theme: true,
        currentDossier: {
          include: {
            precedents: {
              include: { judgment: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });
    expect(update).not.toHaveBeenCalled();
  });
});
