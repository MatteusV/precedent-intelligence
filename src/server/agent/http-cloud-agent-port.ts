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

/**
 * Cloud Cursor adapter used when the native local runtime cannot resolve a model.
 * Does not attach this git repository — prompt-only JSON drafting.
 */
export class HttpCloudAgentPort implements AgentPort {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async inferThemeAndClaim(input: InferInput): Promise<InferResult> {
    const result = await this.runPrompt(buildInferPrompt(input));
    return parseJsonBlock(result, inferResultSchema);
  }

  async draftDossier(input: DossierPromptInput): Promise<DossierDraft> {
    const result = await this.runPrompt(buildDossierPrompt(input));
    return parseJsonBlock(result, dossierDraftSchema);
  }

  async draftPetition(input: PetitionPromptInput): Promise<PetitionDraft> {
    const result = await this.runPrompt(buildPetitionPrompt(input));
    return parseJsonBlock(result, petitionDraftSchema);
  }

  private async runPrompt(message: string): Promise<string> {
    const completed = await Agent.prompt(message, {
      apiKey: this.apiKey,
      tools: [],
      cloud: {
        env: { type: "cloud" },
      },
    });

    if (completed.status !== "finished") {
      throw new CursorAgentError(
        `Cloud Cursor agent finished with status ${completed.status}`,
        { operation: "HttpCloudAgentPort.runPrompt" },
      );
    }

    const text = completed.result?.trim();
    if (!text) {
      throw new CursorAgentError("Cloud Cursor agent returned empty text", {
        operation: "HttpCloudAgentPort.runPrompt",
      });
    }

    return text;
  }
}

export function createHttpCloudAgentPort(apiKey: string): AgentPort {
  return new HttpCloudAgentPort(apiKey);
}
