/**
 * ATRIA — declarações do que o Rails injeta no HTML. NÃO É CÓDIGO DO UPSTREAM.
 *
 * `window.chatwootConfig` é preenchido por `app/views/dashboard/vueapp.html.erb`.
 * O upstream não tem tipos para ele (o repositório é JS), então declaramos só o
 * que a nossa camada lê — não o objeto inteiro. Declarar demais seria inventar
 * contrato sobre código que não é nosso.
 */
declare global {
  interface ChatwootConfig {
    /**
     * Base do motor `agents` (ex.: `https://dev.agents.demo.atria-app.cloud`).
     * Vem de `ATRIA_AGENTS_URL` no ambiente do container do Chatwoot.
     * Opcional de propósito: quando falta, a tela precisa DIZER que não está
     * configurada em vez de bater numa URL relativa e receber o HTML do
     * Chatwoot de volta (`agentsApi.js`).
     */
    atriaAgentsURL?: string;
    [key: string]: unknown;
  }

  interface Window {
    chatwootConfig?: ChatwootConfig;
  }
}

export {};
