## Purpose

Gives an Advogado a signed-in Escritório and keeps Casos, Dossiês, Petições, and Outro theme names private to that Escritório.

## ADDED Requirements

### Requirement: Public marketing remains reachable without authentication

The system SHALL keep the public marketing home page reachable without a session so an unauthenticated visitor can read the product pitch.

#### Scenario: Visitor opens the home page
- **WHEN** an unauthenticated visitor requests the marketing home page
- **THEN** the system returns the landing content and MUST NOT redirect them to sign-in

### Requirement: Product routes require an authenticated Escritório member

The system SHALL require an authenticated Advogado who belongs to an Escritório before exposing intake, dossiers, or petitions. An unauthenticated request to a product route SHALL be sent to sign-in.

#### Scenario: Signed-out user opens a product route
- **WHEN** an unauthenticated visitor requests a product route
- **THEN** the system sends them to sign-in and MUST NOT show another Escritório's data

#### Scenario: Signed-in member opens a product route
- **WHEN** an authenticated Advogado who belongs to an Escritório requests a product route
- **THEN** the system shows the product surface for that Escritório

### Requirement: User can sign in and sign out

The system SHALL provide sign-in and sign-out. After sign-out, subsequent product-route requests SHALL behave as unauthenticated.

#### Scenario: Member signs out
- **WHEN** an authenticated member signs out and then requests a product route
- **THEN** the system treats the request as unauthenticated and sends them to sign-in

### Requirement: Work product and Outro names are isolated per Escritório

The system SHALL scope Casos, Dossiês, Petições, and Outro-created Tema names to the Escritório of the authenticated Advogado. A member of Escritório A MUST NOT read or mutate Escritório B's records or see B's Outro names. Stored Julgamentos MAY be visible as corpus matches when they belong to the confirmed Tema (product Temas are shared; Outro Temas only match for the owning Escritório).

#### Scenario: Member requests another Escritório's case
- **WHEN** an authenticated member of Escritório A requests a Caso identifier that belongs to Escritório B
- **THEN** the system MUST NOT return B's Material do Caso, Dossiê, or Petição

#### Scenario: Outro name does not leak
- **WHEN** Escritório A has created an Outro Tema name
- **THEN** Escritório B's confirmation list MUST NOT include that name
