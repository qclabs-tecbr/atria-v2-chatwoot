import { mount } from '@vue/test-utils';
import KanbanCardDetail from '../components/KanbanCardDetail.vue';
import { performedByKind } from '../composables/useKanbanCard';

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: k => k }) }));

const steps = [
  { id: '1', name: 'Novo contato', color: '#94A3B8' },
  { id: '2', name: 'Agendado', color: '#6366F1' },
];

const card = (overrides = {}) => ({
  id: 'c1',
  title: 'Ana Souza',
  description: 'Queixa: dor lombar há 3 semanas.',
  priority: 'high',
  dueDate: '2026-09-10T14:00:00.000Z',
  chatwootConversationId: 42,
  conversationId: '9001',
  contact: { id: '5', name: 'Ana Souza', phone: '+55 11 90000-0000' },
  transitions: [],
  ...overrides,
});

const factory = (props = {}) =>
  mount(KanbanCardDetail, {
    // Stub que expõe o destino como atributo: assim o teste checa PARA ONDE o
    // link aponta, que é o ponto de risco, sem depender do vue-router real.
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
        },
      },
    },
    props: { card: card(), steps, accountId: '7', ...props },
  });

describe('KanbanCardDetail', () => {
  it('mostra o paciente e as notas do cartão', () => {
    const text = factory().text();

    expect(text).toContain('Ana Souza');
    expect(text).toContain('dor lombar');
  });

  it('diz quando o cartão não tem notas, em vez de deixar vazio', () => {
    const text = factory({ card: card({ description: null }) }).text();

    expect(text).toContain('KANBAN_ATRIA.CARD.NO_NOTES');
  });

  // O furo que eu levantei no #plano msg 1548: o link tem que usar o id do
  // CHATWOOT, nunca o nosso PK interno — os dois são números diferentes e
  // trocá-los abre a conversa errada sem erro nenhum.
  it('liga os anexos à conversa usando o id do Chatwoot, não o PK interno', () => {
    const link = factory().find('[data-testid="kanban-conversation-link"]');

    expect(JSON.parse(link.attributes('data-to'))).toEqual({
      name: 'inbox_conversation',
      params: { accountId: '7', conversation_id: 42 },
    });
  });

  it('não confunde conversationId (nosso) com chatwootConversationId', () => {
    const link = factory().find('[data-testid="kanban-conversation-link"]');
    const to = JSON.parse(link.attributes('data-to'));

    expect(to.params.conversation_id).toBe(42);
    expect(to.params.conversation_id).not.toBe('9001');
  });

  // Requisito do qa-code (#plano msg 1549): sem anexo, a tela DIZ isso.
  it('explica a ausência de anexos quando não há conversa ligada', () => {
    const wrapper = factory({ card: card({ chatwootConversationId: null }) });

    expect(
      wrapper.find('[data-testid="kanban-conversation-link"]').exists()
    ).toBe(false);
    expect(wrapper.text()).toContain('KANBAN_ATRIA.CARD.NO_CONVERSATION');
  });

  it('monta a trilha de transições com nome de etapa, não id', () => {
    const wrapper = factory({
      card: card({
        transitions: [
          {
            id: 't1',
            fromStepId: '1',
            toStepId: '2',
            performedBy: 'agent:beatriz',
            performedByLabel: 'Beatriz',
            reason: null,
            createdAt: '2026-09-06T12:00:00.000Z',
          },
        ],
      }),
    });

    const text = wrapper.text();
    expect(text).toContain('Novo contato');
    expect(text).toContain('Agendado');
    expect(text).toContain('Beatriz');
  });

  it('mostra o motivo da transição quando existe', () => {
    const text = factory({
      card: card({
        transitions: [
          {
            id: 't1',
            fromStepId: '1',
            toStepId: '2',
            performedBy: 'user:3',
            performedByLabel: 'Amanda',
            reason: 'Paciente remarcou por telefone',
            createdAt: '2026-09-06T12:00:00.000Z',
          },
        ],
      }),
    }).text();

    expect(text).toContain('Paciente remarcou por telefone');
  });

  it('diz quando o cartão nunca mudou de etapa', () => {
    expect(factory().text()).toContain('KANBAN_ATRIA.CARD.NO_HISTORY');
  });

  it('mostra carga e falha sem vazar dado do cartão anterior', () => {
    expect(factory({ card: null, isLoading: true }).text()).toContain(
      'KANBAN_ATRIA.CARD.LOADING'
    );
    const failed = factory({ card: null, error: { reason: 'x' } });
    expect(failed.text()).toContain('KANBAN_ATRIA.CARD.LOAD_FAILED');
    expect(failed.text()).not.toContain('Ana Souza');
  });
});

describe('performedByKind', () => {
  it('distingue a secretária digital de uma pessoa e da automação', () => {
    expect(performedByKind('agent:beatriz')).toBe('agent');
    expect(performedByKind('user:12')).toBe('user');
    expect(performedByKind('system')).toBe('system');
    expect(performedByKind(null)).toBe('system');
    expect(performedByKind('')).toBe('system');
  });
});
