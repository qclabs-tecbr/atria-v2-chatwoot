# Tipos da API do `agents` — job 39 `[4.5:11b]`

Como conferir tipo na camada de dados do Kanban, num repositório que é 100% JS.

## Os três comandos

```bash
# 1. Regerar os tipos a partir do openapi.json do repositório v2/dev
ATRIA_OPENAPI_SPEC=<caminho>/services/agents/openapi.json pnpm atria:types

# 2. Conferir que o arquivo commitado bate com o spec (não escreve nada)
ATRIA_OPENAPI_SPEC=<caminho>/services/agents/openapi.json pnpm atria:types:check

# 3. Checar os tipos do nosso código (não precisa do spec — usa o commitado)
pnpm atria:typecheck
```

Só o **3** roda sem ter o outro repositório em disco. É por isso que
`api/atria-api.d.ts` é **commitado**: o build e o CI do fork não podem depender
de um repositório privado que eles não alcançam.

## Por que não tem TypeScript de verdade aqui

O runtime continua `.js`. O que existe é `checkJs` + JSDoc, sobre
`app/javascript/dashboard/atria/` **apenas**, com o `tsconfig.json` desta pasta.

Nada de config na raiz (`tsconfig.json`, `.eslintrc.js`, `vite.config`): o fork
precisa continuar rebaseável contra o Chatwoot upstream, e config na raiz é
arquivo que o upstream também mexe — o `docs/acervo/1-DIVERGENCIAS` já lista 16
arquivos divergentes, e conflito de config é onde guarda some sem ninguém ver.

O `vite.lib.config.ts` compila `.ts` por esbuild, que **remove** tipo sem
conferir nada. Ou seja: sem o `pnpm atria:typecheck`, tipo aqui dentro seria
decoração. É o comando que faz o tipo valer alguma coisa — não o sufixo do
arquivo.

## O que está tipado

As 4 rotas do Kanban **declaram resposta 200** desde o `[4.5:11a]` (dev-sr), então
o corpo de sucesso delas existe nos tipos gerados e `types/atriaApi.d.ts` só faz
apelido em cima — `KanbanBoard`, `KanbanStep`, `KanbanCard`, `KanbanCardsPage`,
`KanbanCardDetail`. **Nada é escrito à mão:** se a forma mudar no servidor,
`pnpm atria:types` muda o arquivo junto e `pnpm atria:types:check` acusa quem
esqueceu de regerar.

Isso precisou de decisão e não foi conserto de esquecimento: **198 das 207
operações do spec continuam sem 2xx**, porque o padrão do repo `agents` é
`response: errors(...)` e o sucesso é inferido pelo Eden treaty (que serve a um
cliente TypeScript importando o app Elysia — não é o nosso caso). As 4 do Kanban
são exceção deliberada, autorizada pelo planner.

### O detalhe que faz o tipo morder

Os injetáveis `loadBoards`/`loadCards`/`loadCard` dos composables são tipados com
o retorno real, **não** `Promise<any>`. Isso não é capricho: é por eles que a
forma do payload entra. Medido — com `Promise<any>`, anotar o `ref` não adianta
(`any` é atribuível a tudo) e um campo inexistente passa batido; com o tipo real,
falha.

Prova, se alguém quiser repetir: troque `a.order` por `a.campoQueNaoExiste` em
`useKanbanBoards.js` e rode `pnpm atria:typecheck`. Tem que dar `TS2339`.
Idem `card.value.chatwootConversationIdd` → `TS2551`, com o `Did you mean` — que
é exatamente o par `conversationId` × `chatwootConversationId` que abriria a
conversa de outro paciente sem erro nenhum.

## Limite declarado

O elo **spec → fork** não tem CI automático, porque o CI do fork não alcança o
repositório privado do `agents`. `pnpm atria:types:check` é rodado à mão por
quem mexe no contrato. Isso é limitação conhecida, não descuido.

Os `.vue` **não** são checados: `tsc` não lê SFC, e cobrir exigiria `vue-tsc` —
outra dependência, outra decisão. A camada de dados está coberta; os
componentes não.
