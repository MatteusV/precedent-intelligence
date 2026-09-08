## ADDED Requirements

### Requirement: Reused office reads stay isolated per Escritório

When the system reuses a previously prepared office read (Escritório case list or Caso reopen), it SHALL still scope that payload to the authenticated Advogado's Escritório. A member of Escritório A MUST NOT receive Escritório B's case list or Caso reopen payload, including when B's payload was prepared earlier and is still available to reuse.

#### Scenario: Reused case of another Escritório
- **WHEN** Escritório B's Caso has already been opened and a member of Escritório A requests the same Caso identifier
- **THEN** the system MUST NOT return B's Material do Caso, Dossiê, or Petição

#### Scenario: Reused pauta of another Escritório
- **WHEN** Escritório B's case list has already been prepared and a member of Escritório A opens the case list
- **THEN** the system MUST NOT include B's Casos in A's list
