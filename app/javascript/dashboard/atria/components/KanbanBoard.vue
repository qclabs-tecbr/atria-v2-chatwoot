<script setup>
/**
 * ATRIA — quadro do Kanban (leitura). NÃO É CÓDIGO DO UPSTREAM.
 *
 * Recebe o estado pronto em vez de carregar sozinho, pra poder ser montado com
 * fixture no Histoire sem Rails, sem API e sem banco.
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import KanbanColumn from './KanbanColumn.vue';

const props = defineProps({
  boards: { type: Array, default: () => [] },
  activeBoardId: { type: [String, Number], default: null },
  steps: { type: Array, default: () => [] },
  cardsByStep: { type: Object, default: () => ({}) },
  countsByStep: { type: Object, default: () => ({}) },
  stepEmptyKind: { type: Function, default: () => null },
  isLoading: { type: Boolean, default: false },
  error: { type: Object, default: null },
});

defineEmits(['selectBoard', 'retry']);

const { t } = useI18n();

// Motivos que o backend devolve (src/modules/chatwoot/agent-auth.ts). Escritos
// por extenso pelo mesmo motivo da prioridade: chave montada em runtime some do
// extrator e vira texto faltando em produção.
const REASON_LABEL = {
  agents_url_not_configured:
    'KANBAN_ATRIA.ERROR.REASON.AGENTS_URL_NOT_CONFIGURED',
  missing_credentials: 'KANBAN_ATRIA.ERROR.REASON.MISSING_CREDENTIALS',
  unknown_account: 'KANBAN_ATRIA.ERROR.REASON.UNKNOWN_ACCOUNT',
  account_not_in_profile: 'KANBAN_ATRIA.ERROR.REASON.ACCOUNT_NOT_IN_PROFILE',
  no_atria_user: 'KANBAN_ATRIA.ERROR.REASON.NO_ATRIA_USER',
};

// Motivo desconhecido não vira texto inventado: some a linha e fica só a
// mensagem geral, que já diz que falhou.
const reasonText = computed(() => {
  const key = REASON_LABEL[props.error?.reason];
  // A chave vem do mapa acima, sempre literal — o extrator enxerga todas.
  // eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys
  return key ? t(key) : null;
});
</script>

<template>
  <div class="flex flex-col w-full h-full overflow-hidden">
    <nav
      v-if="boards.length > 1"
      class="flex items-center gap-1 px-4 pt-3"
      :aria-label="t('KANBAN_ATRIA.TITLE')"
    >
      <button
        v-for="board in boards"
        :key="board.id"
        type="button"
        class="px-3 py-1.5 text-sm rounded-lg"
        :class="
          board.id === activeBoardId
            ? 'bg-n-solid-1 text-n-slate-12 font-medium'
            : 'text-n-slate-11 hover:bg-n-solid-1'
        "
        :aria-current="board.id === activeBoardId ? 'true' : undefined"
        @click="$emit('selectBoard', board.id)"
      >
        {{ board.name }}
      </button>
    </nav>

    <!-- Falha de carga fala o que aconteceu e oferece saída: o operador não
         pode precisar de log nem banco pra saber que falhou (qa-code). -->
    <div
      v-if="error"
      class="flex flex-col items-center justify-center flex-1 gap-3 px-6"
    >
      <p class="text-sm text-center text-n-slate-11">
        {{ t('KANBAN_ATRIA.ERROR.BOARD_LOAD_FAILED') }}
      </p>
      <p v-if="reasonText" class="text-xs text-center text-n-slate-10">
        {{ reasonText }}
      </p>
      <button
        type="button"
        class="px-3 py-1.5 text-sm rounded-lg bg-n-solid-1 text-n-slate-12"
        data-testid="kanban-retry"
        @click="$emit('retry')"
      >
        {{ t('KANBAN_ATRIA.ERROR.RETRY') }}
      </button>
    </div>

    <div
      v-else-if="isLoading"
      class="flex gap-3 px-4 py-3 overflow-x-auto"
      aria-busy="true"
    >
      <div
        v-for="n in 4"
        :key="n"
        class="shrink-0 w-[280px] h-40 rounded-lg animate-pulse bg-n-slate-3"
      />
    </div>

    <p
      v-else-if="!steps.length"
      class="flex items-center justify-center flex-1 text-sm text-n-slate-11"
    >
      {{ t('KANBAN_ATRIA.EMPTY.BOARD') }}
    </p>

    <div v-else class="flex flex-1 gap-3 px-4 py-3 overflow-x-auto">
      <KanbanColumn
        v-for="step in steps"
        :key="step.id"
        :step="step"
        :cards="cardsByStep[step.id] || []"
        :count="countsByStep[step.id] || 0"
        :empty-kind="stepEmptyKind(step.id)"
      />
    </div>
  </div>
</template>
