/**
 * ATRIA — portão do contrato do Kanban. NÃO É CÓDIGO DO UPSTREAM. Job 39.
 *
 * Este teste existe para FALHAR enquanto o `[4.5:11a]` (dev-sr) não entrar, e
 * passar sozinho quando entrar. Sem ele, o gerador roda, o `.d.ts` é escrito,
 * `pnpm atria:typecheck` fica verde — e o client fica sem tipo de sucesso
 * nenhum, que é precisamente a falha silenciosa que este job existe pra
 * impedir (`#plano` msg 1836).
 *
 * Ele lê o arquivo GERADO E COMMITADO, não o `openapi.json` do outro
 * repositório: o CI do fork não alcança o `v2/dev`, que é privado. Então o que
 * este teste prova é "os tipos que estão commitados aqui carregam o sucesso",
 * que é o que a tela de fato consome.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const HERE = dirname(fileURLToPath(import.meta.url));
const GERADO = resolve(HERE, '../api/atria-api.d.ts');

/** As 4 operações do Kanban, com o nome que o gerador dá a cada uma. */
const OPERACOES_KANBAN = [
  'getV1KanbanBoards',
  'getV1KanbanBoardsByBoardIdCards',
  'getV1KanbanCardsByCardId',
  'postV1KanbanCardsByCardIdMove',
];

/**
 * Recorta o bloco de uma operação dentro de `export interface operations`.
 * Simples de propósito: o arquivo é gerado com indentação estável (4 espaços
 * para a chave da operação, 4 para o `};` que a fecha).
 */
function blocoDaOperacao(fonte, nome) {
  const inicio = fonte.indexOf(`\n    ${nome}: {`);
  if (inicio === -1) return null;
  const fim = fonte.indexOf('\n    };', inicio);
  return fim === -1 ? null : fonte.slice(inicio, fim);
}

describe('tipos gerados da API do agents', () => {
  const fonte = readFileSync(GERADO, 'utf8');

  it('tem as 4 operações do Kanban', () => {
    OPERACOES_KANBAN.forEach(nome => {
      expect(
        blocoDaOperacao(fonte, nome),
        `operação ausente: ${nome}`
      ).not.toBe(null);
    });
  });

  it('prova que o gerador extrai sucesso quando o spec declara (rota de controle)', () => {
    // Se ESTA falhar, o problema é o gerador/o spec inteiro — não o contrato do
    // Kanban. Separa as duas hipóteses sem ninguém precisar investigar.
    const bloco = blocoDaOperacao(fonte, 'getHealth');
    expect(bloco).not.toBe(null);
    expect(bloco).toMatch(/\n\s{12}200: \{/);
  });

  it('as 4 rotas do Kanban declaram resposta 200', () => {
    // Era `it.fails` enquanto o [4.5:11a] não existia. Virou teste normal
    // quando o contrato entrou (dev-sr, squad/dev-sr@48c1b01) — e continua
    // aqui porque é o que impede o sucesso de sumir do spec sem ninguém ver:
    // se sumir, os apelidos de types/atriaApi.d.ts viram `never` e a checagem
    // de payload some em silêncio, que é o estado de onde este job partiu.
    const semSucesso = OPERACOES_KANBAN.filter(nome => {
      const bloco = blocoDaOperacao(fonte, nome);
      return !bloco || !/\n\s{12}200: \{/.test(bloco);
    });
    expect(
      semSucesso,
      `sem resposta 200 no spec: ${semSucesso.join(', ')}. ` +
        'Corrigir em services/agents/src/api/v1/kanban.controller.ts ' +
        '(response: { 200: ... }) e regerar com `pnpm atria:types`.'
    ).toEqual([]);
  });
});
