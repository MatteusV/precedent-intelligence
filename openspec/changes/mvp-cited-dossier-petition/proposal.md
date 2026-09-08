## Why

A lawyer still cannot run the product loop: describe a matter, see how *this court* has treated *this recorte*, and leave with a cited dossier plus an anchored initial petition. The first plan locked a single theme and forbade request-time ingest; grilling showed the Advogado arrives with a problem, not a catalog pick, and that a thin local set must be allowed to fill from a jurisprudence API — as long as nothing is cited until it is a stored Julgamento.

## What Changes

- Authenticate Advogados into an Escritório (Clerk organization). Landing stays public. Casos, Dossiês, Petições, and Outro theme names are tenant-scoped.
- Persist a **global** pool of Julgamentos (one published act per row, unique content hash). Product Temas are a short named list (a handful of recortes). Outro-created Temas belong to the Escritório.
- Intake is **text** Material do Caso, a **required Tribunal** from the closed list of courts the jurisprudence API covers, optional Juiz and Órgão. No Polo field (client is always author). No PDF in this change.
- Infer Tema and Pedido from the text; the Advogado **confirms or corrects** them (product list, or Outro with a short name) before any Dossiê is generated.
- Match SQL on confirmed Tema + Tribunal + optional Juiz/Órgão. If fewer than five stored matches, search the jurisprudence API with the same constraints, **persist** hits as Julgamentos, then build the Dossiê. API failure still yields an honest thin or empty Dossiê.
- Dossiê is a **snapshot**. Regenerating creates a new Dossiê and **invalidates** the previous Petição.
- Petição inicial cites only Precedentes in that Dossiê. Golden rule in application code. Disclaimer visible. Pattern is Padrão do órgão, not a first-instance judge, unless the optional name matched the corpus.
- Docs: README stack uses Cursor SDK (`@cursor/sdk`), not AI SDK / Gateway. Domain language lives in `CONTEXT.md` and `docs/adr/`.

Out of scope: client PDF upload, DataJud, Cron refresh, `pgvector`, billing, gabinete/minuta, win-rate, first-instance sentença corpus as the primary matcher.

## Capabilities

### New Capabilities

- `office-auth`: Sign-in, Escritório tenancy, isolation of work product and Outro names.
- `theme-corpus`: Global Julgamento pool, product Temas, Escritório Outro Temas, seed, coverage-triggered ingest, persist-before-cite.
- `case-intake`: Text matter, required Tribunal, infer-then-confirm Tema and Pedido, optional Juiz/Órgão.
- `cited-dossier`: Snapshot dossier from persisted matches; court-level pattern; thin/empty honesty.
- `anchored-petition`: Initial petition anchored to one Dossiê; stale on regeneration; golden rule.

### Modified Capabilities

- (none — `openspec/specs/` is still empty; these remain new deltas)

## Impact

- **App**: public `/`; authenticated product routes; confirm step; case/dossier/petition views. Next.js 16 `proxy.ts`.
- **Data**: Neon + Prisma. Global `Judgment`; tenant `LegalCase`, `Dossier`, `Petition`, Outro `Theme`.
- **Auth**: Clerk organizations = Escritório.
- **AI**: `@cursor/sdk` behind an `AgentPort` (infer Tema/Pedido; draft dossier JSON and petition). Tests fake the port.
- **Ingest**: Jurisprudências.ai (primary) only when Cobertura < 5; never cite the raw payload.
- **Docs**: README, `docs/fontes-de-dados.md`, `CONTEXT.md`, `docs/adr/0001`–`0008`.
- **Beads**: `planning-6we`.
