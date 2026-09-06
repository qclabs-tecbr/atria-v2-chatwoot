import { mount } from '@vue/test-utils';
import KanbanBoard from '../components/KanbanBoard.vue';

// Tradutor identidade: os testes checam estrutura e classe, não texto traduzido
// (o texto já é coberto pelo spec da camada de i18n).
const global = { mocks: { $t: k => k }, plugins: [], stubs: {} };
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: k => k }) }));

const step = (id, name, color, extra = {}) => ({
  id,
  name,
  color,
  position: Number(id),
  completed: false,
  cancelled: false,
  ...extra,
});

const steps = [
  step('1', 'Novo contato', '#94A3B8'),
  step('2', 'Confirmado', '#22C55E', { completed: true }),
  step('3', 'Perdido', '#64748B', { cancelled: true }),
];

const card = (id, stepId) => ({
  id,
  stepId,
  title: `Card ${id}`,
  priority: 'high',
  contact: { id: '1', name: 'Ana Souza', phone: null },
});

const EMPTY_KIND = { 2: 'empty', 3: 'beyond-page' };

const factory = (props = {}) =>
  mount(KanbanBoard, {
    global,
    props: {
      boards: [
        { id: 'a', name: 'Atendimento' },
        { id: 'b', name: 'Consulta' },
      ],
      activeBoardId: 'a',
      steps,
      cardsByStep: { 1: [card('c1', '1')], 2: [], 3: [] },
      countsByStep: { 1: 1, 2: 0, 3: 4 },
      stepEmptyKind: id => EMPTY_KIND[id] ?? null,
      ...props,
    },
  });

describe('KanbanBoard', () => {
  it('renderiza uma coluna por etapa', () => {
    const wrapper = factory();

    expect(wrapper.findAll('section[aria-label]')).toHaveLength(3);
  });

  // A cor tem que vir do hex do servidor, mapeada pra classe do fork. Se alguém
  // trocar por hex cru ou classe interpolada, isto quebra aqui e não em produção.
  it('pinta cada etapa com a classe do fork derivada do hex do servidor', () => {
    const html = factory().html();

    expect(html).toContain('bg-n-slate-9'); // Novo contato #94A3B8
    expect(html).toContain('bg-n-teal-9'); // Confirmado  #22C55E
    expect(html).toContain('bg-n-ruby-9'); // Perdido     #64748B
    expect(html).not.toContain('#94A3B8'); // nunca hex cru na marcação
  });

  it('marca terminal com glifo, não só com cor', () => {
    const text = factory().text();

    expect(text).toContain('✓');
    expect(text).toContain('✕');
  });

  // countsByStep é do servidor: a coluna 3 mostra 4 mesmo sem cartão carregado.
  it('mostra a contagem do servidor, não o número de cartões na página', () => {
    const columns = factory().findAll('section[aria-label]');

    expect(columns[2].text()).toContain('4');
  });

  it('distingue coluna vazia de coluna com cartão além da página', () => {
    const columns = factory().findAll('section[aria-label]');

    expect(columns[1].text()).toContain('KANBAN_ATRIA.EMPTY.COLUMN');
    expect(columns[2].text()).toContain('KANBAN_ATRIA.EMPTY.BEYOND_PAGE');
  });

  it('mostra uma aba por quadro e marca a ativa', () => {
    const tabs = factory().findAll('nav button');

    expect(tabs).toHaveLength(2);
    expect(tabs[0].attributes('aria-current')).toBe('true');
    expect(tabs[1].attributes('aria-current')).toBeUndefined();
  });

  it('emite selectBoard ao clicar em outra aba', async () => {
    const wrapper = factory();

    await wrapper.findAll('nav button')[1].trigger('click');

    expect(wrapper.emitted('selectBoard')[0]).toEqual(['b']);
  });

  // A régua do qa-code: a falha chega como falha, dizendo o que houve, sem o
  // operador precisar olhar log nem banco.
  it('mostra o motivo do erro e um caminho de saída', async () => {
    const wrapper = factory({ error: { reason: 'unknown_account' } });

    expect(wrapper.text()).toContain('KANBAN_ATRIA.ERROR.BOARD_LOAD_FAILED');
    expect(wrapper.text()).toContain(
      'KANBAN_ATRIA.ERROR.REASON.UNKNOWN_ACCOUNT'
    );

    await wrapper.find('[data-testid="kanban-retry"]').trigger('click');
    expect(wrapper.emitted('retry')).toBeTruthy();
  });

  // Falha em um quadro não pode prender o operador nele: as abas seguem
  // clicáveis pra ele tentar o outro. (Descoberto por este spec.)
  it('mantém as abas utilizáveis quando a carga falha', () => {
    const wrapper = factory({ error: { reason: 'unknown_account' } });

    expect(wrapper.findAll('nav button')).toHaveLength(2);
  });

  it('não mostra coluna nenhuma enquanto carrega', () => {
    const wrapper = factory({ isLoading: true });

    expect(wrapper.find('[aria-busy="true"]').exists()).toBe(true);
    expect(wrapper.findAll('section[aria-label]')).toHaveLength(0);
  });

  it('diz quando não há quadro configurado', () => {
    const wrapper = factory({ steps: [] });

    expect(wrapper.text()).toContain('KANBAN_ATRIA.EMPTY.BOARD');
  });
});
