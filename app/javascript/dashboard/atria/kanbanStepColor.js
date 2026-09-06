/**
 * ATRIA — cor de etapa do Kanban. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Implementa `services/agents/docs/kanban-ui.md` §8.2/§8.3 (designer) com a
 * correção C1 do front-sr (#front msg 1439): o mapa é chaveado pelo HEX que o
 * servidor manda em cada etapa, nunca pelo NOME da etapa.
 *
 * Por quê: `KanbanStep.color` é coluna do banco, por tenant. O servidor já é
 * dono da cor e o app React consome `s.color`. Chavear por nome criaria uma
 * segunda fonte de verdade — recolorir uma etapa no banco mudaria o React e
 * não mudaria isto aqui, em silêncio.
 *
 * Por que não usar o hex direto: os tokens do fork são trio RGB
 * (`--iris-9: 91 91 214`), então `background: var(--iris-9)` não renderiza; e o
 * Tailwind purga classe montada em runtime, então `bg-n-${hue}-9` não sobrevive
 * ao build. Por isso mapa estático de classe, igual `components-next/label/Label.vue`.
 *
 * As 6 hues abaixo são exatamente as que o `validator` do `Label.vue` aceita.
 */

/** Hue neutro para etapa cuja cor o tenant customizou fora da nossa tabela. */
const FALLBACK_HUE = 'slate';

/**
 * Hex canônico (docs/KANBAN-DESIGN.md §2) -> hue da escala Radix do fork.
 *
 * Dois cinzas quase iguais caem em hues DIFERENTES de propósito, e isto não é
 * engano — é a decisão editorial do designer (§8.2): `Perdido` (#64748B) é
 * terminal negativo por DECISÃO, então acompanha `Cancelada` em `ruby`;
 * `Não compareceu` (#6B7280) é FATO registrado, então fica neutro junto com
 * `Novo contato`. Não "consertar" unificando os dois.
 */
export const KANBAN_STEP_HUE = Object.freeze({
  '#94A3B8': 'slate', // Novo contato
  '#38BDF8': 'blue', // Conversando (F1) e Agendado hoje (F2)
  '#6366F1': 'iris', // Agendado
  '#22C55E': 'teal', // Confirmado ✓
  '#64748B': 'ruby', // Perdido ✕ — ver comentário acima
  '#818CF8': 'iris', // Agendamentos
  '#FBBF24': 'amber', // Compareceu
  '#10B981': 'teal', // Consulta concluída ✓
  '#F43F5E': 'ruby', // Cancelada ✕
  '#6B7280': 'slate', // Não compareceu ✕ — ver comentário acima
});

/**
 * Classes por hue. Degraus escolhidos pelo designer (§8.3): 9 é o único sólido
 * estável nos dois temas, 2 é o tinte da coluna, 8 o anel.
 */
const HUE_CLASSES = Object.freeze({
  slate: { dot: 'bg-n-slate-9', tint: 'bg-n-slate-2', ring: 'ring-n-slate-8' },
  blue: { dot: 'bg-n-blue-9', tint: 'bg-n-blue-2', ring: 'ring-n-blue-8' },
  iris: { dot: 'bg-n-iris-9', tint: 'bg-n-iris-2', ring: 'ring-n-iris-8' },
  teal: { dot: 'bg-n-teal-9', tint: 'bg-n-teal-2', ring: 'ring-n-teal-8' },
  amber: { dot: 'bg-n-amber-9', tint: 'bg-n-amber-2', ring: 'ring-n-amber-8' },
  ruby: { dot: 'bg-n-ruby-9', tint: 'bg-n-ruby-2', ring: 'ring-n-ruby-8' },
});

/**
 * @param {string|null|undefined} hex valor de `step.color` vindo do servidor
 * @returns {string} hue da escala do fork
 */
export function stepHue(hex) {
  if (typeof hex !== 'string') return FALLBACK_HUE;
  return KANBAN_STEP_HUE[hex.trim().toUpperCase()] ?? FALLBACK_HUE;
}

/**
 * @param {string|null|undefined} hex valor de `step.color` vindo do servidor
 * @returns {{dot: string, tint: string, ring: string}} classes Tailwind
 */
export function stepColorClasses(hex) {
  return HUE_CLASSES[stepHue(hex)];
}
