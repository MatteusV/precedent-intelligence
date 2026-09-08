import type { LegalCase, Theme } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  MAX_PRECEDENTS,
  MIN_PRECEDENTS,
  PETITION_DISCLAIMER,
} from "@/lib/constants";
import type { AgentPort, DossierDraft } from "@/server/agent/schemas";
import {
  countMatchingJudgments,
  retrieveCandidateJudgments,
  shouldTriggerIngest,
} from "@/server/coverage/retrieve-candidates";
import {
  createJurisprudenciasClient,
  formatIngestFailureNote,
  ingestOnCoverageMiss,
} from "@/server/coverage/ingest-jurisprudencias";
import { validateDossierDraft } from "@/server/validators/citation-validator";
import { liveCaseWhere } from "@/server/case/live-case-where";

export interface GenerateDossierResult {
  dossierId: string;
  isEmpty: boolean;
  isThin: boolean;
}

function resolveOrganPatternLabel(
  legalCase: LegalCase,
  organs: Array<string | null | undefined>,
): string {
  if (legalCase.organName) {
    const match = organs.find(
      (organ) =>
        organ &&
        organ.toLowerCase().includes(legalCase.organName!.toLowerCase()),
    );
    if (match) {
      return match;
    }
  }

  return legalCase.tribunal.toUpperCase();
}

export async function generateDossierForCase(
  legalCaseId: string,
  clerkOrgId: string,
  agentPort: AgentPort,
): Promise<GenerateDossierResult> {
  const legalCase = await prisma.legalCase.findFirst({
    where: liveCaseWhere(clerkOrgId, legalCaseId),
    include: { theme: true },
  });

  if (!legalCase || !legalCase.themeId || !legalCase.theme || !legalCase.claim) {
    throw new Error("Caso não confirmado para geração de dossiê");
  }

  await prisma.legalCase.update({
    where: { id: legalCase.id },
    data: { dossierJobStatus: "retrieving" },
  });

  const filters = {
    themeId: legalCase.themeId,
    tribunal: legalCase.tribunal,
    judgeName: legalCase.judgeName,
    organName: legalCase.organName,
  };

  let matchCount = await countMatchingJudgments(filters);
  let ingestFailureNote: string | undefined;

  if (shouldTriggerIngest(matchCount)) {
    await prisma.legalCase.update({
      where: { id: legalCase.id },
      data: { dossierJobStatus: "ingesting" },
    });

    try {
      const client = createJurisprudenciasClient();
      const ingestResult = await ingestOnCoverageMiss(
        {
          ...filters,
          query: legalCase.theme.name,
        },
        client,
      );
      ingestFailureNote = formatIngestFailureNote(ingestResult.failureReason);
    } catch {
      // Spec 5.4: a missing key or API failure still yields a local thin/empty Dossiê.
      ingestFailureNote = formatIngestFailureNote(
        "JURISPRUDENCIAS_API_KEY is not configured",
      );
    }

    matchCount = await countMatchingJudgments(filters);
  }

  const candidates = await retrieveCandidateJudgments(filters);

  await prisma.legalCase.update({
    where: { id: legalCase.id },
    data: { dossierJobStatus: "analyzing" },
  });

  if (candidates.length === 0) {
    return persistEmptyDossier(legalCase, clerkOrgId, ingestFailureNote);
  }

  let draft: DossierDraft;
  let agentFailureNote: string | undefined;

  const dossierInput = {
    materialText: legalCase.materialText,
    claim: legalCase.claim,
    themeName: legalCase.theme.name,
    tribunal: legalCase.tribunal,
    judgeName: legalCase.judgeName,
    organName: legalCase.organName,
    judgments: candidates.slice(0, MAX_PRECEDENTS),
  };

  try {
    draft = await agentPort.draftDossier(dossierInput);
  } catch {
    const { createFakeAgentPort } = await import("@/server/agent/fake-agent-port");
    draft = await createFakeAgentPort().draftDossier(dossierInput);
    agentFailureNote =
      "O agente Cursor não respondeu; o dossiê foi montado com rascunho local.";
  }

  const validated = validateDossierDraft(draft, candidates);
  const selected = validated.precedents.slice(
    0,
    Math.min(
      MAX_PRECEDENTS,
      Math.max(MIN_PRECEDENTS, validated.precedents.length),
    ),
  );

  const isThin = selected.length < MIN_PRECEDENTS;
  const organPatternLabel = resolveOrganPatternLabel(
    legalCase,
    candidates.map((candidate) => candidate.organ),
  );

  const hasJudgeMismatch =
    Boolean(legalCase.judgeName) &&
    !candidates.some((candidate) =>
      candidate.rapporteur
        ?.toLowerCase()
        .includes(legalCase.judgeName!.toLowerCase()),
    );

  const patternSummary = hasJudgeMismatch
    ? `${validated.patternSummary} Não há padrão pessoal identificado para o juiz informado; o padrão reportado refere-se ao órgão.`
    : validated.patternSummary;

  return prisma.$transaction(async (tx) => {
    if (legalCase.currentDossierId) {
      await tx.dossier.updateMany({
        where: { legalCaseId: legalCase.id, isCurrent: true },
        data: { isCurrent: false },
      });

      await tx.petition.updateMany({
        where: {
          legalCaseId: legalCase.id,
          status: "current",
        },
        data: { status: "stale" },
      });

      await tx.legalCase.update({
        where: { id: legalCase.id },
        data: { currentPetitionId: null },
      });
    }

    const dossier = await tx.dossier.create({
      data: {
        legalCaseId: legalCase.id,
        clerkOrgId,
        patternSummary,
        organPatternLabel,
        coverageNote:
          validated.coverageNote ??
          agentFailureNote ??
          ingestFailureNote ??
          (isThin
            ? "Cobertura fina: menos de cinco precedentes persistidos para este recorte."
            : null),
        isEmpty: selected.length === 0,
        isThin,
        isCurrent: true,
        precedents: {
          create: selected.map((precedent, index) => ({
            judgmentId: precedent.judgmentId,
            stance: precedent.stance,
            excerpt: precedent.excerpt,
            sortOrder: index,
          })),
        },
      },
    });

    await tx.legalCase.update({
      where: { id: legalCase.id },
      data: {
        currentDossierId: dossier.id,
        dossierJobStatus: "completed",
      },
    });

    return {
      dossierId: dossier.id,
      isEmpty: selected.length === 0,
      isThin,
    };
  });
}

async function persistEmptyDossier(
  legalCase: LegalCase & { theme: Theme | null },
  clerkOrgId: string,
  ingestFailureNote?: string,
): Promise<GenerateDossierResult> {
  return prisma.$transaction(async (tx) => {
    if (legalCase.currentDossierId) {
      await tx.dossier.updateMany({
        where: { legalCaseId: legalCase.id, isCurrent: true },
        data: { isCurrent: false },
      });

      await tx.petition.updateMany({
        where: { legalCaseId: legalCase.id, status: "current" },
        data: { status: "stale" },
      });
    }

    const dossier = await tx.dossier.create({
      data: {
        legalCaseId: legalCase.id,
        clerkOrgId,
        patternSummary:
          "Não foi encontrado precedente persistido para este recorte e tribunal.",
        organPatternLabel: legalCase.tribunal.toUpperCase(),
        coverageNote:
          ingestFailureNote ??
          "Cobertura vazia: nenhum julgamento persistido correspondeu aos filtros.",
        isEmpty: true,
        isThin: true,
        isCurrent: true,
      },
    });

    await tx.legalCase.update({
      where: { id: legalCase.id },
      data: {
        currentDossierId: dossier.id,
        currentPetitionId: null,
        dossierJobStatus: "completed",
      },
    });

    return {
      dossierId: dossier.id,
      isEmpty: true,
      isThin: true,
    };
  });
}

export async function generatePetitionForCase(
  legalCaseId: string,
  clerkOrgId: string,
  agentPort: AgentPort,
): Promise<string> {
  const legalCase = await prisma.legalCase.findFirst({
    where: liveCaseWhere(clerkOrgId, legalCaseId),
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

  if (
    !legalCase ||
    !legalCase.claim ||
    !legalCase.theme ||
    !legalCase.currentDossier
  ) {
    throw new Error("Caso sem dossiê atual para gerar petição");
  }

  const precedents = legalCase.currentDossier.precedents;
  const petitionInput = {
    materialText: legalCase.materialText,
    claim: legalCase.claim,
    themeName: legalCase.theme.name,
    tribunal: legalCase.tribunal,
    patternSummary: legalCase.currentDossier.patternSummary,
    precedents: precedents.map((precedent) => ({
      id: precedent.id,
      judgmentId: precedent.judgmentId,
      caseNumber: precedent.judgment.caseNumber,
      stance: precedent.stance,
      excerpt: precedent.excerpt,
    })),
  };

  let draft;
  try {
    draft = await agentPort.draftPetition(petitionInput);
  } catch {
    const { createFakeAgentPort } = await import("@/server/agent/fake-agent-port");
    draft = await createFakeAgentPort().draftPetition(petitionInput);
  }

  const allowlistedCaseNumbers = new Set(
    precedents
      .map((precedent) => precedent.judgment.caseNumber)
      .filter((value): value is string => Boolean(value)),
  );

  const precedentByJudgmentId = new Map(
    precedents.map((precedent) => [precedent.judgmentId, precedent.id]),
  );

  const { validatePetitionDraft } = await import(
    "@/server/validators/citation-validator"
  );
  const validated = validatePetitionDraft(
    draft,
    allowlistedCaseNumbers,
    precedentByJudgmentId,
  );

  return prisma.$transaction(async (tx) => {
    await tx.petition.updateMany({
      where: { legalCaseId: legalCase.id, status: "current" },
      data: { status: "stale" },
    });

    const petition = await tx.petition.create({
      data: {
        legalCaseId: legalCase.id,
        dossierId: legalCase.currentDossier!.id,
        clerkOrgId,
        disclaimer: PETITION_DISCLAIMER,
        status: "current",
        sections: validated.sections as unknown as Prisma.InputJsonValue,
        anchors: {
          create: validated.sections.flatMap((section) =>
            section.paragraphs
              .filter((paragraph) => paragraph.dossierPrecedentId)
              .map((paragraph) => ({
                sectionKey: section.key,
                assertionText: paragraph.text,
                dossierPrecedentId: paragraph.dossierPrecedentId,
                isHypothesis: false,
              })),
          ),
        },
      },
    });

    await tx.legalCase.update({
      where: { id: legalCase.id },
      data: { currentPetitionId: petition.id },
    });

    return petition.id;
  });
}
