## 1. Slim reopen query

- [x] 1.1 Change `getCaseForOffice` to an explicit Prisma `select` (case scalars, `theme.name`, current Dossiê with precedents + `judgment.caseNumber` only, current Petição `status`/`disclaimer`/`sections`) and verify a unit test asserts the query does not select `rawText`, `anchors`, `dossiers`, or `petitions`
- [x] 1.2 Keep `/app/casos/[id]` and `/app/casos/[id]/confirmar` compiling against the slimmer type, still using `liveCaseWhere`, and verify both pages still receive material, tema, pedido, current Dossiê identity/excerpts, and current Petição when present

## 2. Cache Components plumbing

- [x] 2.1 Set `cacheComponents: true` in `next.config.ts` and remove `export const dynamic = "force-dynamic"` from `src/app/app/layout.tsx`, and verify those files no longer use the old segment config
- [x] 2.2 Wrap `ClerkProvider` in `Suspense` in the root layout and keep `auth.protect()` / `requireOfficeContext()` outside any `'use cache'` function, and verify `auth()` is not called inside a cached read

## 3. Cached office reads

- [x] 3.1 Add `'use cache'`, `cacheLife('minutes')`, and `cacheTag('office:{orgId}:cases')` on `listCasesForOffice(clerkOrgId)`, replacing React `cache()`, and verify the function takes `clerkOrgId` as an argument and does not read cookies/headers
- [x] 3.2 Add `'use cache'`, `cacheLife('minutes')`, and tags `office:{orgId}:cases` plus `office:{orgId}:case:{id}` on `getCaseForOffice(legalCaseId, clerkOrgId)`, and verify both org id and case id are arguments (cache key) with no Material do Caso or session token in tags
- [x] 3.3 Add a test that `getCaseForOffice` / `listCasesForOffice` for org A do not return org B's rows (same case id or list), and verify the live predicate still applies

## 4. Mutation invalidation

- [x] 4.1 Call `updateTag` for `office:{org}:cases` (and the new case id when known) from `createCaseAction` after a successful create, and verify a test expects that tag update (create must not skip invalidation)
- [x] 4.2 Call `updateTag` for `office:{org}:cases` and `office:{org}:case:{id}` from `confirmCaseAction`, `generateDossierAction`, `generatePetitionAction`, and `hideCaseAction`, and verify tests expect those tags after each successful write
- [x] 4.3 Keep invalidation inside `src/app/actions/case-actions.ts` (not inside `generate-dossier.ts`), and verify `requireOfficeContext` still runs before every mutation

## 5. Quality gates

- [x] 5.1 Run `pnpm test` and `pnpm lint` and verify both succeed
- [x] 5.2 Run `pnpm exec next build` and verify it succeeds with Cache Components enabled (ClerkProvider Suspense / dynamic holes do not fail prerender)
