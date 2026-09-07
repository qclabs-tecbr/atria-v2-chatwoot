/**
 * ATRIA — cliente da API do motor `agents`. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Não usa o axios do Chatwoot (`dashboard/helper/APIHelper`): aquele aponta pro
 * Rails do próprio Chatwoot e injeta as credenciais de sessão dele. Aqui a
 * chamada é para OUTRO host (`agents.<tenant>.atria-app.cloud`), com o esquema
 * de identidade que o dev-sr desenhou no [4.5:10]: o backend não confia no que
 * mandamos — ele leva o token de volta ao Chatwoot e deixa o Chatwoot dizer
 * quem é (introspecção, #plano msg 1475).
 *
 * Nomes dos headers vêm de `src/modules/chatwoot/agent-auth.ts` no v2/dev.
 */

/** Token pessoal do agente (`api_access_token` do Chatwoot). */
const AGENT_TOKEN_HEADER = 'x-chatwoot-agent-token';

/** Conta aberta no Chatwoot. Sem ele o backend recusa com `missing_credentials`. */
const ACCOUNT_HEADER = 'x-chatwoot-account-id';

export class AgentsApiError extends Error {
  constructor(status, reason) {
    super(`agents API ${status}${reason ? ` (${reason})` : ''}`);
    this.name = 'AgentsApiError';
    this.status = status;
    // `reason` é o discriminador do backend (`unknown_account`,
    // `no_atria_user`, …) — é o que permite a tela dizer O QUE aconteceu em vez
    // de "erro" genérico, que é o critério do qa-code.
    this.reason = reason ?? null;
  }
}

/**
 * Base do motor `agents`. Vem da config que o Rails injeta no HTML
 * (`window.chatwootConfig`), como todo o resto da configuração do dashboard.
 * Sem ela não há chamada a fazer — e é melhor falhar dizendo isso do que
 * bater numa URL relativa e receber o HTML do Chatwoot de volta.
 */
export function agentsBaseUrl(config = window.chatwootConfig) {
  const url = config?.atriaAgentsURL;
  return typeof url === 'string' && url.trim() ? url.replace(/\/+$/, '') : null;
}

/**
 * @param {object} params
 * @param {string} params.path caminho a partir da raiz (ex.: `/api/v1/kanban/boards`)
 * @param {string|null} [params.token] `currentUser.access_token` do Chatwoot
 * @param {number|string|null} [params.accountId] conta aberta no Chatwoot
 * @param {typeof fetch} [params.fetchImpl] injetável no teste; em produção é o `fetch` global
 * @param {ChatwootConfig} [params.config] injetável no teste; em produção é `window.chatwootConfig`
 * @returns {Promise<any>} corpo JSON. `any` porque as rotas do Kanban ainda não
 *   declaram resposta 2xx no `openapi.json` — ver `types/atriaApi.d.ts` e o
 *   `[4.5:11a]`. Quem chama tipa o retorno; aqui não dá pra saber qual rota é.
 */
export async function agentsGet({
  path,
  token,
  accountId,
  fetchImpl = fetch,
  config,
}) {
  const base = agentsBaseUrl(config);
  if (!base) {
    throw new AgentsApiError(0, 'agents_url_not_configured');
  }
  if (!token || !accountId) {
    throw new AgentsApiError(0, 'missing_credentials');
  }

  const response = await fetchImpl(`${base}${path}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      [AGENT_TOKEN_HEADER]: token,
      [ACCOUNT_HEADER]: String(accountId),
    },
  });

  if (!response.ok) {
    let reason = null;
    try {
      reason = (await response.json())?.reason ?? null;
    } catch {
      // Corpo vazio ou não-JSON: o status sozinho ainda diz o suficiente.
    }
    throw new AgentsApiError(response.status, reason);
  }

  return response.json();
}

export const fetchKanbanBoards = params =>
  agentsGet({ ...params, path: '/api/v1/kanban/boards' });

export const fetchKanbanCards = ({ boardId, ...params }) =>
  agentsGet({ ...params, path: `/api/v1/kanban/boards/${boardId}/cards` });

export const fetchKanbanCardDetail = ({ cardId, ...params }) =>
  agentsGet({ ...params, path: `/api/v1/kanban/cards/${cardId}` });
