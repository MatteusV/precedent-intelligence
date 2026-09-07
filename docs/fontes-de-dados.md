# Fontes de dados e APIs

Catálogo das APIs de jurisprudência e dados judiciais usadas (ou descartadas) no **precedent-intelligence**, com o papel de cada uma no produto.

**Ponto-chave:** o produto precisa de **texto citável** (ementa, fundamentos, dispositivo) e de **relator/órgão** para montar o padrão “este juiz, este tema”. Metadado processual sozinho não alimenta o dossiê nem a peça ancorada.

---

## Visão geral da ingestão

```text
Tema escolhido
     │
     ├─► Jurisprudências.ai ──► texto + ementa + trechos  ──┐
     │                                                       │
     ├─► Upload (Vercel Blob) ──► PDF do usuário ────────────┤
     │                                                       ├─► Extração estruturada (IA)
     ├─► Dados Abertos STJ ──► seed em lote (se tema STJ) ─┤       │
     │                                                       │       ▼
     └─► DataJud ──► enriquecimento processual ─────────────┘   Julgamento (Postgres)
                                                                        │
                                                                        ▼
                                                              Dossiê + peça ancorada
```

| Papel no produto | Fonte |
| --- | --- |
| **Primária** — texto de jurisprudência | Jurisprudências.ai |
| **Complementar** — metadado processual | DataJud |
| **Bootstrap** — volume inicial STJ | Dados Abertos STJ |
| **Fallback** — decisões que o usuário já tem | Upload (PDF) |
| **Escala (futuro)** — RAG multi-tribunal | JUIT |

---

## Acervo local: Postgres estruturado (e vetorizado depois)

As APIs externas alimentam o banco. O produto roda **em cima do Postgres** — não busca na API a cada request do usuário.

### Por quê

O produto não é “pesquisar jurisprudência na hora”. É:

1. Manter um **acervo curado por tema** (dezenas de decisões boas).
2. Extrair o **padrão do relator/órgão** sobre esse histórico.
3. Comparar o **caso do usuário** com o que já está gravado.
4. Gerar dossiê e peça com **âncoras reais**.

Isso exige dados **persistidos, estruturados e auditáveis**. Buscar na API em todo clique traz problemas concretos:

| Problema | Impacto |
| --- | --- |
| **Custo** | Jurisprudências.ai tem limites; escala rápido com múltiplos escritórios |
| **Latência** | Dossiê + peça ficam lentos e imprevisíveis |
| **Reprodutibilidade** | A regra “sem precedente no dossiê, não há afirmação” exige saber exatamente o que estava na base naquele momento |
| **Padrão histórico** | “Como *este* relator decide” é agregação SQL sobre histórico, não busca pontual |

**Regra:** API = ingestão e atualização do acervo. Request do advogado = 100% local.

### Fluxo

```text
APIs externas (Jurisprudências.ai, STJ bulk, Upload)
         │
         ▼
   Ingestão (Cron / manual)
         │
         ▼
   Postgres ──► Julgamento estruturado
         │      (+ embedding opcional via pgvector)
         │
         ▼
   Request do usuário (caso + juiz/órgão)
         │
         ▼
   Match no acervo local → dossiê → peça
```

### Estruturado vs vetorizado

São camadas diferentes, com papéis distintos:

| Camada | O que guardar | Para quê |
| --- | --- | --- |
| **Estruturado** (Postgres + Prisma) | tribunal, órgão, relator, data, resultado, tema, ementa, fundamentos, dispositivo, número, fonte, hash do texto | Filtros (“relator X no tema Y”), estatísticas, dossiê citável, auditoria |
| **Vetorizado** (`pgvector`, se precisar) | embedding de ementa, fundamentos ou trechos | Casar **caso do usuário ↔ precedentes** por similaridade semântica dentro do tema |

**v1:** começar só com estruturado + filtros por tema/relator/órgão + IA sobre o texto gravado.

**Depois:** adicionar `pgvector` se o match caso ↔ precedente depender de semântica fina (fatos parecidos, redação diferente) e o SQL sozinho não encontrar os 5–15 precedentes certos.

Não vetorizar “porque é moderno”. Vetorizar quando o filtro estruturado + extração não bastar.

### O que gravar (mínimo)

| Campo / conceito | Motivo |
| --- | --- |
| Texto bruto + campos extraídos | Alimenta dossiê, peça e padrão do juiz |
| `source`, `external_id`, `fetched_at`, URL | Proveniência e rastreio da fonte |
| Hash do conteúdo | Deduplicação; detectar republicação ou alteração na fonte |
| Status de ingestão (`raw` → `structured` → `indexed`) | Saber o que já foi processado e o que falta vetorizar |

Com isso é possível auditar citações e explicar o que entrou em cada dossiê.

### Quando chamar a API externa

| Situação | Chamar API? |
| --- | --- |
| Bootstrap do primeiro tema | Sim |
| Refresh periódico do acervo (Cron) | Sim |
| Gap fill — relator/tribunal ausente na base | Sim |
| Re-fetch — hash do conteúdo mudou | Sim |
| Gerar dossiê para o advogado | **Não** |
| Montar padrão histórico do juiz | **Não** |
| Redigir petição ou minuta | **Não** |

### Resumo

| Pergunta | Resposta |
| --- | --- |
| Ter banco e salvar estruturado? | **Sim, obrigatório** — é o core do produto |
| Vetorizar? | **Sim, mas incremental** — começar sem; adicionar `pgvector` se o match semântico precisar |
| Buscar na API todo request? | **Não** — API = ingestão; produto = Postgres |

Alinhado ao README: fato `Julgamento` e dimensões tema / órgão / juiz / resultado no Neon Postgres; “OLAP” = SQL; `pgvector` só se o SQL não der conta do casamento caso ↔ precedente.

---

## APIs em uso ou planejadas

### Jurisprudências.ai

**Tipo:** comercial com tier gratuito  
**Docs:** [jurisprudencias.ai/api](https://jurisprudencias.ai/api)  
**Papel no produto:** fonte **primária** de jurisprudência no v1.

**O que entrega**

- Busca textual por tema, tribunal, período.
- Lookup por número/identificador.
- Ementa e trechos estruturados (STF, STJ, TST, vários TJs/TRFs, CARF).

**Para que usamos**

1. **Popular o acervo** do tema escolhido via Cron (busca recorrente por palavras-chave do tema).
2. **Obter texto citável** para o dossiê — regra de ouro: sem precedente gravado, não há afirmação de jurisprudência.
3. **Alimentar a extração estruturada** (órgão, relator, resultado, tese, dispositivo, data) que grava o fato `Julgamento`.
4. **Montar o dossiê** com 5–15 precedentes identificáveis por relator/órgão.

**Limitações**

- Limites baixos no free tier; plano pago (~R$ 59,90/mês) para volume de produção.
- Cobertura e qualidade variam por tribunal — validar ao escolher o primeiro tema.

**Quando não usar sozinha**

- Quando o usuário já tem o PDF da decisão → preferir upload.
- Quando precisamos cruzar com número de processo ou movimentações → combinar com DataJud.

---

### DataJud (CNJ)

**Tipo:** oficial / open data  
**Docs:** [datajud-wiki.cnj.jus.br](https://datajud-wiki.cnj.jus.br/api-publica/acesso/)  
**Papel no produto:** fonte **complementar** de metadado processual.

**O que entrega**

- Elasticsearch por tribunal (STJ, TST, TSE, STM, TRFs, TJs, TRTs…).
- Capa do processo, partes, movimentações, classe/assunto.
- Grátis com API key pública.

**O que não entrega**

- Ementa.
- Inteiro teor.
- Fundamentos ou dispositivo citáveis.

**Para que usamos**

1. **Enriquecer** um `Julgamento` já ingerido com número CNJ, classe, assunto, tribunal.
2. **Validar** metadados (órgão, data de movimentação) quando o texto veio de outra fonte.
3. **Cruzar** decisão ↔ processo quando o advogado informa o número.

**Para que não usamos**

- Como única fonte de ingestão — não alimenta tese, fundamentos nem peça ancorada.
- Busca de acórdão por conteúdo — não é o caso de uso do DataJud.

**Lacunas conhecidas**

- STF **não** está na lista oficial de endpoints.
- Relator pode não estar estruturado de forma consistente em todos os tribunais.

---

### Dados Abertos STJ

**Tipo:** oficial / bulk (CKAN)  
**Portal:** [dadosabertos.web.stj.jus.br](https://dadosabertos.web.stj.jus.br/)  
**Papel no produto:** **bootstrap** de volume quando o primeiro tema for predominantemente STJ.

**O que entrega**

- Dumps ZIP/JSON de decisões em lote.
- Sem API de busca live.

**Para que usamos**

1. **Seed inicial** do Postgres com dezenas/centenas de decisões STJ do tema, antes de depender só de busca online.
2. **Job de ingestão** (Cron + ETL) para atualizar o acervo periodicamente a partir dos dumps.

**Para que não usamos**

- Como API de produto em tempo real (não há busca live).
- Quando o tema for TJ estadual, TRT ou TRF — cobertura limitada ao STJ.

---

### Upload (Vercel Blob)

**Tipo:** canal interno do produto (não é API externa)  
**Papel no produto:** **fallback** e canal do usuário.

**O que entrega**

- PDF ou documento enviado pelo advogado (“me manda aquele julgado”).

**Para que usamos**

1. Ingerir decisões que **não estão** (ou não foram encontradas) nas APIs.
2. Respeitar o fluxo real do escritório: muitas vezes o precedente já está em PDF.
3. Extrair texto via pipeline interno e gravar como `Julgamento` no mesmo modelo das outras fontes.

**Para que não usamos**

- Como única fonte de acervo — não escala para montar padrão histórico do tema.

---

### JUIT

**Tipo:** comercial  
**Site:** [juit.com.br/produtos/api-de-jurisprudencia](https://juit.com.br/produtos/api-de-jurisprudencia)  
**Papel no produto:** candidata a fonte **primária em escala** (pós-v1).

**O que entrega**

- Ementa e íntegra.
- Busca estruturada, pensada para RAG.
- Marketing de ~92 tribunais.

**Para que usamos (futuro)**

1. Substituir ou complementar Jurisprudências.ai quando o free tier não aguentar múltiplos temas ou escritórios.
2. Ingestão RAG com maior cobertura tribunal a tribunal.

**Por que não é o v1 default**

- Acesso comercial sem preço público claro.
- Jurisprudências.ai tem docs abertas e tier gratuito — mais rápido para validar o produto.

---

## APIs avaliadas e fora do escopo

### LexML (SRU)

**O que é:** metadados do acervo federal via CQL; em geral aponta a fonte, sem texto integral.  
**Por que não usamos:** não resolve texto citável nem relator de forma direta para o dossiê. Pode servir como ponte para localizar documentos, mas não como pipeline de ingestão principal.

---

### Judex

**O que é:** busca semântica em ementas (comercial, acesso sob solicitação).  
**Por que não usamos no v1:** cobertura focada em ementa (não íntegra), pricing opaco, e Jurisprudências.ai cobre o mesmo nicho com docs e free tier. Pode ser reavaliada se a busca semântica nativa virar requisito forte.

---

### Turivius

**O que é:** produto forte de jurisprudência (inclui módulo no Legal One).  
**Por que não usamos:** **sem API pública documentada** — inviável para ingestão automatizada no SaaS.

---

### MNI / PJe

**O que é:** SOAP institucional com credenciamento por tribunal.  
**Por que não usamos:** protocolo e integração processual, não API de desenvolvedor para jurisprudência. O README deixa claro que o produto **não** é protocolo em PJe.

---

### APIs de processo (não são jurisprudência)

Estas resolvem capa, andamentos e monitoramento — **não** substituem API de julgados:

| API | Motivo de exclusão |
| --- | --- |
| Jusbrasil / Digesto | FAQ oficial: API **não** inclui jurisprudência |
| Escavador | Foco em processo e publicações, não acervo de acórdãos para RAG |
| JUDIT | Dados processuais |
| Codilo | Monitoramento de diários e processos |
| Vigilant (TrackJud) | Acompanhamento processual |
| BuscaProcessos | Consulta processual |
| Juri+ | Processo |
| Legal One API | Dados do produto de gestão, não base pública de acórdãos |

O produto não compete em “achar o processo” — compete em **padrão do juiz + peça ancorada**.

---

## Lacunas oficiais (set/2026)

- STF, STJ e TST **não** têm API REST pública de busca de acórdãos por conteúdo.
- DataJud é metadado processual, não ementa/inteiro teor.
- Para texto de decisão via API hoje: caminho verificado é **Jurisprudências.ai** (v1), depois **JUIT** ou **Judex**.

---

## Matriz por fase do produto

| Fase | Fonte primária | Complementos |
| --- | --- | --- |
| **v1** — um tema, dossiê + petição | Jurisprudências.ai | DataJud, Upload |
| **Seed STJ** — tema em recurso repetitivo | Jurisprudências.ai + Dados Abertos STJ | DataJud |
| **Escala** — múltiplos temas / escritórios | JUIT (avaliar) ou Jurisprudências.ai pago | DataJud, Upload |
| **Sempre** | — | Upload como fallback; sem precedente gravado, trecho é hipótese |

---

## Dependência: escolha do primeiro tema

A API certa depende do tribunal onde o tema tem volume:

| Tema provável | Fonte principal | Observação |
| --- | --- | --- |
| Recurso repetitivo / STJ | Jurisprudências.ai + bulk STJ | Bulk acelera o seed |
| Dano moral em consumo (TJ) | Jurisprudências.ai | Validar cobertura do TJ específico |
| Tutela de urgência em saúde | Jurisprudências.ai | Idem |
| TRF / TRT | Jurisprudências.ai | DataJud ajuda no processo, não no texto |

Sem tema travado, não há como fechar cobertura tribunal a tribunal — escolher o tema é pré-requisito da implementação da ingestão.
