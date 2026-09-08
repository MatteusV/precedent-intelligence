## ADDED Requirements

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
