-- CreateEnum
CREATE TYPE "ThemeKind" AS ENUM ('product', 'outro');

-- CreateEnum
CREATE TYPE "LegalCaseStatus" AS ENUM ('draft', 'confirmed');

-- CreateEnum
CREATE TYPE "IngestionStatus" AS ENUM ('raw', 'structured', 'indexed');

-- CreateEnum
CREATE TYPE "JudgmentSource" AS ENUM ('seed', 'jurisprudencias_api', 'upload');

-- CreateEnum
CREATE TYPE "PrecedentStance" AS ENUM ('supporting', 'opposing', 'dissent');

-- CreateEnum
CREATE TYPE "PetitionStatus" AS ENUM ('current', 'stale');

-- CreateEnum
CREATE TYPE "DossierJobStatus" AS ENUM ('pending', 'retrieving', 'ingesting', 'analyzing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ThemeKind" NOT NULL,
    "clerkOrgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judgment" (
    "id" TEXT NOT NULL,
    "tribunal" TEXT NOT NULL,
    "organ" TEXT,
    "rapporteur" TEXT,
    "caseNumber" TEXT,
    "judgmentDate" TIMESTAMP(3),
    "result" TEXT,
    "holding" TEXT,
    "ementa" TEXT,
    "grounds" TEXT,
    "operativePart" TEXT,
    "rawText" TEXT NOT NULL,
    "source" "JudgmentSource" NOT NULL,
    "externalId" TEXT,
    "sourceUrl" TEXT,
    "fetchedAt" TIMESTAMP(3),
    "contentHash" TEXT NOT NULL,
    "ingestionStatus" "IngestionStatus" NOT NULL DEFAULT 'structured',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Judgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgmentTheme" (
    "judgmentId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,

    CONSTRAINT "JudgmentTheme_pkey" PRIMARY KEY ("judgmentId","themeId")
);

-- CreateTable
CREATE TABLE "LegalCase" (
    "id" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "materialText" TEXT NOT NULL,
    "claim" TEXT,
    "themeId" TEXT,
    "tribunal" TEXT NOT NULL,
    "judgeName" TEXT,
    "organName" TEXT,
    "status" "LegalCaseStatus" NOT NULL DEFAULT 'draft',
    "inferredThemeSlug" TEXT,
    "inferredClaim" TEXT,
    "currentDossierId" TEXT,
    "currentPetitionId" TEXT,
    "dossierJobStatus" "DossierJobStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dossier" (
    "id" TEXT NOT NULL,
    "legalCaseId" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "patternSummary" TEXT NOT NULL,
    "coverageNote" TEXT,
    "organPatternLabel" TEXT NOT NULL,
    "isEmpty" BOOLEAN NOT NULL DEFAULT false,
    "isThin" BOOLEAN NOT NULL DEFAULT false,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DossierPrecedent" (
    "id" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "stance" "PrecedentStance" NOT NULL,
    "excerpt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "DossierPrecedent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Petition" (
    "id" TEXT NOT NULL,
    "legalCaseId" TEXT NOT NULL,
    "dossierId" TEXT NOT NULL,
    "clerkOrgId" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "disclaimer" TEXT NOT NULL,
    "status" "PetitionStatus" NOT NULL DEFAULT 'current',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Petition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetitionAnchor" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "dossierPrecedentId" TEXT,
    "sectionKey" TEXT NOT NULL,
    "assertionText" TEXT NOT NULL,
    "isHypothesis" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PetitionAnchor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Theme_kind_clerkOrgId_idx" ON "Theme"("kind", "clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Theme_slug_clerkOrgId_key" ON "Theme"("slug", "clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "Judgment_contentHash_key" ON "Judgment"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "LegalCase_currentDossierId_key" ON "LegalCase"("currentDossierId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalCase_currentPetitionId_key" ON "LegalCase"("currentPetitionId");

-- CreateIndex
CREATE INDEX "LegalCase_clerkOrgId_idx" ON "LegalCase"("clerkOrgId");

-- CreateIndex
CREATE INDEX "Dossier_legalCaseId_isCurrent_idx" ON "Dossier"("legalCaseId", "isCurrent");

-- CreateIndex
CREATE INDEX "Dossier_clerkOrgId_idx" ON "Dossier"("clerkOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "DossierPrecedent_dossierId_judgmentId_key" ON "DossierPrecedent"("dossierId", "judgmentId");

-- CreateIndex
CREATE INDEX "Petition_legalCaseId_status_idx" ON "Petition"("legalCaseId", "status");

-- CreateIndex
CREATE INDEX "Petition_clerkOrgId_idx" ON "Petition"("clerkOrgId");

-- AddForeignKey
ALTER TABLE "JudgmentTheme" ADD CONSTRAINT "JudgmentTheme_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgmentTheme" ADD CONSTRAINT "JudgmentTheme_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_currentDossierId_fkey" FOREIGN KEY ("currentDossierId") REFERENCES "Dossier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalCase" ADD CONSTRAINT "LegalCase_currentPetitionId_fkey" FOREIGN KEY ("currentPetitionId") REFERENCES "Petition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dossier" ADD CONSTRAINT "Dossier_legalCaseId_fkey" FOREIGN KEY ("legalCaseId") REFERENCES "LegalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierPrecedent" ADD CONSTRAINT "DossierPrecedent_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DossierPrecedent" ADD CONSTRAINT "DossierPrecedent_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "Judgment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_legalCaseId_fkey" FOREIGN KEY ("legalCaseId") REFERENCES "LegalCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Petition" ADD CONSTRAINT "Petition_dossierId_fkey" FOREIGN KEY ("dossierId") REFERENCES "Dossier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetitionAnchor" ADD CONSTRAINT "PetitionAnchor_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetitionAnchor" ADD CONSTRAINT "PetitionAnchor_dossierPrecedentId_fkey" FOREIGN KEY ("dossierPrecedentId") REFERENCES "DossierPrecedent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
