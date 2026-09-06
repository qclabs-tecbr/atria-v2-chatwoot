/**
 * ATRIA — transformação do menu lateral. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Por que este arquivo existe:
 * o `Sidebar.vue` do Chatwoot monta o menu como um array literal de ~620 linhas
 * dentro de uma `computed`. Editar aquele array para inserir o nosso item colocaria
 * um patch nosso no meio de um trecho que a fazer.ai e o Chatwoot mexem a cada
 * release — todo update viraria conflito.
 *
 * Em vez disso, o `Sidebar.vue` sofre UMA alteração de duas linhas (o import daqui
 * e `return applyAtriaMenu(items)` no lugar de `return items`), e toda a lógica
 * nossa mora neste arquivo, que o upstream não conhece. O upstream pode adicionar,
 * remover e reordenar itens à vontade lá dentro que não conflita com nada nosso.
 *
 * Se um dia eles reestruturarem a `computed`, isto quebra no build — alto e visível,
 * nunca em silêncio.
 *
 * Requisito de origem: Fábio, #plano msg 1487 (itens 1, 2 e 5).
 */

/** Item de menu do Chatwoot cujo destino é o Kanban pago (paywall). */
const PAYWALL_KANBAN_ROUTE = 'kanban_view';

/** Nome da nossa rota. Definido em routes/dashboard/kanban-atria/. */
export const ATRIA_KANBAN_ROUTE = 'kanban_atria_view';

/**
 * Esconde o item "Kanban" nativo (que hoje só leva à tela de upgrade da versão
 * paga) e acrescenta o nosso, no mesmo lugar da lista para não bagunçar a ordem
 * que o operador já conhece.
 *
 * @param {Array<object>} items menu montado pelo Sidebar.vue
 * @param {(key: string) => string} t tradutor do vue-i18n, vindo do Sidebar.vue
 * @returns {Array<object>} menu com o item do paywall trocado pelo nosso
 */
export function applyAtriaMenu(items, t) {
  const atriaItem = {
    name: 'KanbanAtria',
    label: t('SIDEBAR.KANBAN_ATRIA'),
    // Ícone deliberadamente diferente do `i-lucide-columns-3` do item nativo:
    // os dois não convivem hoje, mas se um update do upstream trouxer o item
    // pago de volta por outro caminho, o operador precisa distinguir na hora.
    icon: 'i-lucide-square-kanban',
    to: { name: ATRIA_KANBAN_ROUTE },
    activeOn: [ATRIA_KANBAN_ROUTE],
  };

  const paywallIndex = items.findIndex(
    item => item?.to?.name === PAYWALL_KANBAN_ROUTE
  );

  // O item nativo sumiu (upstream removeu, ou renomeou a rota): não tentamos
  // adivinhar onde ele estava — acrescentamos o nosso no fim e seguimos. A tela
  // continua alcançável, que é o que importa para o operador.
  if (paywallIndex === -1) {
    return [...items, atriaItem];
  }

  return items.map((item, index) =>
    index === paywallIndex ? atriaItem : item
  );
}
