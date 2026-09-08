## Purpose

Lets an Advogado describe a Caso in text, name the Tribunal, and confirm the inferred Tema and Pedido before any Dossiê is generated.

## ADDED Requirements

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

The system SHALL let a member retrieve a Caso of their Escritório, including Material do Caso, confirmed Tema and Pedido, and any Dossiê or Petição attached.

#### Scenario: Member reopens own Escritório case
- **WHEN** a member requests a Caso identifier that belongs to their Escritório
- **THEN** the system shows the stored matter and any existing Dossiê or Petição
