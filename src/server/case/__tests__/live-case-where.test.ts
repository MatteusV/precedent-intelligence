import { describe, expect, it } from "vitest";
import { liveCaseWhere } from "@/server/case/live-case-where";

describe("liveCaseWhere", () => {
  it("filters by escritório and not hidden for list queries", () => {
    expect(liveCaseWhere("org_a")).toEqual({
      clerkOrgId: "org_a",
      deletedAt: null,
    });
  });

  it("adds case id for get-by-id queries", () => {
    expect(liveCaseWhere("org_a", "case_1")).toEqual({
      clerkOrgId: "org_a",
      deletedAt: null,
      id: "case_1",
    });
  });
});
