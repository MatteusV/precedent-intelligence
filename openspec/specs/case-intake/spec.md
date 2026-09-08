# case-intake Specification

## Purpose

Lets an Advogado describe a Caso in text, name the Tribunal, and confirm the inferred Tema and Pedido before any Dossiê is generated.

## Requirements

### Requirement: First screen captures Material do Caso and court context

The system SHALL accept a new Caso from an authenticated Escritório member with required Material do Caso as text and a required Tribunal chosen from the closed list of supported courts. Juiz and Órgão MAY be supplied. The system MUST NOT require a PDF in this version. The client Polo SHALL be author; the system MUST NOT show a Polo field.

#### Scenario: Valid first screen
- **WHEN** an Advogado submits text Material do Caso and a Tribunal from the supported list
- **THEN** the system stores a Caso for that Escritório and proceeds to inference, not to Dossiê generation

#### Scenario: Missing material or tribunal
- **WHEN** an Advogado submits without text or without a Tribunal from the list
- **THEN** the system rejects the submission and MUST NOT create a Caso

### Requirement: Tema and Pedido are inferred then confirmed

After the first screen, the system SHALL infer a product Tema and a Pedido from the Material do Caso and SHALL show them for confirmation. The Advogado SHALL confirm, pick another product Tema, or choose Outro and supply a short name (minimum length, not duplicating a product Tema name). The Advogado SHALL be able to edit the Pedido on that same step. The system MUST NOT generate a Dossiê until Tema and Pedido are confirmed.

#### Scenario: Confirm inferred values
- **WHEN** the Advogado accepts the inferred Tema and Pedido
- **THEN** those values are the confirmed Tema and Pedido of the Caso

#### Scenario: Outro names a recorte
- **WHEN** the Advogado chooses Outro and supplies a valid short name
- **THEN** the system creates an Escritório-scoped Tema with that name and uses it as the confirmed Tema

#### Scenario: Skip confirmation
- **WHEN** the Advogado has not confirmed Tema and Pedido
- **THEN** the system MUST NOT generate a Dossiê

### Requirement: Optional Juiz and Órgão are stored for later filters

When supplied, Juiz and Órgão SHALL be stored on the Caso. When omitted, the Caso remains valid.

#### Scenario: Caso without judge
- **WHEN** the Advogado submits a valid Caso with no Juiz
- **THEN** the system stores the Caso and later matching MUST NOT present a rapporteur-specific pattern as if a judge had been named

### Requirement: Stored cases can be reopened by the same Escritório

The system SHALL let a member retrieve a live Caso of their Escritório, including Material do Caso, confirmed Tema and Pedido, and any Dossiê or Petição attached. A hidden Caso of that Escritório MUST NOT be retrieved.

#### Scenario: Member reopens own Escritório case
- **WHEN** a member requests a Caso identifier that belongs to their Escritório and has not been hidden
- **THEN** the system shows the stored matter and any existing Dossiê or Petição

#### Scenario: Member requests a hidden own case
- **WHEN** a member requests a Caso identifier that belongs to their Escritório and has been hidden
- **THEN** the system MUST NOT show the stored matter or any Dossiê or Petição

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

### Requirement: Case reopen presents the current snapshot

When a member reopens a live Caso, the system SHALL present Material do Caso, confirmed Tema and Pedido when they exist, the current Dossiê when it exists (identifiable Precedentes and their stored excerpts), and the current Petição when it exists. The system MUST NOT treat prior Dossiê or Petição generations, unused petition anchors, or the full stored body of a Julgamento as required in order to present that reopen surface. A prior generation MUST NOT be shown as the current Dossiê or Petição.

#### Scenario: Reopen a case that has current dossiê and petição
- **WHEN** a member opens a live Caso whose current Dossiê lists Precedentes and whose current Petição has sections
- **THEN** the system shows that Caso's Material do Caso, Tema, Pedido, current Dossiê (including each Precedente's identity and excerpt), and current Petição

#### Scenario: Prior generations are not the reopen surface
- **WHEN** a Caso has more than one stored Dossiê or Petição generation and a member reopens it
- **THEN** the system shows the current Dossiê and current Petição and MUST NOT present a prior generation as the current work product

### Requirement: Pauta and case reopen reflect the latest mutation

After a member creates a Caso, confirms Tema and Pedido, hides a Caso, or generates a Dossiê or Petição, the next Escritório case list and the next reopen of that Caso SHALL include that mutation. The system MUST NOT present a previous representation of the pauta or of that Caso as if it were still current.

#### Scenario: New case appears on the pauta
- **WHEN** a member creates a Caso and then opens the Escritório case list
- **THEN** that Caso appears in the list

#### Scenario: Generated petição is visible on reopen
- **WHEN** a member generates a Petição for a live Caso and then reopens that Caso
- **THEN** the system shows that Petição as the current Petição

#### Scenario: Generated dossiê is visible on reopen
- **WHEN** a member generates a Dossiê for a live Caso and then reopens that Caso
- **THEN** the system shows that Dossiê as the current Dossiê

#### Scenario: Hidden case is absent from the next pauta
- **WHEN** a member hides a Caso and then opens the Escritório case list
- **THEN** the hidden Caso MUST NOT appear in that list
