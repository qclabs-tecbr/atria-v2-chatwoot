/**
 * ATRIA — carga do Kanban. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Só leitura: nesta etapa quem opera o Kanban é a secretária digital, por
 * API/tools; a tela existe pra VER (Fábio, #plano msg 1530). Não há mover.
 */
import { ref, computed } from 'vue';
import { fetchKanbanBoards, fetchKanbanCards } from '../api/agentsApi';

/**
 * @param {object} [deps] injetáveis para teste — em produção vêm do componente.
 * @param {() => string|null} [deps.token] `currentUser.access_token` do Chatwoot
 * @param {() => number|string|null} [deps.accountId] conta aberta no Chatwoot
 * @param {(p: any) => Promise<any>} [deps.loadBoards] troca a carga dos quadros no teste
 * @param {(p: any) => Promise<any>} [deps.loadCards] troca a carga dos cartões no teste
 *
 * NOTA: o JSDoc antigo documentava só `token`/`accountId` e omitia os dois
 * `load*`, que os testes injetam desde sempre. Não era detalhe de estilo — a
 * documentação da própria costura de teste estava errada, e foi o `tsc` do
 * `pnpm atria:typecheck` que apontou (job 39).
 */
export function useKanbanBoards({
  token,
  accountId,
  loadBoards = fetchKanbanBoards,
  loadCards = fetchKanbanCards,
} = {}) {
  /** @type {import('vue').Ref<import('../types/atriaApi').KanbanBoard[]>} */
  const boards = ref([]);
  /** @type {import('vue').Ref<string|number|null>} */
  const activeBoardId = ref(null);
  /** @type {import('vue').Ref<any[]>} */
  const cards = ref([]);
  // Sempre do servidor: uma coluna com zero cartão na página atual pode ter
  // cartão adiante, e contar o que chegou mentiria (docs/kanban-ui.md §5).
  /** @type {import('vue').Ref<Record<string, number>>} */
  const countsByStep = ref({});
  /** @type {import('vue').Ref<string|null>} */
  const nextCursor = ref(null);
  const isLoadingBoards = ref(false);
  const isLoadingCards = ref(false);
  /** @type {import('vue').Ref<Error|null>} */
  const error = ref(null);

  const credentials = () => ({ token: token?.(), accountId: accountId?.() });

  const activeBoard = computed(
    () => boards.value.find(b => b.id === activeBoardId.value) ?? null
  );

  const steps = computed(() =>
    [...(activeBoard.value?.steps ?? [])].sort(
      (a, b) => a.position - b.position
    )
  );

  const cardsByStep = computed(() => {
    const grouped = {};
    steps.value.forEach(step => {
      grouped[step.id] = [];
    });
    cards.value.forEach(card => {
      // Cartão numa etapa que o quadro não conhece seria invisível em silêncio.
      // Preferimos ignorar explicitamente a fingir que a coluna não existe.
      if (grouped[card.stepId]) grouped[card.stepId].push(card);
    });
    return grouped;
  });

  /**
   * Distingue os três vazios (docs/kanban-ui.md §5): coluna realmente vazia,
   * coluna cujo cartão não veio nesta página, e quadro que nem carregou.
   * Sem isso, os três são pixel-idênticos e o operador conclui errado.
   */
  const stepEmptyKind = stepId => {
    const count = countsByStep.value[stepId] ?? 0;
    const loaded = cardsByStep.value[stepId]?.length ?? 0;
    if (loaded > 0) return null;
    return count > 0 ? 'beyond-page' : 'empty';
  };

  async function loadCardsFor(boardId) {
    isLoadingCards.value = true;
    error.value = null;
    try {
      const page = await loadCards({ ...credentials(), boardId });
      cards.value = page.cards ?? [];
      countsByStep.value = page.countsByStep ?? {};
      nextCursor.value = page.nextCursor ?? null;
    } catch (err) {
      error.value = /** @type {Error} */ (err);
      cards.value = [];
      countsByStep.value = {};
    } finally {
      isLoadingCards.value = false;
    }
  }

  async function selectBoard(boardId) {
    activeBoardId.value = boardId;
    await loadCardsFor(boardId);
  }

  async function load() {
    isLoadingBoards.value = true;
    error.value = null;
    try {
      const list = await loadBoards(credentials());
      boards.value = [...list].sort((a, b) => a.order - b.order);
      if (boards.value.length) await selectBoard(boards.value[0].id);
    } catch (err) {
      error.value = /** @type {Error} */ (err);
      boards.value = [];
    } finally {
      isLoadingBoards.value = false;
    }
  }

  return {
    boards,
    activeBoardId,
    activeBoard,
    steps,
    cards,
    cardsByStep,
    countsByStep,
    stepEmptyKind,
    nextCursor,
    isLoadingBoards,
    isLoadingCards,
    error,
    load,
    selectBoard,
  };
}
