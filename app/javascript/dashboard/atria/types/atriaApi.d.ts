/**
 * ATRIA — apelidos dos tipos do motor `agents`. NÃO É CÓDIGO DO UPSTREAM.
 *
 * `atria-api.d.ts` (ao lado, em `../api/`) é gerado e tem 17k linhas. Este
 * arquivo é a superfície pequena que a nossa camada realmente usa, para o
 * JSDoc do código não precisar navegar `operations["getV1Kanban…"]["responses"]`
 * em cada linha.
 *
 * O `[4.5:11a]` (dev-sr, `squad/dev-sr@48c1b01`) declarou `response: { 200: … }`
 * nas 4 rotas do Kanban, então o corpo de sucesso delas passou a existir no
 * spec — e é daí que os apelidos abaixo saem. Nada aqui é escrito à mão: se a
 * forma mudar no servidor, `pnpm atria:types` muda este arquivo junto, e
 * `pnpm atria:types:check` acusa se alguém esquecer de regerar.
 *
 * Contexto de por que isso precisou de decisão e não foi só um esquecimento:
 * 198 das 207 operações do spec continuam sem 2xx, porque o padrão do repo
 * `agents` é `response: errors(...)` e o sucesso é inferido pelo Eden treaty
 * (que serve a um cliente TypeScript importando o app Elysia — não é o nosso
 * caso). As 4 do Kanban são exceção deliberada, autorizada pelo planner
 * (`#plano` msg 1855), porque o fork é Rails/JS e lê o `openapi.json`.
 *
 * `specs/atriaApiTypes.spec.js` guarda que as 4 rotas continuem declarando 200.
 */
import type { operations } from '../api/atria-api';

/** Extrai o corpo 200 de uma operação gerada, se ela declarar um. */
export type Success<Op> = Op extends {
  responses: { 200: { content: { 'application/json': infer Body } } };
}
  ? Body
  : never;

/** Um quadro com suas etapas. A rota devolve a lista; este é o item dela. */
export type KanbanBoard = Success<operations['getV1KanbanBoards']>[number];

/** Uma etapa do quadro — traz `color`, que é o que pinta a coluna. */
export type KanbanStep = KanbanBoard['steps'][number];

/** Página de cartões: `cards`, `countsByStep` (sempre do servidor) e `nextCursor`. */
export type KanbanCardsPage = Success<
  operations['getV1KanbanBoardsByBoardIdCards']
>;

/** Um cartão da listagem. */
export type KanbanCard = KanbanCardsPage['cards'][number];

/**
 * Cartão aberto, com a trilha de transições.
 *
 * Traz `conversationId` (nosso PK) E `chatwootConversationId` (o do Chatwoot).
 * São dois números diferentes no mesmo objeto, e trocá-los abre a conversa de
 * OUTRO paciente sem erro nenhum. Agora o tipo distingue os dois — antes deste
 * job, os únicos guardas eram os dois testes que escrevi à mão.
 */
export type KanbanCardDetail = Success<
  operations['getV1KanbanCardsByCardId']
>;

/** Prova de que o extrator funciona: esta rota declara 200 no spec de hoje. */
export type Health = Success<operations['getHealth']>;

export type { operations };
