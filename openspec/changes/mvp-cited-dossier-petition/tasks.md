## 1. Provisioning

- [x] 1.1 Link the Vercel project, install Neon and Clerk via Marketplace, `vercel env pull --yes`, and verify `.env.local` has `DATABASE_URL` and Clerk keys (no mock DB or fake auth)
- [ ] 1.2 Add `CURSOR_API_KEY` and the Jurisprudências.ai key to the project and `.env.local` without committing them, and verify server code can read both names
- [x] 1.3 Spike `@cursor/sdk` local `Agent.prompt` + `wait()` on Linux and verify it finishes, or record that the HTTP Cloud Agents adapter is required

## 2. Data model and seed

- [x] 2.1 Add Prisma + Neon adapter, schema for Theme (product vs outro + `clerkOrgId`), Judgment (act identity + unique `contentHash`), JudgmentTheme, LegalCase, Dossier snapshots, DossierPrecedent, Petition, PetitionAnchor, and verify `pnpm exec prisma validate` succeeds
- [x] 2.2 Apply the first migration with `DIRECT_URL` and verify `pnpm exec prisma migrate deploy` succeeds
- [x] 2.3 Ship 3–7 product Theme rows in config/seed (including dano moral em relação de consumo) and seed tens of real public judgments for that one Tema on one supported Tribunal, and verify re-seed does not duplicate `contentHash`
- [x] 2.4 Verify a second act on the same case number can exist as a separate Judgment and that a row without `caseNumber` cannot be selected as a Precedente

## 3. Office auth

- [x] 3.1 Install `@clerk/nextjs` v7, `ClerkProvider` inside `<body>`, and verify `/` renders without a session
- [x] 3.2 Add `src/proxy.ts` (not `middleware.ts`) guarding product routes and verify unauthenticated product requests go to sign-in while `/` does not
- [ ] 3.3 Enable Organizations, sign-in/out, block intake without `orgId`, and verify sign-out ends the product session
- [ ] 3.4 Scope Caso/Dossiê/Petição/Outro Theme by `clerkOrgId` and verify org A cannot read org B's case or see B's Outro names, while product-Tema Julgamentos remain matchable

## 4. Case intake and confirmation

- [x] 4.1 First-screen create: required text Material do Caso, required Tribunal dropdown from the API coverage list, optional Juiz/Órgão, no Polo, no PDF, and verify missing text or tribunal does not insert a row
- [x] 4.2 Infer Tema (product list) and Pedido via AgentPort, show confirm/edit UI, and verify no Dossiê job starts before confirm
- [x] 4.3 Outro path: short name, min length, no clash with product names, creates Escritório Theme, and verify org B does not see that name
- [x] 4.4 Reopen a Caso for the same Escritório with material, confirmed Tema/Pedido, and later Dossiê/Petição slots, and verify that load succeeds

## 5. Agent port, coverage, ingest, validators

- [x] 5.1 `AgentPort` plus infer/dossier/petition JSON schemas and Cursor adapter (`wait()`, explicit `apiKey`, `CursorAgentError`), and verify unit tests use a fake port (CI has no Cursor key)
- [x] 5.2 SQL candidate retrieval (Tema + Tribunal + optional Juiz/Órgão, recent-first, cap ~30) and verify a count `>= 5` does not call the jurisprudence API
- [x] 5.3 Coverage miss (`< 5`): call Jurisprudências.ai with the same constraints, upsert Julgamentos by `contentHash` into the global pool, and verify a Dossiê Precedente is never an unpersisted API payload
- [x] 5.4 When the API throws or returns nothing, still build the Dossiê from local matches with thin/empty warning, and verify the request is not a hard error
- [x] 5.5 Citation validator (allowlist ids, excerpt substring, invented numbers stripped/hypothesis) and verify a lying fake agent cannot persist an unknown case number as jurisprudence
- [x] 5.6 If spike 1.3 failed, HTTP Cloud Agents adapter behind the same port, and verify tests still fake the port

## 6. Cited dossier

- [x] 6.1 Generate a Dossiê snapshot from post-ingest SQL + agent JSON + validator, 5–15 when possible, and verify identities come from stored Judgment fields
- [x] 6.2 Padrão do órgão (câmara if matched, else Tribunal); if Juiz name is absent or unmatched, verify no personal-pattern claim
- [x] 6.3 Classify supporting / opposing / dissent against the confirmed Pedido when results mix, and verify that split is visible
- [x] 6.4 Zero matches → empty Dossiê with explicit empty copy and no case-law pattern, and verify zero Precedentes
- [x] 6.5 Second generation creates a new snapshot (not a silent overwrite) and verify the previous snapshot is not the current citável set
- [x] 6.6 UI shows retrieve / ingest / analyze until `wait()` completes and verify reload shows the saved current Dossiê

## 7. Anchored petition

- [x] 7.1 Generate petição inicial from Caso + current Dossiê only, with anchors, and verify every jurisprudence assertion traces to a stored case number in that Dossiê
- [x] 7.2 Empty Dossiê → petition with disclaimer and no jurisprudence, and verify invented cites from a fake agent are not shown as case law
- [x] 7.3 Unanchored reasoning labeled hypothesis; disclaimer visible on the petition view
- [x] 7.4 New Dossiê marks the previous Petição stale and verify it is not presented as citing the new snapshot; generate-again produces a new Petição

## 8. Docs and quality gates

- [x] 8.1 README stack uses Cursor SDK (`@cursor/sdk`); `docs/fontes-de-dados.md` matches ingest-on-miss then local Dossiê; landing “IA” copy unchanged; and verify AI Gateway is not described as the runtime
- [x] 8.2 `pnpm lint` and `pnpm build` succeed with provisioned env vars
- [x] 8.3 Automated tests cover golden rule, `< 5` ingest trigger, `>= 5` skips API, Outro isolation, missing intake fields, and stale petition
- [ ] 8.4 Close Beads `planning-6we` only after a signed-in Advogado can confirm Tema, get a Dossiê, and get an anchored Petição
