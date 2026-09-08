## Why

The escritório pauta only grows. An Advogado can create, confirm, and reopen Casos, but cannot take a draft, a test, or a finished matter off the roll. That clutter is already in the way of daily use.

## What Changes

- A member of the Escritório can hide a Caso from the product: pauta, case rail, and case routes.
- Hide is a timestamp on the Caso (`deletedAt`). Rows stay in the database. There is no restore, trash, or undo in this change.
- Listing and opening a Caso ignore hidden rows. A hidden identifier behaves like an unknown id (not found), including for confirm and generate actions.
- The action lives on the Caso detail, behind a confirmation. After success, the member returns to the pauta.
- Julgamentos and Tema names are untouched. Dossiê and Petição rows stay attached to the hidden Caso and are unreachable through the product.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `case-intake`: Stored Casos of an Escritório can be hidden by a member; hidden Casos MUST NOT appear in lists or reopen.

## Impact

- **Data**: Prisma `LegalCase.deletedAt`; new migration. No cascade delete. `Judgment.deletedAt` is unchanged.
- **Server**: `case-service` list/get/confirm and dossier/petition generation must treat `deletedAt: null` as the live set. New hide action + server action.
- **App**: destructive control on `/app/casos/[id]`; revalidate pauta and office layout; redirect to `/app`.
- **Tests**: hide own Caso; hidden Caso absent from list and detail; other Escritório cannot hide; Julgamentos remain.
- **Out of scope**: restore UI, hard delete, purge/LGPD window, delete on the pauta row, roles beyond Escritório membership.
