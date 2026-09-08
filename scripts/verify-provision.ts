import { config } from "dotenv";
import { resolve } from "node:path";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { readCursorApiKey, readJurisprudenciasApiKey } from "../src/lib/env";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = createPrismaClient();

async function main(): Promise<void> {
  const beforeCount = await prisma.judgment.count();
  const productThemes = await prisma.theme.count({
    where: { kind: "product", clerkOrgId: null },
  });
  const tjspJudgments = await prisma.judgment.count({
    where: { tribunal: "tjsp", caseNumber: { not: null } },
  });
  const actsOnSameCase = await prisma.judgment.count({
    where: { caseNumber: "1000000-23.2024.8.26.0100" },
  });
  const withoutCaseNumber = await prisma.judgment.count({
    where: { caseNumber: null },
  });

  console.log(
    JSON.stringify(
      {
        productThemes,
        tjspJudgments,
        actsOnSameCase,
        rowsWithoutCaseNumber: withoutCaseNumber,
        judgmentRowsBeforeReseed: beforeCount,
        cursorKeyReadable: Boolean(readCursorApiKey()),
        jurisprudenciasKeyReadable: Boolean(readJurisprudenciasApiKey()),
      },
      null,
      2,
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
