/**
 * ATRIA — detalhe de um cartão. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Só leitura: abrir o cartão e conferir se os dados e anexos batem com o que a
 * secretária digital gravou (Fábio, #plano msg 1530).
 */
import { ref } from 'vue';
import { fetchKanbanCardDetail } from '../api/agentsApi';

export function useKanbanCard({
  token,
  accountId,
  loadCard = fetchKanbanCardDetail,
} = {}) {
  const card = ref(null);
  const isLoading = ref(false);
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
      error.value = err;
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
 * @returns {'agent'|'user'|'system'}
 */
export function performedByKind(performedBy) {
  if (typeof performedBy !== 'string' || !performedBy) return 'system';
  const [prefix] = performedBy.split(':');
  if (prefix === 'agent') return 'agent';
  if (prefix === 'user') return 'user';
  return 'system';
}
