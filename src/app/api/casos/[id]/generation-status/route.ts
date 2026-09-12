import { auth } from "@clerk/nextjs/server";
import { getCaseGenerationStatusForOffice } from "@/server/case/case-service";

/**
 * Uncached generation statuses for the case-file progress checklist.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await auth();
  const clerkOrgId = session.orgId;

  if (!session.userId || !clerkOrgId) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const snapshot = await getCaseGenerationStatusForOffice(id, clerkOrgId);

  if (!snapshot) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
