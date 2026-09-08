## Why

Opening an already-stored Caso on `/app/casos/[id]` is slow because the page load pulls far more from Postgres than the screen paints — full Julgamento rows (`rawText` included), petition anchors, and every historical Dossiê/Petição. Repeat visits still hit the database: there is no cross-request cache, and `createCaseAction` does not invalidate the pauta at all.

## What Changes

- The office reopen query for a Caso loads only the current snapshot the UI shows: case fields, current Dossiê (precedents with identity/excerpt, not judgment `rawText`), current Petição (status, disclaimer, sections). Historical Dossiê/Petição lists and unused anchors stay out of that read.
- Cached office reads for the pauta/rail list and the Caso detail, keyed and tagged per Escritório (and per Caso where needed), so a later open of the same matter does not round-trip Neon.
- Mutations that change list or detail (create, confirm, generate Dossiê, generate Petição, hide) immediately invalidate those tags so the next view is not stale.
- Auth stays outside the cache. Cache Components is enabled so `'use cache'` / `cacheTag` / `updateTag` work; `force-dynamic` on `/app` is removed.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `case-intake`: Reopening a live Caso SHALL load the current displayed snapshot only; after a mutation that changes the pauta or that Caso, the next list or reopen SHALL show the new state.
- `office-auth`: Cached office reads SHALL stay isolated per Escritório. A member of A MUST NOT be served B's cached case list or case detail.

## Impact

- **Config**: `cacheComponents: true` in `next.config.ts`; drop `dynamic = "force-dynamic"` from `src/app/app/layout.tsx`; ClerkProvider / auth holes wrapped in Suspense as required by Cache Components.
- **Server**: Slim `getCaseForOffice` (and keep `listCasesForOffice` lean). `'use cache'` on those reads with `cacheTag`; `updateTag` in `src/app/actions/case-actions.ts` instead of relying on `revalidatePath` alone. `createCaseAction` must invalidate the list.
- **App**: Case detail and confirm pages keep the same UI; they consume the slimmer payload. Office layout still lists cases for the rail.
- **Tests**: Slim include/select (no `rawText` / history on reopen); tag invalidation after create/confirm/generate/hide; wrong-org id does not read another Escritório's cache.
- **Out of scope**: Speeding up Dossiê/Petição *generation* (agent/LLM). Caching the shared Julgamento corpus. `'use cache: remote'`. Restore of hidden cases. Changing what the case page displays.
