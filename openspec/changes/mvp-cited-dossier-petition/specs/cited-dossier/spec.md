## Purpose

Turns a confirmed Caso plus persisted Julgamentos into a frozen Dossiê: Padrão do órgão and a short list of real, identifiable Precedentes.

## ADDED Requirements

### Requirement: Dossiê is built only from persisted Julgamentos after coverage logic

The system SHALL select stored Julgamentos matching the confirmed Tema, Tribunal, and any Juiz/Órgão filters. If fewer than five match, ingest MAY run first (see theme-corpus). Every listed Precedente MUST be a stored Julgamento. The system MUST NOT invent a case number, ementa, excerpt, or result. Excerpts MUST come from that Julgamento's stored text.

#### Scenario: Precedents resolve to stored acts
- **WHEN** a Dossiê is generated
- **THEN** each listed Precedente's identity corresponds to a stored Julgamento and each excerpt is taken from that row's stored text

### Requirement: Five to fifteen Precedentes when coverage allows; honesty when it does not

When at least five stored Julgamentos match after ingest, the Dossiê SHALL include between five and fifteen of them. When fewer than five remain after ingest (including API failure or empty API), the system SHALL list every remaining match, tell the Advogado that Cobertura is thin or empty, and MUST NOT pad with invented decisions or fail the request solely because the API failed.

#### Scenario: Enough matches
- **WHEN** at least five stored Julgamentos match after any ingest
- **THEN** the Dossiê contains between five and fifteen identifiable Precedentes

#### Scenario: API fails with two local matches
- **WHEN** two stored Julgamentos match and the jurisprudence API fails or adds nothing
- **THEN** the Dossiê lists those two, states thin coverage, and is still generated

#### Scenario: Zero matches
- **WHEN** no stored Julgamento matches after any ingest
- **THEN** the Dossiê contains zero Precedentes and states that no matching precedent was found, with no pattern presented as case law

### Requirement: Pattern is Padrão do órgão, not a fake personal judge profile

The Dossiê SHALL include a historical pattern for the Órgão: the named câmara/turma when it exists on listed Julgamentos, otherwise the Caso's Tribunal. Pattern statements MUST be grounded in the listed stored Julgamentos. If no Juiz was named, or the name did not match stored Julgamentos, the Dossiê MUST NOT present a rapporteur-specific pattern as known.

#### Scenario: Named judge missing from corpus
- **WHEN** the Caso includes a Juiz name that does not appear on matching stored Julgamentos
- **THEN** the Dossiê states the Padrão do órgão for the Tribunal or câmara and MUST NOT claim a personal pattern for that name

#### Scenario: Mixed results at the organ
- **WHEN** listed Julgamentos include both favorable and unfavorable results relative to the confirmed Pedido
- **THEN** the Dossiê states that split and classifies Precedentes as supporting, opposing, or dissenting

### Requirement: A Dossiê is a snapshot

Generating a Dossiê SHALL freeze the Precedentes of that generation. Generating again SHALL produce a new Dossiê, not a silent overwrite of the previous snapshot.

#### Scenario: Second generation
- **WHEN** the Advogado generates a Dossiê again for the same Caso
- **THEN** a new Dossiê snapshot exists and the previous snapshot is not silently replaced as the current citável set
