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

## O que ainda não está tipado, e por quê

As 4 rotas do Kanban **não declaram resposta 2xx** no `openapi.json`, então o
corpo de sucesso delas não existe nos tipos gerados.

Isso **não é descuido no Kanban**: 198 das 207 operações do spec são assim. O
padrão do repositório `agents` é `response: errors(...)`, e o sucesso é inferido
pelo **Eden treaty** — que só funciona para um cliente TypeScript importando o
app Elysia. O fork é Rails/JS e lê o `openapi.json`, onde o que não foi
declarado simplesmente não existe.

Enquanto isso, `types/atriaApi.d.ts` tem `any` **marcado com `TODO [4.5:11a]`**.
Não escrevemos as formas à mão de propósito: seria uma segunda fonte de verdade
para um dado de que o servidor já é dono, e ela divergiria em silêncio.

`specs/atriaApiTypes.spec.js` guarda isso. Quando o `[4.5:11a]` entrar, aquele
teste vira **vermelho** — e vermelho ali é boa notícia: significa regerar e
trocar os `any` pelos tipos reais.

## Limite declarado

O elo **spec → fork** não tem CI automático, porque o CI do fork não alcança o
repositório privado do `agents`. `pnpm atria:types:check` é rodado à mão por
quem mexe no contrato. Isso é limitação conhecida, não descuido.
