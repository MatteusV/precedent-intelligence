#!/usr/bin/env tsx
import "dotenv/config";
import { Agent, CursorAgentError } from "@cursor/sdk";
import { readCursorApiKey } from "../src/lib/env";

async function main(): Promise<void> {
  const apiKey = readCursorApiKey();
  if (!apiKey) {
    console.error("CURSOR_API_KEY missing");
    process.exit(1);
  }

  try {
    const completed = await Agent.prompt(
      'Responda apenas: {"ok":true}',
      {
        apiKey,
        model: { id: "default" },
        local: {
          settingSources: [],
        },
      },
    );

    console.log(
      JSON.stringify(
        {
          status: completed.status,
          text: completed.result?.slice(0, 200) ?? null,
          adapter: "local-sdk",
        },
        null,
        2,
      ),
    );

    if (completed.status !== "finished") {
      process.exit(2);
    }
  } catch (error) {
    if (error instanceof CursorAgentError) {
      console.error(
        JSON.stringify(
          {
            adapter: "http-fallback-required",
            message: error.message,
          },
          null,
          2,
        ),
      );
      process.exit(3);
    }

    throw error;
  }
}

main();
