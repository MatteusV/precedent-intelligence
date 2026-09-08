import { config } from "dotenv";
import { resolve } from "node:path";
import { createFakeAgentPort } from "../src/server/agent/fake-agent-port";
import {
  confirmCaseTheme,
  createDraftCase,
  getCaseForOffice,
  listOutroThemesForOffice,
} from "../src/server/case/case-service";
import {
  generateDossierForCase,
  generatePetitionForCase,
} from "../src/server/dossier/generate-dossier";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import {
  readCursorApiKey,
  readJurisprudenciasApiKey,
} from "../src/lib/env";
import { SEED_THEME_SLUG } from "../src/lib/product-themes";
import { SEED_TRIBUNAL_SLUG } from "../src/lib/tribunals";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const officeA = {
  clerkOrgId: "org_verify_mvp_a",
  clerkUserId: "user_verify_mvp_a",
} as const;

const officeB = {
  clerkOrgId: "org_verify_mvp_b",
  clerkUserId: "user_verify_mvp_b",
} as const;

const prisma = createPrismaClient();

async function cleanup(): Promise<void> {
  await prisma.legalCase.deleteMany({
    where: {
      clerkOrgId: { in: [officeA.clerkOrgId, officeB.clerkOrgId] },
    },
  });
  await prisma.theme.deleteMany({
    where: {
      clerkOrgId: { in: [officeA.clerkOrgId, officeB.clerkOrgId] },
      kind: "outro",
    },
  });
}

async function main(): Promise<void> {
  if (!readCursorApiKey() || !readJurisprudenciasApiKey()) {
    throw new Error("CURSOR_API_KEY and JURISPRUDENCIAS_API_KEY must be set");
  }

  const agentPort = createFakeAgentPort();
  await cleanup();

  try {
    await createDraftCase(
      { materialText: "   ", tribunal: SEED_TRIBUNAL_SLUG },
      officeA,
      agentPort,
    );
    throw new Error("Expected empty material to be rejected");
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("obrigatório")) {
      throw error;
    }
  }

  const draft = await createDraftCase(
    {
      materialText:
        "Cliente consumidor pagou por serviço não prestado e pede indenização por danos morais.",
      tribunal: SEED_TRIBUNAL_SLUG,
    },
    officeA,
    agentPort,
  );

  const confirmed = await confirmCaseTheme(draft.id, officeA, {
    themeSlug: SEED_THEME_SLUG,
    claim: "Condenação ao pagamento de indenização por danos morais.",
  });

  if (confirmed.status !== "confirmed") {
    throw new Error("Caso was not confirmed");
  }

  const dossier = await generateDossierForCase(
    confirmed.id,
    officeA.clerkOrgId,
    agentPort,
  );

  if (dossier.isEmpty) {
    throw new Error("Seeded Tema+Tribunal should produce a non-empty Dossiê");
  }

  const petitionId = await generatePetitionForCase(
    confirmed.id,
    officeA.clerkOrgId,
    agentPort,
  );

  const firstView = await getCaseForOffice(confirmed.id, officeA.clerkOrgId);
  if (!firstView?.currentPetition || firstView.currentPetition.id !== petitionId) {
    throw new Error("Petição atual was not attached to the Caso");
  }

  if (!firstView.currentPetition.disclaimer.includes("dossiê")) {
    throw new Error("Petição is missing the visible disclaimer");
  }

  const secondDossier = await generateDossierForCase(
    confirmed.id,
    officeA.clerkOrgId,
    agentPort,
  );

  if (secondDossier.dossierId === dossier.dossierId) {
    throw new Error("Second Dossiê must be a new snapshot");
  }

  const stalePetition = await prisma.petition.findUnique({
    where: { id: petitionId },
    select: { status: true },
  });
  if (stalePetition?.status !== "stale") {
    throw new Error("Previous Petição must be stale after a new Dossiê");
  }

  const leaked = await getCaseForOffice(confirmed.id, officeB.clerkOrgId);
  if (leaked) {
    throw new Error("Escritório B must not read Escritório A's Caso");
  }

  const outroDraft = await createDraftCase(
    {
      materialText: "Recorte próprio do escritório sobre falha de serviço digital.",
      tribunal: SEED_TRIBUNAL_SLUG,
    },
    officeA,
    agentPort,
  );

  await confirmCaseTheme(outroDraft.id, officeA, {
    outroName: "falha digital em marketplace",
    claim: "Reparação por falha na prestação de serviço digital.",
  });

  const outrosA = await listOutroThemesForOffice(officeA.clerkOrgId);
  const outrosB = await listOutroThemesForOffice(officeB.clerkOrgId);
  if (!outrosA.some((theme) => theme.name === "falha digital em marketplace")) {
    throw new Error("Escritório A should see its Outro Tema");
  }
  if (outrosB.length > 0) {
    throw new Error("Escritório B must not see A's Outro names");
  }

  await cleanup();
  await prisma.$disconnect();

  console.log(
    JSON.stringify(
      {
        ok: true,
        keys: "cursor+jurisprudencias",
        loop: "confirm-dossier-petition",
        isolation: "org-scoped",
        stalePetition: true,
      },
      null,
      2,
    ),
  );
}

main().catch(async (error: unknown) => {
  await cleanup().catch(() => undefined);
  await prisma.$disconnect().catch(() => undefined);
  console.error(error);
  process.exit(1);
});
