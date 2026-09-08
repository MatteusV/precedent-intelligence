## Context

See `proposal.md` for motivation and `CONTEXT.md` plus `docs/adr/0001`–`0008` for ubiquitous language. The repo is still a Next.js 16 marketing site. This design replaces the first MVP plan (single locked theme, no request-time API). Constraints that remain: one Next.js app, Neon + Prisma, Clerk organizations, Cursor TypeScript SDK (`@cursor/sdk`) instead of AI SDK / Gateway, Node 22.13+.

## Goals / Non-Goals

**Goals:**

- Intake: text + required Tribunal → infer Tema and Pedido → confirm (including Outro) → coverage SQL → optional API ingest → snapshot Dossiê → anchored Petição.
- Golden rule enforced in application code after every agent draft.
- Global Julgamento pool; tenant isolation for Caso / Dossiê / Petição / Outro names.
- Tests that never need `CURSOR_API_KEY` or a live jurisprudence API.

**Non-Goals:**

- Client PDF (Material do Caso as file) — next change.
- DataJud, Cron, Blob judgment ingest, pgvector, billing, gabinete.
- Cloud Cursor agents that clone this git repo.
- Admin UI to edit the product Tema list (ship as config).

## Decisions

### 1. Provision Neon and Clerk from Vercel Marketplace; Cursor and jurisprudence API as env keys

Neon + Clerk via `vercel integration add`, then `vercel env pull`. `CURSOR_API_KEY` from the Cursor dashboard. Jurisprudências.ai key from that product (primary jurisprudence API per `docs/fontes-de-dados.md`). No mock database or fake Clerk.

### 2. Data model (English identifiers, Portuguese stored legal values)

```
Theme (product: clerkOrgId null; outro: clerkOrgId set)
  1---* JudgmentTheme *---1 Judgment   (global acts)
Office-less tenant key = clerkOrgId on LegalCase, Dossier, Petition, Outro Theme

LegalCase 1---* Dossier (snapshots) 1---* DossierPrecedent *---1 Judgment
LegalCase 1---1 current pointer or ordered snapshots; current Petição  *---* PetitionAnchor
```

`Judgment`: `tribunal`, `organ`, `rapporteur`, `caseNumber`, `judgmentDate`, `result`, `holding`, `ementa`, `grounds`, `operativePart`, `rawText`, `source`, `externalId`, `sourceUrl`, `fetchedAt`, `contentHash` @unique, `ingestionStatus`, `deletedAt`. Identity of the act is tribunal + caseNumber + date + organ; dedup is `contentHash`.

`LegalCase`: `clerkOrgId`, `clerkUserId`, `materialText`, `claim` (confirmed Pedido), `themeId` (confirmed), `tribunal` (enum/slug from API coverage list), optional `judgeName`, optional `organName`, `status`.

`Theme`: `slug`, `name`, `kind` (`product` | `outro`), `clerkOrgId` nullable, unique `(slug, clerkOrgId)` with product rows using `clerkOrgId = null`.

Product list (config, 3–7 names; exact labels tunable at apply): start with **dano moral em relação de consumo** (seeded), **tutela de urgência em saúde**, plus three further named recortes in the same style — not CNJ codes. Seed tens of real public TJSP (or first seeded tribunal) acts only for consumer moral damages so the no-API path works.

### 3. Flow

```
  Text + Tribunal [+ Juiz] [+ Orgao]
            |
            v
  AgentPort infers Tema (product list) + Pedido
            |
            v
  Confirm screen: list | Outro name | edit Pedido
            |
            v
  SQL count/match (Tema + Tribunal + filters)
            |
            +-- >= 5 --> skip API
            +-- <  5 --> Jurisprudencias.ai --> upsert Judgment by hash
            |
            v
  AgentPort dossier JSON from SQL allowlist --> validator --> persist Dossier snapshot
            |
            v
  AgentPort petition from Caso + that Dossier --> validator --> persist Petition
```

If API errors or adds zero rows, continue with local matches and thin/empty copy.

### 4. Cursor SDK behind AgentPort

Local runtime, explicit `apiKey`, `wait()`, `CursorAgentError` vs `result.status`. `settingSources: []`. Three prompt kinds: infer, dossier JSON, petition JSON. Fake port in tests. If native binaries fail on Vercel Linux, HTTP Cloud Agents adapter with inlined text — same port (spike in tasks).

### 5. Citation and coverage validators

After dossier/petition JSON: keep only `judgmentId`s in the SQL allowlist (post-ingest). Excerpts must be substrings of stored text. Unknown case numbers stripped or labeled hypothesis. Empty dossier → petition template with disclaimer and zero jurisprudence.

Coverage count uses the same filters as SQL (Q15 B). `< 5` is the only request-time API trigger.

### 6. Next.js 16 `proxy.ts` + Clerk organizations

`src/proxy.ts` guards product routes; `/` public. `ClerkProvider` in `<body>`. No org → no intake. Outro `Theme.clerkOrgId` = active org.

### 7. Tribunal vocabulary

Closed dropdown of courts Jurisprudências.ai documents as covered (TJs, STJ, TRFs, etc.). Stored as stable slugs. No free text.

### 8. Docs

README stack bullet → Cursor SDK. `docs/fontes-de-dados.md` extraction label → Cursor SDK; request path may call the API **only** as ingest-on-miss, then local Dossiê. Landing “IA” copy stays. Domain: `CONTEXT.md`, ADRs.

## Risks / Trade-offs

- **[Risk] `< 5` fires API often for rare Juiz names** → Mitigation: persist and share Julgamentos globally so the next Escritório warms; still a cost spike — monitor.
- **[Risk] Outro labels are messy** → Mitigation: office-scoped + min length + no product-name clash (ADR 0006).
- **[Risk] Agent infers the wrong Tema** → Mitigation: confirm step (ADR 0005).
- **[Risk] SDK binaries on Vercel** → Mitigation: AgentPort HTTP fallback.
- **[Risk] API ToS / rate limits** → Mitigation: skip API when `>= 5`; seed happy path; thin dossier if API fails.
- **[Trade-off] Padrão do órgão vs “este juiz”** → ADR 0001; first-instance sentenças later.

## Migration Plan

1. Provision Neon, Clerk, env keys; migrate; seed one Tema.
2. Auth + intake + confirm.
3. Coverage SQL + ingest + dossier + petition + validators.
4. Update README / fontes-de-dados.
5. Rollback: revert deploy. No production tenants.

## Open Questions

- Exact wording of the 3–7 product Tema names beyond the seeded consumer-moral-damages recorte (config at apply; count must stay a handful).
- Whether the first Vercel deploy needs the HTTP Cursor adapter (spike, not a spec fork).
