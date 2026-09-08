import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveAgentPort } from "@/server/agent/resolve-agent-port";
import { createFakeAgentPort } from "@/server/agent/fake-agent-port";
import { createHttpCloudAgentPort } from "@/server/agent/http-cloud-agent-port";

vi.mock("@/server/agent/fake-agent-port", () => ({
  createFakeAgentPort: vi.fn(() => ({ kind: "fake" })),
}));

vi.mock("@/server/agent/http-cloud-agent-port", () => ({
  createHttpCloudAgentPort: vi.fn(() => ({ kind: "http" })),
}));

vi.mock("@/lib/env", () => ({
  readCursorApiKey: vi.fn(() => "crsr_test"),
}));

describe("resolveAgentPort", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it("uses the fake port in test runs", async () => {
    process.env.NODE_ENV = "test";
    const port = await resolveAgentPort();
    expect(port).toEqual({ kind: "fake" });
    expect(createHttpCloudAgentPort).not.toHaveBeenCalled();
  });

  it("uses the http cloud port when configured", async () => {
    process.env.NODE_ENV = "development";
    process.env.CURSOR_AGENT_RUNTIME = "http";
    delete process.env.USE_FAKE_AGENT;

    const port = await resolveAgentPort();

    expect(createHttpCloudAgentPort).toHaveBeenCalledWith("crsr_test");
    expect(port).toEqual({ kind: "http" });
  });

  it("falls back to fake when runtime is fake", async () => {
    process.env.NODE_ENV = "development";
    process.env.CURSOR_AGENT_RUNTIME = "fake";

    const port = await resolveAgentPort();

    expect(createFakeAgentPort).toHaveBeenCalled();
    expect(port).toEqual({ kind: "fake" });
  });
});
