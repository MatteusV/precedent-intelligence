# The Advogado must name the Tribunal

Intake requires a Tribunal from a closed dropdown of courts the primary jurisprudence API covers. Matching, Padrão do órgão, and API fallback all use that court — we do not default to TJSP, accept free text, or search every tribunal at once. The seed can still start with one court so the happy path works without an API call; that is bootstrap data, not the product rule.

**Considered Options**: implicit TJSP; search any court the API returns; free-typed court; required Tribunal from the API coverage list — chosen.
