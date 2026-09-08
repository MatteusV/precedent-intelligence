import { Agent, CursorAgentError } from "@cursor/sdk";
import {
  buildDossierPrompt,
  buildInferPrompt,
  buildPetitionPrompt,
  parseJsonBlock,
} from "./fake-agent-port";
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

export class CursorAgentPort implements AgentPort {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async inferThemeAndClaim(input: InferInput): Promise<InferResult> {
    const prompt = buildInferPrompt(input);
    const result = await this.runPrompt(prompt);
    return parseJsonBlock(result, inferResultSchema);
  }

  async draftDossier(input: DossierPromptInput): Promise<DossierDraft> {
    const prompt = buildDossierPrompt(input);
    const result = await this.runPrompt(prompt);
    return parseJsonBlock(result, dossierDraftSchema);
  }

  async draftPetition(input: PetitionPromptInput): Promise<PetitionDraft> {
    const prompt = buildPetitionPrompt(input);
    const result = await this.runPrompt(prompt);
    return parseJsonBlock(result, petitionDraftSchema);
  }

  private async runPrompt(message: string): Promise<string> {
    const completed = await Agent.prompt(message, {
      apiKey: this.apiKey,
      model: { id: "default" },
      local: {
        settingSources: [],
      },
    });

    if (completed.status !== "finished") {
      throw new CursorAgentError(
        `Cursor agent finished with status ${completed.status}`,
        { operation: "Agent.prompt" },
      );
    }

    const text = completed.result?.trim();
    if (!text) {
      throw new CursorAgentError("Cursor agent returned empty text", {
        operation: "Agent.prompt",
      });
    }

    return text;
  }
}

export function createAgentPort(apiKey: string): AgentPort {
  return new CursorAgentPort(apiKey);
}
