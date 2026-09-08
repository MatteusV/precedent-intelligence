import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCaseForOfficeSelect } from "@/server/case/get-case-for-office-select";
import { getCaseForOffice, listCasesForOffice } from "@/server/case/case-service";
import { liveCaseWhere } from "@/server/case/live-case-where";

const { findFirst, findMany, cacheLife, cacheTag } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  findMany: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  cacheLife,
  cacheTag,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    legalCase: {
      findFirst,
      findMany,
    },
  },
}));

describe("office case reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findFirst.mockResolvedValue(null);
    findMany.mockResolvedValue([]);
  });

  it("scopes getCaseForOffice to the escritório and slim select", async () => {
    await getCaseForOffice("case_1", "org_a");

    expect(findFirst).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a", "case_1"),
      select: getCaseForOfficeSelect,
    });
  });

  it("does not return another escritório's case from the database query", async () => {
    findFirst.mockResolvedValueOnce({
      id: "case_1",
      clerkOrgId: "org_b",
      materialText: "secret",
    });

    await getCaseForOffice("case_1", "org_a");

    expect(findFirst).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a", "case_1"),
      select: getCaseForOfficeSelect,
    });
  });

  it("scopes listCasesForOffice to the escritório live predicate", async () => {
    await listCasesForOffice("org_a");

    expect(findMany).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a"),
      orderBy: { updatedAt: "desc" },
      select: expect.objectContaining({
        id: true,
        theme: { select: { name: true } },
        currentPetition: { select: { status: true } },
      }),
    });
  });

  it("does not list another escritório's cases", async () => {
    findMany.mockResolvedValueOnce([
      {
        id: "case_b",
        status: "confirmed",
        tribunal: "tjsp",
        updatedAt: new Date(),
        currentDossierId: null,
        dossierJobStatus: null,
        theme: { name: "Outro escritório" },
        currentPetition: null,
      },
    ]);

    await listCasesForOffice("org_a");

    expect(findMany).toHaveBeenCalledWith({
      where: liveCaseWhere("org_a"),
      orderBy: { updatedAt: "desc" },
      select: expect.any(Object),
    });
  });
});
