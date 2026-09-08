# Julgamentos are a shared pool; work product is not

A published acórdão is not tenant data. One `contentHash` is one Julgamento for every Escritório. Product-Tema matching reads that pool. An Escritório-scoped Outro Tema only affects which of those rows that office’s Dossiê may select. Casos, Dossiês, Petições, and Outro names stay on the Escritório. Per-office copies of the same act would multiply API cost and break dedup; private-only API hits would keep the seed cheap and the fallback expensive forever.
