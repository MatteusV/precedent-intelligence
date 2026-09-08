import { beforeEach, describe, expect, it, vi } from "vitest";
import { hideCaseForOffice } from "@/server/case/case-service";
import { liveCaseWhere } from "@/server/case/live-case-where";

const { findFirst, update, themeDeleteMany, judgmentDeleteMany } = vi.hoisted(
  () => ({
    findFirst: vi.fn(),
    update: vi.fn(),
    themeDeleteMany: vi.fn(),
    judgmentDeleteMany: vi.fn(),
  }),
);

vi.mock("@/lib/db", () => ({
  prisma: {
    legalCase: {
      findFirst,
      update,
    },
    theme: {
      deleteMany: themeDeleteMany,
    },
    judgment: {
      deleteMany: judgmentDeleteMany,
    },
  },
}));

const office = { clerkOrgId: "org_a", clerkUserId: "user_1" };

describe("hideCaseForOffice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets deletedAt on a live case of the escritório", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-08T00:00:00.000Z"));
    const hiddenAt = new Date("2026-09-08T00:00:00.000Z");

    findFirst.mockResolvedValue({ id: "case_1", clerkOrgId: "org_a" });
    update.mockResolvedValue({ id: "case_1", deletedAt: hiddenAt });

    await hideCaseForOffice("case_1", office);

    expect(findFirst).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a", "case_1"),
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: "case_1" },
      data: { deletedAt: hiddenAt },
    });
    expect(themeDeleteMany).not.toHaveBeenCalled();
    expect(judgmentDeleteMany).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("rejects a case from another escritório", async () => {
    findFirst.mockResolvedValue(null);

    await expect(hideCaseForOffice("case_1", office)).rejects.toThrow(
      "Caso não encontrado",
    );
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an already-hidden case", async () => {
    findFirst.mockResolvedValue(null);

    await expect(hideCaseForOffice("case_hidden", office)).rejects.toThrow(
      "Caso não encontrado",
    );
    expect(update).not.toHaveBeenCalled();
  });
});
