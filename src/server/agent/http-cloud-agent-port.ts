import { CursorAgentError } from "@cursor/sdk";
import type { AgentPort, DossierDraft, InferResult, PetitionDraft } from "./schemas";
import { createFakeAgentPort } from "./fake-agent-port";

/**
 * Placeholder for Vercel/Linux deployments where native @cursor/sdk binaries fail.
 * Uses the same AgentPort contract so tests continue to fake the port.
 */
export class HttpCloudAgentPort implements AgentPort {
  async inferThemeAndClaim(): Promise<InferResult> {
    throw new CursorAgentError("HTTP Cloud Agents adapter is not configured", {
      operation: "HttpCloudAgentPort.inferThemeAndClaim",
    });
  }

  async draftDossier(): Promise<DossierDraft> {
    throw new CursorAgentError("HTTP Cloud Agents adapter is not configured", {
      operation: "HttpCloudAgentPort.draftDossier",
    });
  }

  async draftPetition(): Promise<PetitionDraft> {
    throw new CursorAgentError("HTTP Cloud Agents adapter is not configured", {
      operation: "HttpCloudAgentPort.draftPetition",
    });
  }
}

export function createHttpCloudAgentPort(): AgentPort {
  return new HttpCloudAgentPort();
}

export function createFallbackAgentPort(): AgentPort {
  return createFakeAgentPort();
}
