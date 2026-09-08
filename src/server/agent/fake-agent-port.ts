import {
  dossierDraftSchema,
  inferResultSchema,
  petitionDraftSchema,
  type AgentPort,
  type DossierDraft,
  type DossierPromptInput,
  type InferInput,
  type InferResult,
  type PetitionDraft,
  type PetitionPromptInput,
} from "./schemas";

function parseJsonBlock<T>(text: string, schema: { parse: (value: unknown) => T }): T {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Agent response did not contain JSON");
  }

  return schema.parse(JSON.parse(match[0]));
}

export class FakeAgentPort implements AgentPort {
  async inferThemeAndClaim(input: InferInput): Promise<InferResult> {
    const lower = input.materialText.toLowerCase();
    const themeSlug = lower.includes("saúde")
      ? "tutela-urgencia-saude"
      : "dano-moral-relacao-consumo";

    return inferResultSchema.parse({
      themeSlug,
      claim: lower.includes("indenização")
        ? "Condenação do réu ao pagamento de indenização por danos morais."
        : "Procedência do pedido de indenização por danos morais em relação de consumo.",
    });
  }

  async draftDossier(input: DossierPromptInput): Promise<DossierDraft> {
    const precedents = input.judgments.slice(0, 5).map((judgment, index) => ({
      judgmentId: judgment.id,
      stance: index % 3 === 0 ? "opposing" : "supporting",
      excerpt: (judgment.ementa ?? judgment.rawText).slice(0, 240),
    }));

    return dossierDraftSchema.parse({
      patternSummary:
        "O órgão julgador tem oscillado entre procedência parcial e improcedência quando a prova do dano moral é frágil.",
      organPatternLabel: input.organName ?? input.tribunal.toUpperCase(),
      coverageNote:
        input.judgments.length < 5
          ? "Cobertura fina: menos de cinco precedentes persistidos após ingestão."
          : undefined,
      precedents,
    });
  }

  async draftPetition(input: PetitionPromptInput): Promise<PetitionDraft> {
    const first = input.precedents[0];

    return petitionDraftSchema.parse({
      sections: [
        {
          key: "facts",
          title: "Dos fatos",
          paragraphs: [{ text: input.materialText.slice(0, 500) }],
        },
        {
          key: "law",
          title: "Do direito",
          paragraphs: first
            ? [
                {
                  text: `Nesse sentido, o tribunal já decidiu que ${first.excerpt}`,
                  judgmentId: first.judgmentId,
                },
              ]
            : [
                {
                  text: "Não há precedente persistido no dossiê citável para este pedido.",
                  isHypothesis: true,
                },
              ],
        },
        {
          key: "requests",
          title: "Dos pedidos",
          paragraphs: [{ text: input.claim }],
        },
      ],
    });
  }
}

export function createFakeAgentPort(): AgentPort {
  return new FakeAgentPort();
}

export function buildInferPrompt(input: InferInput): string {
  return [
    "Responda apenas com JSON válido no formato:",
    '{"themeSlug":"slug-do-tema","claim":"pedido confirmável"}',
    "Escolha themeSlug apenas entre estes slugs:",
    input.productThemeSlugs.join(", "),
    `Tribunal: ${input.tribunal}`,
    "Material do Caso:",
    input.materialText,
  ].join("\n");
}

export function buildDossierPrompt(input: DossierPromptInput): string {
  return [
    "Você é um assistente jurídico. Responda APENAS com JSON válido, sem markdown, sem explicação e sem usar ferramentas.",
    '{"patternSummary":"...","organPatternLabel":"...","coverageNote":"opcional","precedents":[{"judgmentId":"id","stance":"supporting|opposing|dissent","excerpt":"trecho literal"}]}',
    `Pedido confirmado: ${input.claim}`,
    `Tema: ${input.themeName}`,
    `Tribunal: ${input.tribunal}`,
    input.judgeName ? `Juiz: ${input.judgeName}` : "",
    input.organName ? `Órgão: ${input.organName}` : "",
    "Julgamentos permitidos:",
    JSON.stringify(
      input.judgments.map((judgment) => ({
        id: judgment.id,
        caseNumber: judgment.caseNumber,
        result: judgment.result,
        organ: judgment.organ,
        rapporteur: judgment.rapporteur,
      })),
    ),
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildPetitionPrompt(input: PetitionPromptInput): string {
  return [
    "Redija petição inicial em JSON:",
    '{"sections":[{"key":"facts","title":"...","paragraphs":[{"text":"...","judgmentId":"opcional","isHypothesis":true|false}]}]}',
    "Use judgmentId apenas para precedentes listados.",
    `Pedido: ${input.claim}`,
    `Padrão do órgão: ${input.patternSummary}`,
    "Precedentes:",
    JSON.stringify(input.precedents),
    "Material do Caso:",
    input.materialText,
  ].join("\n");
}

export { parseJsonBlock };
