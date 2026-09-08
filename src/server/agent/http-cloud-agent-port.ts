import { Agent, CursorAgentError } from "@cursor/sdk";
import {
  buildDossierPrompt,
  buildInferPrompt,
  buildPetitionPrompt,
  parseJsonBlock,
} from "./fake-agent-port";
import { resolveCloudAgentText } from "./cloud-agent-response";
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
    const agent = await Agent.create({
      apiKey: this.apiKey,
      cloud: {
        repos: [],
      },
    });

    try {
      const run = await agent.send(message, {
        mode: "plan",
      });
      const completed = await run.wait();

      if (completed.status !== "finished") {
        throw new CursorAgentError(
          `Cloud Cursor agent finished with status ${completed.status}`,
          { operation: "HttpCloudAgentPort.runPrompt" },
        );
      }

      const text = await resolveCloudAgentText(run, completed, async () =>
        Agent.messages.list(agent.agentId, { apiKey: this.apiKey }),
      );

      if (!text) {
        throw new CursorAgentError("Cloud Cursor agent returned empty text", {
          operation: "HttpCloudAgentPort.runPrompt",
        });
      }

      return text;
    } finally {
      await agent.close();
    }
  }
}

export function createHttpCloudAgentPort(apiKey: string): AgentPort {
  return new HttpCloudAgentPort(apiKey);
}
