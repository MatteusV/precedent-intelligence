import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmCaseTheme } from "@/server/case/case-service";
import { liveCaseWhere } from "@/server/case/live-case-where";

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
    theme: {
      findFirst: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

const office = { clerkOrgId: "org_a", clerkUserId: "user_1" };

describe("confirmCaseTheme on hidden cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not confirm when the case is hidden", async () => {
    findFirst.mockResolvedValue(null);

    await expect(
      confirmCaseTheme("case_hidden", office, {
        themeSlug: "dano-moral-relacao-consumo",
        claim: "Indenização por dano moral.",
      }),
    ).rejects.toThrow("Caso não encontrado");

    expect(findFirst).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a", "case_hidden"),
    });
    expect(update).not.toHaveBeenCalled();
  });
});
