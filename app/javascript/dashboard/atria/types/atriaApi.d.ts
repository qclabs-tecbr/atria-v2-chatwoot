/**
 * ATRIA — apelidos dos tipos do motor `agents`. NÃO É CÓDIGO DO UPSTREAM.
 *
 * `atria-api.d.ts` (ao lado, em `../api/`) é gerado e tem 17k linhas. Este
 * arquivo é a superfície pequena que a nossa camada realmente usa, para o
 * JSDoc do código não precisar navegar `operations["getV1Kanban…"]["responses"]`
 * em cada linha.
 *
 * ⚠️ ESTADO ATUAL — job 39, `[4.5:11a]` pendente (dev-sr):
 * as 4 rotas do Kanban NÃO declaram resposta 2xx no `openapi.json`, então o
 * tipo de sucesso delas não existe no arquivo gerado. Isso não é particular do
 * Kanban: 198 das 207 operações do spec são assim, porque o padrão do repo é
 * `response: errors(...)` e o sucesso é inferido pelo Eden treaty (que só
 * funciona para um cliente TypeScript importando o app Elysia — não é o nosso
 * caso, o fork é Rails/JS e lê o `openapi.json`).
 *
 * Enquanto isso, os apelidos abaixo são `any` COM MARCA. Não são um contrato
 * escrito à mão: escrever as formas aqui criaria uma segunda fonte de verdade
 * para um dado de que o servidor já é dono — exatamente o que recusei no mapa
 * de cor das etapas (`#front` msg 1439). `any` marcado é honesto; espelho
 * feito à mão diverge em silêncio.
 *
 * Quando o `[4.5:11a]` entrar: regerar (`pnpm atria:types`) e trocar cada
 * `any` abaixo pelo tipo real. O teste `specs/atriaApiTypes.spec.js` falha
 * enquanto isso não acontecer, então não há como esquecer.
 */
import type { operations } from '../api/atria-api';

/** Extrai o corpo 200 de uma operação gerada, se ela declarar um. */
export type Success<Op> = Op extends {
  responses: { 200: { content: { 'application/json': infer Body } } };
}
  ? Body
  : never;

// TODO [4.5:11a]: trocar por Success<operations['getV1KanbanBoards']>
export type KanbanBoard = any;
// TODO [4.5:11a]: trocar por Success<operations['getV1KanbanBoardsByBoardIdCards']>
export type KanbanCardsPage = any;
// TODO [4.5:11a]: trocar por Success<operations['getV1KanbanCardsByCardId']>
export type KanbanCardDetail = any;

/** Prova de que o extrator funciona: esta rota declara 200 no spec de hoje. */
export type Health = Success<operations['getHealth']>;

export type { operations };
