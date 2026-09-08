"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  confirmCaseTheme,
  createDraftCase,
  requireOfficeContext,
  resolveAgentPort,
} from "@/server/case/case-service";
import {
  generateDossierForCase,
  generatePetitionForCase,
} from "@/server/dossier/generate-dossier";

export async function createCaseAction(formData: FormData): Promise<void> {
  const office = await requireOfficeContext();
  const agentPort = await resolveAgentPort();

  const legalCase = await createDraftCase(
    {
      materialText: String(formData.get("materialText") ?? ""),
      tribunal: String(formData.get("tribunal") ?? ""),
      judgeName: String(formData.get("judgeName") ?? "") || undefined,
      organName: String(formData.get("organName") ?? "") || undefined,
    },
    office,
    agentPort,
  );

  redirect(`/app/casos/${legalCase.id}/confirmar`);
}

export async function confirmCaseAction(formData: FormData): Promise<void> {
  const office = await requireOfficeContext();
  const legalCaseId = String(formData.get("legalCaseId") ?? "");

  await confirmCaseTheme(
    legalCaseId,
    office,
    {
      themeSlug: String(formData.get("themeSlug") ?? "") || undefined,
      outroName: String(formData.get("outroName") ?? "") || undefined,
      claim: String(formData.get("claim") ?? ""),
    },
  );

  revalidatePath(`/app/casos/${legalCaseId}`);
  redirect(`/app/casos/${legalCaseId}`);
}

export async function generateDossierAction(formData: FormData): Promise<void> {
  const office = await requireOfficeContext();
  const legalCaseId = String(formData.get("legalCaseId") ?? "");
  const agentPort = await resolveAgentPort();

  await generateDossierForCase(legalCaseId, office.clerkOrgId, agentPort);
  revalidatePath(`/app/casos/${legalCaseId}`);
  redirect(`/app/casos/${legalCaseId}`);
}

export async function generatePetitionAction(formData: FormData): Promise<void> {
  const office = await requireOfficeContext();
  const legalCaseId = String(formData.get("legalCaseId") ?? "");
  const agentPort = await resolveAgentPort();

  await generatePetitionForCase(legalCaseId, office.clerkOrgId, agentPort);
  revalidatePath(`/app/casos/${legalCaseId}`);
  redirect(`/app/casos/${legalCaseId}`);
}
