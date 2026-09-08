import { readCursorApiKey } from "@/lib/env";
import type { AgentPort } from "./schemas";
import { createFakeAgentPort } from "./fake-agent-port";

export async function resolveAgentPort(): Promise<AgentPort> {
  if (process.env.NODE_ENV === "test" || process.env.USE_FAKE_AGENT === "1") {
    return createFakeAgentPort();
  }

  const apiKey = readCursorApiKey();
  if (!apiKey) {
    return createFakeAgentPort();
  }

  const { createAgentPort } = await import("./cursor-agent-port");
  return createAgentPort(apiKey);
}
