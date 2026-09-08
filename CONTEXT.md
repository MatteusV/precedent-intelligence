# Precedent Intelligence

Ubiquitous language for matching a lawyer's matter to stored court decisions and producing a cited dossier plus an anchored initial petition. Implementation details do not belong here.

## Language

### People and tenancy

**Escritório**:
The tenant. A law firm, including a solo practitioner as a firm of one. Cases, dossiers, and petitions belong to the Escritório.
_Avoid_: account, organization, workspace, cliente

**Advogado**:
A person who belongs to an Escritório and works a Caso.
_Avoid_: user, member, account

### Matter

**Caso**:
The Escritório's matter: Material do Caso, the Pedido, a required Tribunal from a closed list, optional Juiz, optional Órgão. It is not a court lawsuit and need not have a CNJ number. In this MVP the client is always the author; Polo is not an intake field. Tema is inferred from the Caso and then confirmed by the Advogado before a Dossiê is generated.
_Avoid_: processo, matter, file

**Material do Caso**:
The client's problem as text in this MVP. PDFs of contracts, narrative, or drafts are the same concept, deferred to a later change. It is how the system infers Tema and facts. It is not a Julgamento and does not join the corpus.
_Avoid_: upload, attachment, precedente, julgado the lawyer already has, requiring a PDF to create a Caso

**Tema**:
A legal recorte that groups Julgamentos. Product-named recortes are global (a handful, even if some have no seed). Outro-named recortes belong to the Escritório that created them; other offices do not see those names. The system infers a product Tema from the Caso; the Advogado confirms, picks another product recorte, or chooses Outro. A Dossiê is about one confirmed Tema.
_Avoid_: assunto CNJ as the Tema itself, generating a Dossiê on an unconfirmed inference, a global junk list of Outro names

**Outro**:
The confirmation path when the recorte is not on the product list. The Advogado supplies a short name (minimum length, must not duplicate a product Tema). That name becomes an Escritório-scoped Tema. API ingest and the Dossiê attach to it. Ugly-but-legal names are allowed; the damage stays in that Escritório.
_Avoid_: rejecting the Caso, storing Julgamentos with no Tema, publishing Outro names to every Escritório

**Pedido**:
The claim the Advogado wants in this Caso. It is extracted from the Material do Caso and shown on the same confirmation step as Tema, where the Advogado can edit it. A Dossiê and Petição use this confirmed Pedido, not a silent second guess.
_Avoid_: thesis, tese (tese is the holding of a Julgamento), omitting Pedido, requiring a separate Pedido field on the first screen

**Polo**:
The Escritório's client's role in this Caso. In the MVP it is always author. It does not describe parties inside a stored Julgamento and does not filter the corpus.
_Avoid_: polo histórico, side, party, exposing Polo as a form field in the MVP

**Tribunal**:
The court the Advogado names on the Caso. Required, chosen from the closed list of courts the jurisprudence API covers. Corpus matching, Padrão do órgão, and any jurisprudence API call are scoped to this Tribunal.
_Avoid_: assuming TJSP when the Caso did not name it, searching every court at once, free-typed court names

### Corpus

**Julgamento**:
One published judicial decision (one act, not one lawsuit): Tribunal, case number, date, órgão, plus a unique content hash. The same court file may have several Julgamentos. The pool is global across Escritórios; Casos, Dossiês, Petições, and Outro names are not. External API hits become Julgamentos only after they are persisted; they cannot be Precedentes before that.
_Avoid_: precedente, processo, one row per CNJ number, copying the same acórdão per Escritório, citing an API result that was not stored

**Cobertura**:
How many stored Julgamentos match this Caso after Tema, Tribunal, and any Juiz/Órgão filters. Fewer than five is a miss and may trigger API ingest. Zero for that Tema+Tribunal is also a miss.
_Avoid_: calling live search itself a Dossiê, citing API hits that were not persisted

**Precedente**:
A Julgamento selected into a Dossiê for a given Caso. The rest of the corpus is not a Precedente of that Caso.
_Avoid_: calling every Julgamento a precedente

**Órgão**:
The court body used for the Padrão do órgão: a câmara/turma when the Advogado supplied one that exists on stored Julgamentos; otherwise the Caso's Tribunal as a whole.
_Avoid_: vara (first-instance grain is not in the MVP corpus)

**Juiz**:
An optional name on the Caso. It is a filter only when it already appears on a stored Julgamento; otherwise it must not be presented as a known personal pattern.
_Avoid_: treating Juiz as a required field, relator as a separate domain object in the MVP

**Padrão do órgão**:
How that Órgão has decided the recorte of this Dossiê, grounded only in the Julgamentos listed there. It is not a claim about a named first-instance judge unless that name matched the corpus.
_Avoid_: padrão do juiz (unless the name matched), win rate, percentual de vitória

### Work product

**Dossiê**:
A frozen snapshot: the Padrão do órgão plus the Precedentes chosen for one generation of a Caso. A later generation is a new Dossiê, not an edit of the old one.
_Avoid_: pesquisa, relatório, memo, live search

**Petição**:
The generated initial petition anchored to one Dossiê. If a newer Dossiê is generated for the Caso, this Petição is stale and must be generated again; it must not keep citing the old snapshot as current.
_Avoid_: peça (too generic), minuta (gabinete), contestação, keeping version history of petitions in the MVP
