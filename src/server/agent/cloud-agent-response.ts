import type { AgentMessage, ConversationTurn, Run, RunResult } from "@cursor/sdk";

interface AssistantMessageStep {
  readonly type: "assistantMessage";
  readonly message: {
    readonly text: string;
  };
}

interface AgentConversationTurnPayload {
  readonly steps?: readonly AssistantMessageStep[];
}

interface AgentConversationTurn {
  readonly type: "agentConversationTurn";
  readonly turn: AgentConversationTurnPayload;
}

function isAgentConversationTurn(
  turn: ConversationTurn,
): turn is AgentConversationTurn {
  return turn.type === "agentConversationTurn";
}

export function extractAssistantTextFromConversation(
  turns: readonly ConversationTurn[],
): string {
  const chunks: string[] = [];

  for (const turn of turns) {
    if (!isAgentConversationTurn(turn)) {
      continue;
    }

    for (const step of turn.turn.steps ?? []) {
      if (step.type === "assistantMessage" && step.message.text.trim()) {
        chunks.push(step.message.text.trim());
      }
    }
  }

  return chunks.join("\n\n").trim();
}

export function extractAssistantTextFromMessages(
  messages: readonly AgentMessage[],
): string {
  const chunks: string[] = [];

  for (const message of messages) {
    if (message.type !== "assistant") {
      continue;
    }

    const text = extractTextFromUnknownMessage(message.message);
    if (text) {
      chunks.push(text);
    }
  }

  return chunks.join("\n\n").trim();
}

function extractTextFromUnknownMessage(message: unknown): string | null {
  if (!message || typeof message !== "object") {
    return null;
  }

  const record = message as Record<string, unknown>;

  if (typeof record.text === "string" && record.text.trim()) {
    return record.text.trim();
  }

  const content = record.content;
  if (!Array.isArray(content)) {
    return null;
  }

  const textBlocks = content
    .map((block) => {
      if (!block || typeof block !== "object") {
        return null;
      }

      const typedBlock = block as Record<string, unknown>;
      if (typedBlock.type === "text" && typeof typedBlock.text === "string") {
        return typedBlock.text.trim();
      }

      return null;
    })
    .filter((value): value is string => Boolean(value));

  if (textBlocks.length === 0) {
    return null;
  }

  return textBlocks.join("\n").trim();
}

export async function resolveCloudAgentText(
  run: Run,
  completed: RunResult,
  readMessages?: () => Promise<readonly AgentMessage[]>,
): Promise<string | null> {
  const direct = completed.result?.trim();
  if (direct) {
    return direct;
  }

  const conversation = await run.conversation();
  const fromConversation = extractAssistantTextFromConversation(conversation);
  if (fromConversation) {
    return fromConversation;
  }

  if (!readMessages) {
    return null;
  }

  const messages = await readMessages();
  const fromMessages = extractAssistantTextFromMessages(messages);
  return fromMessages || null;
}
