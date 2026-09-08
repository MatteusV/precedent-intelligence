# Inteligência de precedentes por tema

SaaS de inteligência de precedentes: para um **tema** jurídico, o sistema lê o histórico de decisões, extrai o padrão daquele juiz e daquele órgão, e devolve um **dossiê citado** e uma **peça** (petição ou minuta) ancorada nessas fontes.

Não é um chat sobre a lei. É o último metro do trabalho chato — casar o caso com o entendimento de quem vai julgar, e escrever com precedente que existe de verdade.

## A dor

Advogado (e, depois, gabinete) gasta horas em um ciclo que não deveria ser artesanato:

1. Caçar acórdão e sentença espalhados (DataJud, diário, PDF, “me manda aquele julgado”).
2. Descobrir **como aquele relator** decide aquele tema — não “o STJ em abstrato”.
3. Montar tese e peça sem citar o que o juiz já rejeitou, sem inventar ementa, sem ignorar divergência.

O custo não é só tempo. É retrabalho, citação frágil e tese que morre naquele juízo específico. Ferramentas de acervo resolvem “achar texto”. Quase ninguém resolve **este juiz, este pedido, esta peça**.

## Quem usa

| Papel | Trabalho que o produto assume |
| --- | --- |
| Advogado (v1) | “Dado este caso e este juiz, qual tese cabe e como redigir a peça.” |
| Juiz / gabinete (depois) | “Como este juízo tem decidido este tema, e qual minuta se sustenta.” Assistente de consistência — **não** um robô que decide o processo. |

Comprador típico: escritório pequeno/médio ou núcleo de massificado, que repete o **mesmo tema** dezenas de vezes por mês.

## Unidade de produto: o tema

O recorte não é “todo o Direito”. É um tema estreito (ex.: dano moral em relação de consumo, tutela de urgência em saúde).

Com o tema fechado, dezenas de decisões boas valem mais do que um lago jurídico. Sem tema, a IA alucina e a base não ensina nada.

## Como funciona

```text
decisões do tema  →  padrão do juiz/órgão  →  caso do usuário
                                              ↓
                                    dossiê com citações
                                              ↓
                                    petição ou minuta ancorada
```

1. Entram decisões daquele recorte (acervo curado, DataJud, upload).
2. O motor estrutura órgão, relator, resultado, tese, dispositivo, data.
3. O usuário cola o caso: fatos, pedido, polo, juiz/órgão se já souber.
4. O sistema devolve o dossiê: o que cola, o que morre, divergência, trechos citáveis.
5. A peça nasce com âncoras. Sem precedente na base, o trecho é hipótese — nunca jurisprudência inventada.

## O que a IA pode e não pode

**Pode:** classificar decisão no tema, extrair fundamentos, comparar o caso com o padrão daquele juiz, redigir peça citando o dossiê, apontar risco (“este relator rejeita X”).

**Não pode:** garantir o resultado do processo, inventar ementa/número/trecho, substituir prova e juízo de fato, “decidir” no lugar do juiz.

Regra de ouro: **sem precedente no dossiê, não há afirmação de jurisprudência.**

## O que isto não é

- Chat genérico jurídico
- Jusbrasil (eles ganham no acervo; nós no padrão daquele juiz + peça)
- Gestão de escritório (prazos, financeiro, clientes)
- Protocolo em PJe / tribunal
- Oráculo de “percentual de vitória”
- Data warehouse acadêmico (Spark, cubo OLAP, Django). A base analítica é o próprio Postgres.

## Stack

Um único app. Sem segundo backend.

- **Next.js** (App Router, TypeScript) — UI, intake, dossiê e petição
- **Neon Postgres + Prisma** — pool global de `Julgamento`, Temas, Casos, Dossiês e Petições
- **Cursor TypeScript SDK (`@cursor/sdk`)** — inferência de Tema/Pedido e rascunhos JSON de dossiê e petição, atrás de um `AgentPort` testável
- **Clerk** — auth e Escritório (organizations)
- **Jurisprudências.ai** — ingestão sob demanda quando Cobertura < 5 (persist-then-cite)

Fora, de propósito: Python/Django, Spark, Snowflake, Redis, vector DB. `pgvector` só se o SQL não der conta do casamento caso ↔ precedente.

## Recorte do v1

Entrada: um tema, fatos, pedido, polo, juiz/órgão se conhecido.

Saída: padrão histórico naquele recorte, 5–15 precedentes identificáveis, uma petição inicial com âncoras e disclaimer.

## Status

App Next.js com landing pública, auth Clerk, schema Prisma e loop de produto (intake → confirmação → dossiê → petição ancorada). Provisionamento Neon/Clerk via Vercel Marketplace ainda necessário para rodar com banco real.

## Documentação

- [Fontes de dados e APIs](docs/fontes-de-dados.md) — catálogo de APIs (Jurisprudências.ai, DataJud, etc.), papel de cada uma no produto e estratégia de acervo local no Postgres.

## Como rodar

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).
