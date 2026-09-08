# MVP matches the court, not a named first-instance judge

The product pitch says “this judge, this claim.” For the MVP we still generate a petição inicial, but the corpus is acórdãos (second instance). A first-instance trial judge is not the relator of those acórdãos, so the dossier states the **Padrão do órgão**: câmara/turma when the Advogado supplied one that exists in the corpus, otherwise the **Tribunal named on the Caso**. The UI still shows an optional Juiz field, with copy that the name only filters when it already exists on a stored Julgamento; otherwise it must not pretend a personal pattern is known.

**Considered Options**: (A) court-level pattern + optional name filter — chosen; (B) change the work product to an appeal aimed at a known relator; (C) seed first-instance sentenças so “this judge” is literal. A is reversible later when a first-instance corpus exists; C blocks the MVP on data we do not have.
