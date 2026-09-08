## Context

See `proposal.md` for motivation. Reopen today is `getCaseForOffice` in `src/server/case/case-service.ts`: one `findFirst` with `theme`, `currentDossier.precedents.judgment` (full Julgamento, including `rawText`), `currentPetition.anchors`, plus `dossiers[]` and `petitions[]` history. The detail page (`src/app/app/(office)/casos/[id]/page.tsx`) only paints current snapshot fields; `DossierPanel` needs `judgment.caseNumber`, not `rawText`. Confirm uses the same loader and needs even less. The office layout and `/app` both call `listCasesForOffice`, which is already lean and wrapped in React `cache()` (same-request only). Mutations in `src/app/actions/case-actions.ts` call `revalidatePath`; `createCaseAction` does not. `/app/layout.tsx` sets `dynamic = "force-dynamic"`. Next is 16.3.4; `cacheComponents` is off. Clerk `auth()` cannot run inside `'use cache'`. Soft-delete (`deletedAt` / `liveCaseWhere`) stays the live predicate.

## Goals / Non-Goals

**Goals:**

- One slim reopen query that satisfies detail and confirm without historical generations or Julgamento body text.
- Cross-request cache for that reopen and for the pauta/rail list, keyed by Escritório (and Caso id), with immediate invalidation on the existing server actions.
- Cache Components on so `'use cache'` / `cacheTag` / `updateTag` work, without putting `auth()` inside a cached function.

**Non-Goals:**

- Faster Dossiê/Petição generation (`generate-dossier.ts` may still load full Julgamento for citation checks).
- Caching the shared Julgamento corpus or `'use cache: remote'`.
- Changing the case page UI or adding a history browser.
- Prisma middleware.

## Decisions

### 1. Slim `getCaseForOffice` with Prisma `select`, keep one function

Replace the fat `include` with an explicit `select` that covers both `/casos/[id]` and `/casos/[id]/confirmar`: case scalars, `theme.name`, `currentDossier` (pattern fields + precedents with `stance`, `excerpt`, `sortOrder`, `judgment.caseNumber` only), `currentPetition` (`status`, `disclaimer`, `sections`). Drop `dossiers`, `petitions`, `anchors`, and every unused Julgamento column.

Alternative: two loaders (confirm vs detail). Rejected — confirm is a subset; one select avoids a second query shape and a second cache entry.

Do not slim `generateDossierForCase` / `generatePetitionForCase` in this change; those are write paths and may still need `rawText` for validation.

### 2. Enable Cache Components; remove `force-dynamic`

Set `cacheComponents: true` in `next.config.ts`. Remove `export const dynamic = "force-dynamic"` from `src/app/app/layout.tsx` (the old segment config fights the new model). Wrap `ClerkProvider` in `Suspense` at the root layout (Clerk's Cache Components requirement). Keep `auth.protect()` / `requireOfficeContext()` **outside** `'use cache'` and pass `clerkOrgId` (and case id) as arguments so they join the cache key.

Alternative: `'use cache: private'` so cookies/auth can be read inside the cache. Rejected — office data is scoped to the Escritório, not the browser; members of the same org should share a server cache keyed by `clerkOrgId`, not `clerkUserId`.

### 3. `'use cache'` on the two office reads, tagged per tenant

```
listCasesForOffice(clerkOrgId)
  cacheTag office:{orgId}:cases

getCaseForOffice(legalCaseId, clerkOrgId)
  cacheTag office:{orgId}:cases, office:{orgId}:case:{id}
```

`cacheLife('minutes')` plus mutation-time invalidation. Longer profiles are unnecessary: the pain is repeat opens in a session, and a missed tag should expire soon.

Replace the React `cache()` wrapper on `listCasesForOffice`; `'use cache'` already dedupes the layout+page pair by arguments.

Tags and arguments stay identifiers only (`clerkOrgId`, case id). Do not put Material do Caso, Pedido, or session tokens in keys or tags.

### 4. `updateTag` on every case mutation, including create

Inside the existing server actions, after a successful write, call `updateTag` (read-your-own-writes) rather than relying on `revalidatePath`:

| Action | Tags |
|---|---|
| `createCaseAction` | `office:{org}:cases` (and the new case id if available before redirect) |
| `confirmCaseAction` | cases + `office:{org}:case:{id}` |
| `generateDossierAction` | cases + case (rail stages + detail) |
| `generatePetitionAction` | cases + case |
| `hideCaseAction` | cases + case |

`revalidatePath` may remain as a belt-and-suspenders during the cutover; `updateTag` is the contract that satisfies the freshness spec. Create **must** invalidate the list — that is a current hole.

Do not call `updateTag` from `generate-dossier.ts` itself; keep invalidation in the server-action boundary.

### 5. Tests assert payload shape and freshness, not framework internals

- Reopen select: mock or integration assertion that the page loader does not request `rawText`, `anchors`, or historical `dossiers`/`petitions`.
- Isolation: cached read for org A is not returned for org B (same case id or list).
- Actions: after create/confirm/generate/hide, the tagged reads are invalidated (`updateTag` called with the org-scoped tags). Prefer asserting the action's invalidation plus a follow-up read, not Next internals.

## Risks / Trade-offs

- **[Risk] Enabling `cacheComponents` makes uncached async work a dynamic hole; missing Suspense around `auth()` / ClerkProvider fails prerender** → Mitigation: wrap `ClerkProvider`; keep existing `(office)/loading.tsx`; verify `next build` in quality gates.
- **[Risk] Stale pauta after create if `createCaseAction` still skips invalidation** → Mitigation: treat create as a first-class `updateTag` in tasks and tests.
- **[Risk] Cache key omits `clerkOrgId` and two escritórios collide** → Mitigation: org id is a required argument of both cached functions; isolation spec + test.
- **[Trade-off] Current Dossiê/Petição JSON still sits in the server cache** → Accept for this change. Keys/tags are ids only. Corpus-wide or private cache is out of scope.
- **[Trade-off] First open after miss still hits Neon** → Accept. Slim select makes that miss cheap; cache is for the reopen.

## Migration Plan

1. Slim `getCaseForOffice`; keep pages compiling against the narrower type.
2. Enable `cacheComponents`, remove `force-dynamic`, wrap ClerkProvider.
3. Add `'use cache'` + tags; switch actions to `updateTag`.
4. Tests + `pnpm test` / `pnpm lint` / `next build`.
5. Rollback: revert the flag and cache directives; the slim select can stay.

## Open Questions

- None. Corpus caching and generation latency are later changes.
