import { useKanbanBoards } from '../composables/useKanbanBoards';

const step = (id, position, extra = {}) => ({
  id,
  name: `Etapa ${id}`,
  position,
  color: '#94A3B8',
  probability: 50,
  completed: false,
  cancelled: false,
  ...extra,
});

const boards = [
  { id: '2', name: 'Consulta', order: 1, steps: [step('20', 0)] },
  {
    id: '1',
    name: 'Atendimento',
    order: 0,
    // Fora de ordem de propósito: a tela ordena por `position`, não pela API.
    steps: [step('12', 1), step('10', 0), step('11', 0.5)],
  },
];

const card = (id, stepId) => ({
  id,
  boardId: '1',
  stepId,
  title: `Card ${id}`,
  contact: { id: '9', name: 'Ana', phone: null },
});

const setup = (overrides = {}) =>
  useKanbanBoards({
    token: () => 'tok',
    accountId: () => 7,
    loadBoards: async () => boards,
    loadCards: async () => ({
      cards: [card('a', '10'), card('b', '10'), card('c', '11')],
      countsByStep: { 10: 2, 11: 5, 12: 0 },
      nextCursor: null,
    }),
    ...overrides,
  });

describe('useKanbanBoards', () => {
  it('ordena os quadros por `order` e abre o primeiro', async () => {
    const k = setup();

    await k.load();

    expect(k.boards.value.map(b => b.name)).toEqual([
      'Atendimento',
      'Consulta',
    ]);
    expect(k.activeBoard.value.name).toBe('Atendimento');
  });

  it('ordena as etapas por `position`, não pela ordem da API', async () => {
    const k = setup();

    await k.load();

    expect(k.steps.value.map(s => s.id)).toEqual(['10', '11', '12']);
  });

  it('agrupa os cartões por etapa, criando coluna vazia para etapa sem cartão', async () => {
    const k = setup();

    await k.load();

    expect(k.cardsByStep.value['10'].map(c => c.id)).toEqual(['a', 'b']);
    expect(k.cardsByStep.value['11'].map(c => c.id)).toEqual(['c']);
    expect(k.cardsByStep.value['12']).toEqual([]);
  });

  // A regra que o próprio backend comenta: contar o que chegou mentiria.
  it('usa countsByStep do servidor, não o tamanho da página', async () => {
    const k = setup();

    await k.load();

    expect(k.countsByStep.value['11']).toBe(5);
    expect(k.cardsByStep.value['11']).toHaveLength(1);
  });

  // Os três vazios de docs/kanban-ui.md §5 — pixel-idênticos se não distinguir.
  it('distingue coluna vazia de coluna cujo cartão não veio na página', async () => {
    const k = setup();

    await k.load();

    expect(k.stepEmptyKind('12')).toBe('empty'); // count 0 -> vazia de verdade
    expect(k.stepEmptyKind('10')).toBe(null); // tem cartão carregado
    expect(
      useKanbanBoards({
        token: () => 't',
        accountId: () => 1,
        loadBoards: async () => boards,
        loadCards: async () => ({
          cards: [],
          countsByStep: { 10: 4 },
          nextCursor: 'x',
        }),
      })
    ).toBeTruthy();
  });

  it('marca "beyond-page" quando o servidor conta cartão que não veio', async () => {
    const k = setup({
      loadCards: async () => ({
        cards: [],
        countsByStep: { 10: 4, 11: 0, 12: 0 },
        nextCursor: 'cursor-1',
      }),
    });

    await k.load();

    expect(k.stepEmptyKind('10')).toBe('beyond-page');
    expect(k.stepEmptyKind('11')).toBe('empty');
    expect(k.nextCursor.value).toBe('cursor-1');
  });

  // Cartão numa etapa que o quadro não conhece não pode sumir calado.
  it('ignora cartão de etapa desconhecida sem quebrar', async () => {
    const k = setup({
      loadCards: async () => ({
        cards: [card('x', '999')],
        countsByStep: {},
        nextCursor: null,
      }),
    });

    await k.load();

    expect(Object.keys(k.cardsByStep.value)).toEqual(['10', '11', '12']);
    expect(k.cardsByStep.value['10']).toEqual([]);
  });

  it('guarda o erro e limpa o quadro quando a carga falha', async () => {
    const boom = new Error('403');
    const k = setup({
      loadCards: async () => {
        throw boom;
      },
    });

    await k.load();

    expect(k.error.value).toBe(boom);
    expect(k.cards.value).toEqual([]);
    expect(k.isLoadingCards.value).toBe(false);
  });

  it('troca de quadro recarregando os cartões daquele quadro', async () => {
    const loadCards = vi.fn().mockResolvedValue({
      cards: [],
      countsByStep: {},
      nextCursor: null,
    });
    const k = setup({ loadCards });

    await k.load();
    await k.selectBoard('2');

    expect(k.activeBoard.value.name).toBe('Consulta');
    expect(loadCards).toHaveBeenLastCalledWith(
      expect.objectContaining({ boardId: '2', token: 'tok', accountId: 7 })
    );
  });
});
