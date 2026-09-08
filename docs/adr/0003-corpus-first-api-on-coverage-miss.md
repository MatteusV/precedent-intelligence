# Corpus first; API when fewer than five local matches; persist before cite

The Advogado describes a Caso in text, names a Tribunal, confirms the inferred Tema, and we query the local corpus. SQL runs first, after Tema + Tribunal + optional Juiz/Órgão. If fewer than five stored Julgamentos match, we search a jurisprudence API for the same constraints, persist hits as Julgamentos, then build the Dossiê. If the API fails or adds nothing, we still generate a Dossiê with whatever local matches exist and an honest thin/empty warning — not a hard error. The Dossiê and Petição still cite only persisted rows. Client PDFs are Material do Caso but not in this MVP.

**Considered Options**: corpus-only empty/thin dossier; live API every request; API only when the Tema partition is empty. Chosen: API also when the filtered local set has fewer than five matches, because a known Tema with a rare judge/câmara is still “we don’t have the acervo for this Caso.”
