import { describe, expect, it } from "vitest";
import {
  extractAssistantTextFromConversation,
  extractAssistantTextFromMessages,
} from "@/server/agent/cloud-agent-response";

describe("cloud-agent-response", () => {
  it("extracts assistant text from conversation turns", () => {
    const text = extractAssistantTextFromConversation([
      {
        type: "agentConversationTurn",
        turn: {
          steps: [
            {
              type: "assistantMessage",
              message: { text: '{"patternSummary":"Resumo real"}' },
            },
          ],
        },
      },
    ]);

    expect(text).toContain("patternSummary");
  });

  it("extracts assistant text from message list payloads", () => {
    const text = extractAssistantTextFromMessages([
      {
        type: "assistant",
        uuid: "1",
        agent_id: "bc-test",
        message: {
          content: [{ type: "text", text: '{"claim":"Pedido real"}' }],
        },
      },
    ]);

    expect(text).toContain("claim");
  });
});
