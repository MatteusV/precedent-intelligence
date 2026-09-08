## Context

See `proposal.md` for motivation. `LegalCase` is listed, reopened, confirmed, and used to generate Dossiê/Petição through `src/server/case/case-service.ts` and `src/server/dossier/generate-dossier.ts`. Those queries filter by `clerkOrgId` only. `Judgment` already has `deletedAt`; `LegalCase` does not. Hard-deleting a Caso would have to null `currentDossierId` / `currentPetitionId` before cascade; this change does not delete rows. Main spec: `openspec/specs/case-intake/spec.md`. UI: pauta and rail are full-row links; case detail `PageHeader` already has an unused `actions` slot. There is no dialog primitive in `src/components/ui`.

## Goals / Non-Goals

**Goals:**

- One nullable timestamp on the Caso aggregate root is enough to take it off every live office surface.
- All live `LegalCase` reads and mutations share the same office + not-hidden predicate so a missed filter cannot reopen a hidden matter.
- Hide is a confirmed control on the case detail; success returns to `/app`.

**Non-Goals:**

- Prisma middleware or a client extension that auto-filters every model.
- `deletedAt` on `Dossier` / `Petition`.
- Restore, trash, purge job, or hard delete.
- Delete control on the pauta or rail.

## Decisions

### 1. Soft-delete the Caso root only

`LegalCase.deletedAt DateTime?`. Hide sets it to `now()` when the row is live and owned by the active org. Children stay; Julgamentos and Temas stay.

Alternatives: hard delete (PII gone, but circular FKs and no later restore column); `deletedAt` on every child (redundant if the product never queries children except through the case).

### 2. Shared live-case predicate, not middleware

Export a single `where` helper (org id, optional case id, `deletedAt: null`) and use it in `listCasesForOffice`, `getCaseForOffice`, `confirmCaseTheme`, `hideCaseForOffice`, and both generate functions. `createDraftCase` does not filter. Tests can assert the helper and that hide no-ops for the wrong org or an already-hidden id.

Alternative: Prisma client extension. Rejected for this change — two modules, five queries; an implicit filter is easier to miss in `update({ where: { id } })` than an explicit helper.

### 3. Hide is a case-service function + server action

`hideCaseForOffice(id, office)` loads with the live predicate, throws the same not-found error as a missing case if absent, then `update`s only `deletedAt`. Server action: `requireOfficeContext`, hide, `revalidatePath("/app")` and the case path, `redirect("/app")`. Any org member may hide; existing mutations already ignore `clerkUserId`.

### 4. Confirmation is client-side on the detail header

`Button variant="destructive"` in `PageHeader.actions` on `/app/casos/[id]`. A small client control requires a second click (or equivalent confirm) before submitting the action. No pauta-row action (the row is navigation). No new dialog package unless the existing `button` + local state is insufficient.

### 5. Already-hidden and cross-org look the same

Do not distinguish "hidden" from "unknown" or "other org" in the product. Detail stays `notFound()`. Hide / confirm / generate fail without writing.

## Risks / Trade-offs

- **[Risk] A new `prisma.legalCase` query forgets the helper** → Mitigation: helper + tests; grep `legalCase.find` in apply; do not add Prisma middleware in this change.
- **[Risk] In-flight Dossiê job writes after hide** → Mitigation: generate functions re-load with the live predicate before mutating; a hide mid-job may still finish a write if it already passed the load. Accept for this version; restore is out of scope.
- **[Trade-off] Material do Caso remains in Neon** → Accept. Column is the hook for a later restore or purge; this change only hides.

## Migration Plan

1. Add `deletedAt` to `LegalCase`, migrate, regenerate client.
2. Wire helper, hide, filters, action, detail UI, tests.
3. Rollback: revert deploy; column may remain unused. Do not backfill.

## Open Questions

- None. Restore copy and purge policy are a later change.
