<script setup>
/**
 * ATRIA — story do quadro. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Existe pra conferir o visual sem Rails, sem Postgres e sem Docker: o
 * Histoire roda só Vite (`pnpm story:dev`). Cobre as 11 cores canônicas nos
 * dois temas, os estados vazios e o de erro — que é justamente o que não dá
 * pra ver em teste unitário nem em `curl`.
 */
import KanbanBoard from './KanbanBoard.vue';
import KanbanCardDetail from './KanbanCardDetail.vue';

// Hexes de docs/KANBAN-DESIGN.md §2, exatamente como o servidor os manda.
const atendimento = [
  { id: '1', name: 'Novo contato', color: '#94A3B8', position: 1 },
  { id: '2', name: 'Conversando', color: '#38BDF8', position: 2 },
  { id: '3', name: 'Agendado', color: '#6366F1', position: 3 },
  {
    id: '4',
    name: 'Confirmado',
    color: '#22C55E',
    position: 4,
    completed: true,
  },
  { id: '5', name: 'Perdido', color: '#64748B', position: 5, cancelled: true },
];

const consulta = [
  { id: '6', name: 'Agendamentos', color: '#818CF8', position: 1 },
  { id: '7', name: 'Agendado hoje', color: '#38BDF8', position: 2 },
  { id: '8', name: 'Compareceu', color: '#FBBF24', position: 3 },
  {
    id: '9',
    name: 'Consulta concluída',
    color: '#10B981',
    position: 4,
    completed: true,
  },
  {
    id: '10',
    name: 'Cancelada',
    color: '#F43F5E',
    position: 5,
    cancelled: true,
  },
  {
    id: '11',
    name: 'Não compareceu',
    color: '#6B7280',
    position: 6,
    cancelled: true,
  },
];

const card = (id, stepId, name, priority, description) => ({
  id,
  stepId,
  title: name,
  description,
  priority,
  contact: { id, name, phone: '+55 11 90000-0000' },
});

const cardsByStep = {
  1: [
    card('a', '1', 'Ana Souza', 'medium', 'Primeira mensagem pelo WhatsApp.'),
    card('b', '1', 'Bruno Lima', 'low', null),
  ],
  2: [card('c', '2', 'Carla Dias', 'high', 'Quer horário na quinta de manhã.')],
  3: [
    card(
      'd',
      '3',
      'Diego Alves',
      'urgent',
      'Sinal emitido, aguardando pagamento.'
    ),
  ],
  4: [card('e', '4', 'Elisa Prado', 'medium', null)],
  5: [],
};

const boards = [
  { id: 'a', name: 'Atendimento' },
  { id: 'b', name: 'Consulta' },
];

const emptyKind = id => (cardsByStep[id]?.length ? null : 'empty');

const detailCard = {
  id: 'a',
  title: 'Ana Souza',
  description:
    'Queixa: dor lombar há 3 semanas.\nJá fez fisioterapia em 2025, sem melhora.',
  priority: 'high',
  dueDate: '2026-09-10T14:00:00.000Z',
  chatwootConversationId: 42,
  contact: { id: '1', name: 'Ana Souza', phone: '+55 11 90000-0000' },
  transitions: [
    {
      id: 't1',
      fromStepId: null,
      toStepId: '1',
      performedBy: 'agent:beatriz',
      performedByLabel: 'Beatriz',
      reason: null,
      createdAt: '2026-09-04T09:12:00.000Z',
    },
    {
      id: 't2',
      fromStepId: '1',
      toStepId: '3',
      performedBy: 'user:3',
      performedByLabel: 'Amanda',
      reason: 'Paciente ligou pedindo quinta de manhã.',
      createdAt: '2026-09-05T16:40:00.000Z',
    },
  ],
};
const noop = () => {};
</script>

<template>
  <Story title="Atria/KanbanBoard" :layout="{ type: 'single', iframe: true }">
    <Variant title="Atendimento (com cartões)">
      <div class="h-[560px] bg-n-surface-1">
        <KanbanBoard
          :boards="boards"
          active-board-id="a"
          :steps="atendimento"
          :cards-by-step="cardsByStep"
          :counts-by-step="{ 1: 2, 2: 1, 3: 1, 4: 1, 5: 0 }"
          :step-empty-kind="emptyKind"
          @select-board="noop"
          @retry="noop"
        />
      </div>
    </Variant>

    <Variant title="Consulta (6 colunas, cabe na largura?)">
      <div class="h-[560px] bg-n-surface-1">
        <KanbanBoard
          :boards="boards"
          active-board-id="b"
          :steps="consulta"
          :cards-by-step="{}"
          :counts-by-step="{ 6: 12, 7: 3, 8: 1, 9: 40, 10: 2, 11: 5 }"
          :step-empty-kind="() => 'beyond-page'"
          @select-board="noop"
          @retry="noop"
        />
      </div>
    </Variant>

    <Variant title="Carregando">
      <div class="h-[560px] bg-n-surface-1">
        <KanbanBoard :boards="boards" active-board-id="a" is-loading />
      </div>
    </Variant>

    <Variant title="Erro com motivo">
      <div class="h-[560px] bg-n-surface-1">
        <KanbanBoard
          :boards="boards"
          active-board-id="a"
          :steps="atendimento"
          :error="{ reason: 'no_atria_user' }"
          @retry="noop"
        />
      </div>
    </Variant>

    <Variant title="Cartão aberto (notas, anexos, histórico)">
      <div class="max-w-lg p-4 bg-n-surface-1">
        <KanbanCardDetail
          :card="detailCard"
          :steps="atendimento"
          account-id="7"
        />
      </div>
    </Variant>

    <Variant title="Cartão sem conversa (sem anexos)">
      <div class="max-w-lg p-4 bg-n-surface-1">
        <KanbanCardDetail
          :card="{
            ...detailCard,
            chatwootConversationId: null,
            description: null,
            transitions: [],
          }"
          :steps="atendimento"
          account-id="7"
        />
      </div>
    </Variant>

    <Variant title="Sem quadro configurado">
      <div class="h-[560px] bg-n-surface-1">
        <KanbanBoard :boards="[]" :steps="[]" />
      </div>
    </Variant>
  </Story>
</template>
