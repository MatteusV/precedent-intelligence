import { describe, expect, it } from "vitest";
import { formatIngestFailureNote } from "@/server/coverage/ingest-jurisprudencias";

describe("formatIngestFailureNote", () => {
  it("explains rate limiting in user-facing copy", () => {
    expect(
      formatIngestFailureNote("Jurisprudências.ai request failed: 429"),
    ).toContain("limite diário");
  });

  it("explains invalid API tokens", () => {
    expect(
      formatIngestFailureNote("Jurisprudências.ai request failed: 401"),
    ).toContain("token de API");
  });
});
