import { applyAtriaMenu, ATRIA_KANBAN_ROUTE } from '../sidebarMenu';

const t = key => key;

const paywallKanbanItem = {
  name: 'Kanban',
  label: 'SIDEBAR.KANBAN',
  icon: 'i-lucide-columns-3',
  to: { name: 'kanban_view' },
  activeOn: ['kanban_view'],
};

const menu = () => [
  { name: 'Inbox', to: { name: 'inbox_view' } },
  { ...paywallKanbanItem },
  { name: 'Captain', to: { name: 'captain_assistants_index' } },
];

describe('applyAtriaMenu', () => {
  it('remove o item do Kanban pago do menu', () => {
    const result = applyAtriaMenu(menu(), t);

    expect(result.some(item => item.to?.name === 'kanban_view')).toBe(false);
  });

  it('acrescenta o nosso item apontando para a nossa rota', () => {
    const result = applyAtriaMenu(menu(), t);
    const atria = result.find(item => item.to?.name === ATRIA_KANBAN_ROUTE);

    expect(atria).toBeTruthy();
    expect(atria.activeOn).toContain(ATRIA_KANBAN_ROUTE);
    expect(atria.label).toBe('SIDEBAR.KANBAN_ATRIA');
  });

  // Requisito do Fábio (#plano msg 1487 item 2): ícone diferente do padrão.
  it('usa ícone diferente do item nativo', () => {
    const result = applyAtriaMenu(menu(), t);
    const atria = result.find(item => item.to?.name === ATRIA_KANBAN_ROUTE);

    expect(atria.icon).not.toBe(paywallKanbanItem.icon);
    expect(atria.icon).toBe('i-lucide-square-kanban');
  });

  it('ocupa a posição do item nativo, sem reordenar o resto', () => {
    const result = applyAtriaMenu(menu(), t);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Inbox');
    expect(result[1].to.name).toBe(ATRIA_KANBAN_ROUTE);
    expect(result[2].name).toBe('Captain');
  });

  // Se um update do upstream remover ou renomear a rota do Kanban pago, a nossa
  // tela não pode sumir do menu junto — é o caso que o requisito 5 protege.
  it('acrescenta no fim quando o item nativo não existe mais', () => {
    const withoutKanban = [
      { name: 'Inbox', to: { name: 'inbox_view' } },
      { name: 'Captain', to: { name: 'captain_assistants_index' } },
    ];

    const result = applyAtriaMenu(withoutKanban, t);

    expect(result).toHaveLength(3);
    expect(result[2].to.name).toBe(ATRIA_KANBAN_ROUTE);
  });

  it('não muta o array recebido do Sidebar.vue', () => {
    const original = menu();

    applyAtriaMenu(original, t);

    expect(original[1].to.name).toBe('kanban_view');
  });

  // Itens de grupo (Captain, Reports) não têm `to` — o findIndex não pode estourar.
  it('tolera item sem destino', () => {
    const withGroup = [
      { name: 'Reports', children: [{ name: 'Overview' }] },
      { ...paywallKanbanItem },
    ];

    expect(() => applyAtriaMenu(withGroup, t)).not.toThrow();
    expect(applyAtriaMenu(withGroup, t)[1].to.name).toBe(ATRIA_KANBAN_ROUTE);
  });
});
