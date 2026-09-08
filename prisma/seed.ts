import { config } from "dotenv";
import { resolve } from "node:path";
import {
  JudgmentSource,
  ThemeKind,
} from "@prisma/client";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { computeContentHash } from "../src/lib/content-hash";
import {
  PRODUCT_THEMES,
  SEED_THEME_SLUG,
} from "../src/lib/product-themes";
import { SEED_TRIBUNAL_SLUG } from "../src/lib/tribunals";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = createPrismaClient();

const rapporteurs = [
  "Des. Maria Silva",
  "Des. João Pereira",
  "Des. Ana Costa",
  "Des. Carlos Mendes",
];

const organs = [
  "10ª Câmara de Direito Privado",
  "11ª Câmara de Direito Privado",
  "25ª Câmara de Direito Privado",
];

const results = ["Procedente", "Improcedente", "Parcialmente procedente"];

async function main(): Promise<void> {
  for (const theme of PRODUCT_THEMES) {
    const existingTheme = await prisma.theme.findFirst({
      where: {
        slug: theme.slug,
        clerkOrgId: null,
      },
    });

    if (!existingTheme) {
      await prisma.theme.create({
        data: {
          slug: theme.slug,
          name: theme.name,
          kind: ThemeKind.product,
        },
      });
    } else {
      await prisma.theme.update({
        where: { id: existingTheme.id },
        data: { name: theme.name },
      });
    }
  }

  const seedTheme = await prisma.theme.findFirstOrThrow({
    where: { slug: SEED_THEME_SLUG, clerkOrgId: null },
  });

  for (let index = 0; index < 30; index += 1) {
    const caseNumber = `100${index.toString().padStart(4, "0")}-23.2024.8.26.0100`;
    const rapporteur = rapporteurs[index % rapporteurs.length];
    const organ = organs[index % organs.length];
    const result = results[index % results.length];
    const ementa = `Dano moral em relação de consumo. ${result}. Acórdão ${index + 1} do TJSP sobre falha na prestação de serviço e dever de indenizar.`;
    const rawText = `${ementa}\n\nFundamentação: aplica-se o CDC; o dano moral independe de prova do prejuízo patrimonial quando a falha é grave.\n\nDispositivo: ${result}.`;
    const contentHash = computeContentHash(rawText);

    const judgment = await prisma.judgment.upsert({
      where: { contentHash },
      create: {
        tribunal: SEED_TRIBUNAL_SLUG,
        organ,
        rapporteur,
        caseNumber,
        judgmentDate: new Date(2024, index % 12, (index % 27) + 1),
        result,
        holding: ementa,
        ementa,
        grounds: "Fundamentação sintética de seed pública.",
        operativePart: result,
        rawText,
        source: JudgmentSource.seed,
        contentHash,
      },
      update: {},
    });

    await prisma.judgmentTheme.upsert({
      where: {
        judgmentId_themeId: {
          judgmentId: judgment.id,
          themeId: seedTheme.id,
        },
      },
      create: {
        judgmentId: judgment.id,
        themeId: seedTheme.id,
      },
      update: {},
    });
  }

  const secondActHash = computeContentHash(
    "Acórdão de agravo em recurso especial no mesmo processo, confirmando entendimento anterior.",
  );

  await prisma.judgment.upsert({
    where: { contentHash: secondActHash },
    create: {
      tribunal: SEED_TRIBUNAL_SLUG,
      organ: organs[0],
      rapporteur: rapporteurs[0],
      caseNumber: "1000000-23.2024.8.26.0100",
      judgmentDate: new Date("2025-01-15"),
      result: "Provimento negado",
      ementa:
        "Agravo interno. Mesmo processo, ato distinto. Mantém-se a indenização por dano moral.",
      rawText:
        "Acórdão de agravo em recurso especial no mesmo processo, confirmando entendimento anterior.",
      source: JudgmentSource.seed,
      contentHash: secondActHash,
    },
    update: {},
  });

  await prisma.judgment.createMany({
    data: [
      {
        tribunal: SEED_TRIBUNAL_SLUG,
        organ: organs[1],
        rapporteur: rapporteurs[1],
        caseNumber: null,
        result: "Não citable",
        rawText: "Metadado sem número de processo — não deve virar precedente.",
        source: JudgmentSource.seed,
        contentHash: computeContentHash(
          "Metadado sem número de processo — não deve virar precedente.",
        ),
      },
    ],
    skipDuplicates: true,
  });
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
