import { readCursorApiKey } from "@/lib/env";
import type { AgentPort } from "./schemas";
import { createFakeAgentPort } from "./fake-agent-port";

type CursorAgentRuntime = "fake" | "local" | "http";

/**
 * Resolves the AgentPort for this process.
 * Tests and `USE_FAKE_AGENT=1` always fake. Native local Agent.prompt failed on Linux
 * (ADR 0009); default is fake unless `CURSOR_AGENT_RUNTIME` is `local` or `http`.
 */
export async function resolveAgentPort(): Promise<AgentPort> {
  if (process.env.NODE_ENV === "test" || process.env.USE_FAKE_AGENT === "1") {
    return createFakeAgentPort();
  }

  const runtime = readRuntime();
  if (runtime === "fake") {
    return createFakeAgentPort();
  }

  const apiKey = readCursorApiKey();
  if (!apiKey) {
    return createFakeAgentPort();
  }

  if (runtime === "http") {
    const { createHttpCloudAgentPort } = await import("./http-cloud-agent-port");
    return createHttpCloudAgentPort(apiKey);
  }

  const { createAgentPort } = await import("./cursor-agent-port");
  return createAgentPort(apiKey);
}

function readRuntime(): CursorAgentRuntime {
  const configured = process.env.CURSOR_AGENT_RUNTIME;

  if (configured === "local" || configured === "http" || configured === "fake") {
    return configured;
  }

  return "fake";
}
