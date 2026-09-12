import { auth } from "@clerk/nextjs/server";
import { cacheLife, cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCaseForOfficeSelect } from "@/server/case/get-case-for-office-select";
import {
  officeCaseCacheTag,
  officeCasesCacheTag,
} from "@/server/case/office-cache-tags";
import {
  isProductThemeName,
  OUTRO_THEME_MIN_LENGTH,
  PRODUCT_THEMES,
} from "@/lib/product-themes";
import { isSupportedTribunalSlug } from "@/lib/tribunals";
import type { AgentPort } from "@/server/agent/schemas";
import { liveCaseWhere } from "@/server/case/live-case-where";

export interface OfficeContext {
  clerkOrgId: string;
  clerkUserId: string;
}

export async function requireOfficeContext(): Promise<OfficeContext> {
  const session = await auth.protect();

  const clerkOrgId = session.orgId;
  if (!clerkOrgId) {
    redirect("/app/escritorio");
  }

  return {
    clerkOrgId,
    clerkUserId: session.userId,
  };
}

export { resolveAgentPort } from "@/server/agent/resolve-agent-port";

export interface CreateCaseInput {
  materialText: string;
  tribunal: string;
  judgeName?: string;
  organName?: string;
}

export async function createDraftCase(
  input: CreateCaseInput,
  office: OfficeContext,
  agentPort: AgentPort,
) {
  const materialText = input.materialText.trim();
  if (!materialText) {
    throw new Error("Material do Caso é obrigatório");
  }

  if (!isSupportedTribunalSlug(input.tribunal)) {
    throw new Error("Tribunal inválido");
  }

  const inference = await agentPort.inferThemeAndClaim({
    materialText,
    tribunal: input.tribunal,
    productThemeSlugs: PRODUCT_THEMES.map((theme) => theme.slug),
  });

  return prisma.legalCase.create({
    data: {
      clerkOrgId: office.clerkOrgId,
      clerkUserId: office.clerkUserId,
      materialText,
      tribunal: input.tribunal,
      judgeName: input.judgeName?.trim() || null,
      organName: input.organName?.trim() || null,
      status: "draft",
      inferredThemeSlug: inference.themeSlug,
      inferredClaim: inference.claim,
    },
  });
}

export async function confirmCaseTheme(
  legalCaseId: string,
  office: OfficeContext,
  input: {
    themeSlug?: string;
    outroName?: string;
    claim: string;
  },
) {
  const legalCase = await prisma.legalCase.findFirst({
    where: liveCaseWhere(office.clerkOrgId, legalCaseId),
  });

  if (!legalCase) {
    throw new Error("Caso não encontrado");
  }

  const claim = input.claim.trim();
  if (!claim) {
    throw new Error("Pedido é obrigatório");
  }

  let themeId: string;

  if (input.outroName) {
    const name = input.outroName.trim();
    if (name.length < OUTRO_THEME_MIN_LENGTH) {
      throw new Error("Nome Outro muito curto");
    }

    if (isProductThemeName(name)) {
      throw new Error("Nome Outro não pode repetir um Tema de produto");
    }

    const slug = slugify(name);
    const theme = await prisma.theme.upsert({
      where: {
        slug_clerkOrgId: {
          slug,
          clerkOrgId: office.clerkOrgId,
        },
      },
      create: {
        slug,
        name,
        kind: "outro",
        clerkOrgId: office.clerkOrgId,
      },
      update: {},
    });

    themeId = theme.id;
  } else {
    const slug = input.themeSlug ?? legalCase.inferredThemeSlug;
    if (!slug) {
      throw new Error("Tema é obrigatório");
    }

    const productTheme = PRODUCT_THEMES.find((theme) => theme.slug === slug);
    if (!productTheme) {
      throw new Error("Tema de produto inválido");
    }

    const existingTheme = await prisma.theme.findFirst({
      where: {
        slug: productTheme.slug,
        clerkOrgId: null,
      },
    });

    const theme =
      existingTheme ??
      (await prisma.theme.create({
        data: {
          slug: productTheme.slug,
          name: productTheme.name,
          kind: "product",
        },
      }));

    themeId = theme.id;
  }

  return prisma.legalCase.update({
    where: { id: legalCase.id },
    data: {
      themeId,
      claim,
      status: "confirmed",
    },
    include: { theme: true },
  });
}

export async function getCaseForOffice(
  legalCaseId: string,
  clerkOrgId: string,
) {
  "use cache";
  cacheLife("minutes");
  cacheTag(officeCasesCacheTag(clerkOrgId));
  cacheTag(officeCaseCacheTag(clerkOrgId, legalCaseId));

  return prisma.legalCase.findFirst({
    where: liveCaseWhere(clerkOrgId, legalCaseId),
    select: getCaseForOfficeSelect,
  });
}

/**
 * Uncached job statuses so the office UI can show live generation steps.
 */
export async function getCaseGenerationStatusForOffice(
  legalCaseId: string,
  clerkOrgId: string,
): Promise<{
  dossierJobStatus: string | null;
  petitionJobStatus: string | null;
} | null> {
  return prisma.legalCase.findFirst({
    where: liveCaseWhere(clerkOrgId, legalCaseId),
    select: {
      dossierJobStatus: true,
      petitionJobStatus: true,
    },
  });
}

export async function listCasesForOffice(clerkOrgId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(officeCasesCacheTag(clerkOrgId));

  return prisma.legalCase.findMany({
    where: liveCaseWhere(clerkOrgId),
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      status: true,
      tribunal: true,
      judgeName: true,
      updatedAt: true,
      currentDossierId: true,
      dossierJobStatus: true,
      petitionJobStatus: true,
      theme: {
        select: { name: true },
      },
      currentPetition: {
        select: { status: true },
      },
    },
  });
}

export async function listOutroThemesForOffice(clerkOrgId: string) {
  return prisma.theme.findMany({
    where: { clerkOrgId, kind: "outro" },
    orderBy: { name: "asc" },
  });
}

export async function hideCaseForOffice(
  legalCaseId: string,
  office: OfficeContext,
) {
  const legalCase = await prisma.legalCase.findFirst({
    where: liveCaseWhere(office.clerkOrgId, legalCaseId),
  });

  if (!legalCase) {
    throw new Error("Caso não encontrado");
  }

  return prisma.legalCase.update({
    where: { id: legalCase.id },
    data: { deletedAt: new Date() },
  });
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
