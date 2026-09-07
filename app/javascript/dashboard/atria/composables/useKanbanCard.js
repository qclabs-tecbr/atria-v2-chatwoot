/**
 * ATRIA — detalhe de um cartão. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Só leitura: abrir o cartão e conferir se os dados e anexos batem com o que a
 * secretária digital gravou (Fábio, #plano msg 1530).
 */
import { ref } from 'vue';
import { fetchKanbanCardDetail } from '../api/agentsApi';

/**
 * @param {object} [deps]
 * @param {() => string|null} [deps.token] `currentUser.access_token` do Chatwoot
 * @param {() => number|string|null} [deps.accountId] conta aberta no Chatwoot
 * @param {(p: any) => Promise<import('../types/atriaApi').KanbanCardDetail>} [deps.loadCard] troca a carga do cartão no teste
 */
export function useKanbanCard({
  token,
  accountId,
  loadCard = fetchKanbanCardDetail,
} = {}) {
  /** @type {import('vue').Ref<import('../types/atriaApi').KanbanCardDetail|null>} */
  const card = ref(null);
  const isLoading = ref(false);
  /** @type {import('vue').Ref<Error|null>} */
  const error = ref(null);

  async function open(cardId) {
    // Limpa antes: mostrar o cartão anterior enquanto o novo carrega faria o
    // operador conferir dado do paciente errado.
    card.value = null;
    error.value = null;
    isLoading.value = true;
    try {
      card.value = await loadCard({
        token: token?.(),
        accountId: accountId?.(),
        cardId,
      });
    } catch (err) {
      error.value = /** @type {Error} */ (err);
    } finally {
      isLoading.value = false;
    }
  }

  function close() {
    card.value = null;
    error.value = null;
  }

  return { card, isLoading, error, open, close };
}

/**
 * Quem fez a transição, para a tela distinguir a IA de uma pessoa sem
 * re-derivar nome (o servidor já resolve `performedByLabel`).
 * @param {unknown} performedBy prefixo `agent:` / `user:` / `system:` vindo do servidor
 * @returns {'agent'|'user'|'system'}
 */
export function performedByKind(performedBy) {
  if (typeof performedBy !== 'string' || !performedBy) return 'system';
  const [prefix] = performedBy.split(':');
  if (prefix === 'agent') return 'agent';
  if (prefix === 'user') return 'user';
  return 'system';
}
