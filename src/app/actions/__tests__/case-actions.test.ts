import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  officeCaseCacheTag,
  officeCasesCacheTag,
} from "@/server/case/office-cache-tags";

const {
  updateTag,
  revalidatePath,
  redirect,
  requireOfficeContext,
  createDraftCase,
  confirmCaseTheme,
  hideCaseForOffice,
  generateDossierForCase,
  generatePetitionForCase,
  resolveAgentPort,
} = vi.hoisted(() => ({
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
  requireOfficeContext: vi.fn(),
  createDraftCase: vi.fn(),
  confirmCaseTheme: vi.fn(),
  hideCaseForOffice: vi.fn(),
  generateDossierForCase: vi.fn(),
  generatePetitionForCase: vi.fn(),
  resolveAgentPort: vi.fn(),
}));

vi.mock("next/cache", () => ({
  updateTag,
  revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/server/case/case-service", () => ({
  requireOfficeContext,
  createDraftCase,
  confirmCaseTheme,
  hideCaseForOffice,
  resolveAgentPort,
}));

vi.mock("@/server/dossier/generate-dossier", () => ({
  generateDossierForCase,
  generatePetitionForCase,
}));

import {
  confirmCaseAction,
  createCaseAction,
  generateDossierAction,
  generatePetitionAction,
  hideCaseAction,
} from "@/app/actions/case-actions";

const office = { clerkOrgId: "org_a", clerkUserId: "user_1" };

describe("case-actions cache invalidation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireOfficeContext.mockResolvedValue(office);
    resolveAgentPort.mockResolvedValue({});
    createDraftCase.mockResolvedValue({ id: "case_new" });
    confirmCaseTheme.mockResolvedValue({});
    generateDossierForCase.mockResolvedValue({});
    generatePetitionForCase.mockResolvedValue("petition_1");
    hideCaseForOffice.mockResolvedValue({});
  });

  it("invalidates the pauta and new case after create", async () => {
    const formData = new FormData();
    formData.set("materialText", "Fatos");
    formData.set("tribunal", "tjsp");

    await createCaseAction(formData);

    expect(updateTag).toHaveBeenCalledWith(officeCasesCacheTag("org_a"));
    expect(updateTag).toHaveBeenCalledWith(officeCaseCacheTag("org_a", "case_new"));
    expect(redirect).toHaveBeenCalledWith("/app/casos/case_new/confirmar");
  });

  it("invalidates list and case after confirm", async () => {
    const formData = new FormData();
    formData.set("legalCaseId", "case_1");
    formData.set("claim", "Pedido");

    await confirmCaseAction(formData);

    expect(updateTag).toHaveBeenCalledWith(officeCasesCacheTag("org_a"));
    expect(updateTag).toHaveBeenCalledWith(officeCaseCacheTag("org_a", "case_1"));
  });

  it("invalidates list and case after dossier generation", async () => {
    const formData = new FormData();
    formData.set("legalCaseId", "case_1");

    await generateDossierAction(formData);

    expect(updateTag).toHaveBeenCalledWith(officeCasesCacheTag("org_a"));
    expect(updateTag).toHaveBeenCalledWith(officeCaseCacheTag("org_a", "case_1"));
  });

  it("invalidates list and case after petition generation", async () => {
    const formData = new FormData();
    formData.set("legalCaseId", "case_1");

    await generatePetitionAction(formData);

    expect(updateTag).toHaveBeenCalledWith(officeCasesCacheTag("org_a"));
    expect(updateTag).toHaveBeenCalledWith(officeCaseCacheTag("org_a", "case_1"));
  });

  it("invalidates list and case after hide", async () => {
    const formData = new FormData();
    formData.set("legalCaseId", "case_1");

    await hideCaseAction(formData);

    expect(updateTag).toHaveBeenCalledWith(officeCasesCacheTag("org_a"));
    expect(updateTag).toHaveBeenCalledWith(officeCaseCacheTag("org_a", "case_1"));
  });

  it("requires office context before every mutation", async () => {
    const formData = new FormData();
    formData.set("legalCaseId", "case_1");

    await hideCaseAction(formData);

    expect(requireOfficeContext).toHaveBeenCalled();
  });
});
