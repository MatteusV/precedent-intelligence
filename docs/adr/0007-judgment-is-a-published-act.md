# A Julgamento is one published act, not one lawsuit

Identity is Tribunal + case number + date + órgão, with a unique content hash for dedup. Sentença, acórdão, and embargos on the same CNJ file are different Julgamentos. Collapsing to one row per process would drop the very acórdãos the MVP cites. Hash-only identity would lose the citation even when the text is later republished.
