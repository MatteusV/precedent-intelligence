# theme-corpus Specification

## Purpose

Stores a shared pool of published judgments, grouped by Tema, so matching and work product cite only persisted acts — including rows filled from a jurisprudence API when local coverage is thin.

## Requirements

### Requirement: A Julgamento is one published act in a global pool

Each Julgamento SHALL represent one published decision (not one lawsuit), with Tribunal, case number, date, organ, citable text, source provenance, and a unique content hash. The same court file MAY have several Julgamentos. The pool SHALL be shared across Escritórios. A Julgamento without a case number MUST NOT be treated as citable case law. Two payloads with the same content hash SHALL not create a second citable row.

#### Scenario: Two acts on one process
- **WHEN** a sentença and an acórdão share a case number but differ in date or organ or content hash
- **THEN** the system stores two Julgamentos

#### Scenario: Duplicate hash
- **WHEN** an ingest would insert a Julgamento whose content hash already exists
- **THEN** the system keeps a single citable row for that hash

### Requirement: Product Temas are a short named list; Outro Temas belong to the Escritório

The system SHALL ship a handful of product-named Temas (recorte names, not a CNJ taxonomy). Those names exist even if some have no seed. An Outro path SHALL let an Escritório create a named Tema scoped to that Escritório. Product Temas are global; Outro Temas are not.

#### Scenario: Empty product recorte still has a name
- **WHEN** the Advogado confirms a product Tema that has zero stored Julgamentos for the chosen Tribunal
- **THEN** that Tema is a valid confirmed recorte and Cobertura is a miss (API ingest MAY run)

### Requirement: Request-time API ingest is allowed only on coverage miss and only persist-then-cite

When the filtered local set for a confirmed Caso has fewer than five Julgamentos (Tema + Tribunal + optional Juiz + optional Órgão), the system MAY call a jurisprudence API using those same constraints, persist hits as Julgamentos, then use only persisted rows in the Dossiê. The system MUST NOT present an API payload as a Precedente before it is stored. When five or more local matches exist, the system MUST NOT call a jurisprudence API for that Dossiê request.

#### Scenario: Thin local set triggers ingest
- **WHEN** a confirmed Caso has two matching stored Julgamentos
- **THEN** the system MAY search the API, persist new acts, and only then list Precedentes from storage

#### Scenario: Thick local set skips the API
- **WHEN** a confirmed Caso has at least five matching stored Julgamentos
- **THEN** the Dossiê is built from those rows and the system MUST NOT call a jurisprudence API for that request

### Requirement: Seed exists so a happy path can run without the API

The system SHALL seed at least one product Tema with tens of publicly identifiable Julgamentos for at least one Tribunal on the supported court list, with at least two rapporteurs and two results, so a typical Caso on that Tema+Tribunal can reach five matches without an API call.

#### Scenario: Fresh environment after seed
- **WHEN** the seed has been applied to an empty database
- **THEN** at least one product Tema has multiple citable Julgamentos on one supported Tribunal
