## ADDED Requirements

### Requirement: Member can hide a Caso of their Escritório

The system SHALL let an authenticated member of an Escritório hide a live Caso that belongs to that Escritório. Hide SHALL record a deletion time on the Caso and MUST NOT remove the database row, MUST NOT destroy attached Dossiê or Petição rows, and MUST NOT change stored Julgamentos or Tema names. The system MUST NOT hide the Caso until the member confirms the action. After a successful hide, the member SHALL be returned to the Escritório case list. The system MUST NOT provide a restore, trash, or undo path in this version.

#### Scenario: Member hides own Escritório case
- **WHEN** a member confirms hide on a live Caso of their Escritório
- **THEN** that Caso MUST NOT appear in the Escritório case list and MUST NOT be reopenable by id, and any Dossiê or Petição that belonged to it MUST NOT be shown as another Caso's work product

#### Scenario: Hide requires confirmation
- **WHEN** a member activates hide without confirming
- **THEN** the system MUST NOT record a deletion time on the Caso

#### Scenario: Hidden case is not found
- **WHEN** a member requests a Caso identifier that belongs to their Escritório and has been hidden
- **THEN** the system MUST NOT return that Caso's Material do Caso, Dossiê, or Petição

#### Scenario: Member cannot hide another Escritório's case
- **WHEN** an authenticated member of Escritório A confirms hide on a Caso identifier that belongs to Escritório B
- **THEN** the system MUST NOT record a deletion time on B's Caso and MUST NOT return B's Material do Caso, Dossiê, or Petição

### Requirement: Hidden Casos are excluded from live office work

Every list of Casos for an Escritório, every reopen of a Caso, and every confirm or generate action on a Caso SHALL consider only Casos that have not been hidden. A hidden Caso SHALL be treated as unknown for those operations.

#### Scenario: Pauta omits hidden cases
- **WHEN** a member opens the Escritório case list after hiding a Caso
- **THEN** the hidden Caso MUST NOT appear in that list

#### Scenario: Confirm or generate on a hidden case fails
- **WHEN** a member submits confirm, Dossiê generation, or Petição generation for a hidden Caso of their Escritório
- **THEN** the system MUST NOT change Tema, Pedido, Dossiê, or Petição of that Caso

## MODIFIED Requirements

### Requirement: Stored cases can be reopened by the same Escritório

The system SHALL let a member retrieve a live Caso of their Escritório, including Material do Caso, confirmed Tema and Pedido, and any Dossiê or Petição attached. A hidden Caso of that Escritório MUST NOT be retrieved.

#### Scenario: Member reopens own Escritório case
- **WHEN** a member requests a Caso identifier that belongs to their Escritório and has not been hidden
- **THEN** the system shows the stored matter and any existing Dossiê or Petição

#### Scenario: Member requests a hidden own case
- **WHEN** a member requests a Caso identifier that belongs to their Escritório and has been hidden
- **THEN** the system MUST NOT show the stored matter or any Dossiê or Petição
