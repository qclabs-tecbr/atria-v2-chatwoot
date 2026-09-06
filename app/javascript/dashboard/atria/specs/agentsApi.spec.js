import { agentsGet, agentsBaseUrl, AgentsApiError } from '../api/agentsApi';

const config = { atriaAgentsURL: 'https://dev.agents.demo.atria-app.cloud' };
const ok = body => ({ ok: true, json: async () => body });

describe('agentsBaseUrl', () => {
  it('tira a barra final para o path não virar barra dupla', () => {
    expect(agentsBaseUrl({ atriaAgentsURL: 'https://x.test/' })).toBe(
      'https://x.test'
    );
  });

  it('devolve null quando não está configurado', () => {
    expect(agentsBaseUrl({})).toBe(null);
    expect(agentsBaseUrl({ atriaAgentsURL: '  ' })).toBe(null);
    expect(agentsBaseUrl(undefined)).toBe(null);
  });
});

describe('agentsGet', () => {
  const call = (overrides = {}) =>
    agentsGet({
      path: '/api/v1/kanban/boards',
      token: 'tok',
      accountId: 7,
      config,
      ...overrides,
    });

  it('manda os dois headers que o backend exige', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(ok([]));

    await call({ fetchImpl });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(
      'https://dev.agents.demo.atria-app.cloud/api/v1/kanban/boards'
    );
    expect(init.headers['x-chatwoot-agent-token']).toBe('tok');
    expect(init.headers['x-chatwoot-account-id']).toBe('7');
  });

  // Sem base configurada a chamada viraria URL relativa e traria o HTML do
  // próprio Chatwoot — 200, corpo errado, falha silenciosa. Falha cedo.
  it('não chama a rede quando a URL do agents não está configurada', async () => {
    const fetchImpl = vi.fn();

    await expect(call({ fetchImpl, config: {} })).rejects.toThrow(
      AgentsApiError
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('não chama a rede sem token ou sem conta', async () => {
    const fetchImpl = vi.fn();

    await expect(call({ fetchImpl, token: null })).rejects.toMatchObject({
      reason: 'missing_credentials',
    });
    await expect(call({ fetchImpl, accountId: null })).rejects.toMatchObject({
      reason: 'missing_credentials',
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  // O `reason` é o que permite a tela dizer O QUE aconteceu — critério do
  // qa-code: nunca "erro" genérico.
  it('preserva status e reason do backend', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ reason: 'unknown_account' }),
    });

    await expect(call({ fetchImpl })).rejects.toMatchObject({
      status: 403,
      reason: 'unknown_account',
    });
  });

  it('sobrevive a corpo de erro vazio ou não-JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('not json');
      },
    });

    await expect(call({ fetchImpl })).rejects.toMatchObject({
      status: 500,
      reason: null,
    });
  });
});
