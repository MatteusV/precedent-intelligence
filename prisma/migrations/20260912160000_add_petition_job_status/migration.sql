-- CreateEnum
CREATE TYPE "PetitionJobStatus" AS ENUM ('pending', 'drafting', 'anchoring', 'completed', 'failed');

-- AlterTable
ALTER TABLE "LegalCase" ADD COLUMN "petitionJobStatus" "PetitionJobStatus";
