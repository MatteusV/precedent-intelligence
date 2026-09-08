## 1. Schema

- [x] 1.1 Add nullable `deletedAt DateTime?` to `LegalCase` in `prisma/schema.prisma` and verify `pnpm db:validate` succeeds
- [x] 1.2 Create and apply a Prisma migration for `LegalCase.deletedAt` and verify `pnpm exec prisma migrate deploy` succeeds without changing `Judgment`, `Dossier`, or `Petition` delete behavior

## 2. Live-case access

- [x] 2.1 Add a shared live-case `where` helper (escritório id, optional case id, `deletedAt: null`) and verify unit tests cover org-only list vs id+org get
- [x] 2.2 Use the helper in `listCasesForOffice`, `getCaseForOffice`, and `confirmCaseTheme`, and verify no remaining `prisma.legalCase.find` in `case-service.ts` omits `deletedAt: null` except `createDraftCase`
- [x] 2.3 Use the helper in `generateDossierForCase` and `generatePetitionForCase` loads, and verify a hidden case id does not start confirm, Dossiê, or Petição writes
- [x] 2.4 Add `hideCaseForOffice` that loads via the helper, rejects missing/wrong-org/already-hidden with the same not-found error, sets only `deletedAt`, and verify unit tests cover success, other escritório, already-hidden, and that Julgamento/Tema rows are not deleted

## 3. Action and UI

- [x] 3.1 Add `hideCaseAction` that requires office context, calls `hideCaseForOffice`, revalidates `/app` and the case path, redirects to `/app`, and verify a successful hide leaves the pauta without that case
- [x] 3.2 Add a destructive confirm control on the case detail `PageHeader` actions (no pauta or rail control) and verify hide does not run until the member confirms, then returns to the pauta
- [x] 3.3 Confirm the case rail and docket omit hidden cases via `listCasesForOffice` and verify a hidden id on `/app/casos/[id]` renders not found

## 4. Quality gates

- [x] 4.1 Run `pnpm test` and `pnpm lint` and verify both succeed
