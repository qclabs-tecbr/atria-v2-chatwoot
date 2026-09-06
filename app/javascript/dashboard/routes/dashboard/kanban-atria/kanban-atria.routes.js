/**
 * ATRIA — rota do nosso Kanban. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Diretório próprio, deliberadamente separado de `kanban/` (que é o do paywall
 * da versão paga): o upstream nunca toca aqui, então update deles não conflita
 * com nada nosso. O único ponto de contato é o import em `dashboard.routes.js`.
 *
 * Requisito de origem: Fábio, #plano msg 1487 (itens 2 e 3).
 */
import { frontendURL } from '../../../helper/URLHelper';
import KanbanAtriaIndex from './Index.vue';

// Mesmos papéis da rota nativa do Kanban: quem opera é a secretária digital
// (via API), mas quem ABRE a tela é gente da conta. Isto é guarda de roteador,
// não autorização — a fronteira real é a nossa API (dev-sr, #plano msg 1366).
const meta = {
  permissions: ['administrator', 'agent', 'custom_role'],
};

export const routes = [
  {
    path: frontendURL('accounts/:accountId/kanban-atria'),
    component: KanbanAtriaIndex,
    name: 'kanban_atria_view',
    meta,
  },
];
