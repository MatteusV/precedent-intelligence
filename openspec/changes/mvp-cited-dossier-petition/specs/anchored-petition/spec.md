## Purpose

Drafts an initial petition from the confirmed Caso and one Dossiê snapshot so every jurisprudence claim is anchored, and a newer Dossiê cannot leave the petition citing a set that is no longer current.

## ADDED Requirements

### Requirement: Petition is an initial filing anchored to the current Dossiê

The system SHALL generate an initial petition from the Caso and its current Dossiê. Each jurisprudence assertion SHALL include an anchor to a Precedente in that Dossiê.

#### Scenario: Petition cites only dossier precedents
- **WHEN** a Petição is generated from a Dossiê that contains stored Precedentes
- **THEN** every jurisprudence assertion points at a Dossiê Precedente the Advogado can trace to a stored case number

### Requirement: Golden rule — no case law without a stored Precedente

The system MUST NOT present a statement as jurisprudence unless it is anchored to a stored Julgamento in the current Dossiê. If the generator emits an unanchored case-law claim, the system SHALL strip it or relabel it as hypothesis before the Advogado sees the Petição. A Petição from an empty Dossiê MUST NOT assert case law.

#### Scenario: Generator invents a citation
- **WHEN** the draft text refers to a case number that is not in the current Dossiê
- **THEN** the visible Petição does not present that reference as jurisprudence

#### Scenario: Empty dossier
- **WHEN** the Advogado requests a Petição and the current Dossiê has zero Precedentes
- **THEN** the Petição contains no jurisprudence assertions and states that no stored precedent was available

### Requirement: Unanchored legal reasoning is labeled hypothesis

Legal argument not tied to a Dossiê Precedente SHALL be labeled as hypothesis (or equivalent wording that cannot be mistaken for case law).

#### Scenario: Policy argument without a matching judgment
- **WHEN** the Petição includes reasoning with no matching Dossiê Precedente
- **THEN** that passage is explicitly marked as hypothesis and is not formatted as a citation

### Requirement: Petition includes a disclaimer

Each generated Petição SHALL include a visible disclaimer that the text is assistance grounded in the stored Dossiê, does not guarantee the outcome, and does not replace the Advogado's professional judgment or the court's findings of fact.

#### Scenario: Advogado opens a generated petition
- **WHEN** a member views a generated Petição
- **THEN** the disclaimer is visible without a separate settings screen

### Requirement: A newer Dossiê invalidates the previous Petição

When a new Dossiê snapshot is generated for the Caso, the system SHALL mark any Petição tied to the previous snapshot as stale. The Advogado MUST generate the Petição again against the new Dossiê. The MVP SHALL NOT keep a version history of petitions as current work product.

#### Scenario: Dossier regenerated
- **WHEN** a new Dossiê is generated and a Petição existed for the previous snapshot
- **THEN** that Petição is shown as stale and MUST NOT be presented as citing the new Dossiê
