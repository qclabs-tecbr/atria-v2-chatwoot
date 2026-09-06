<script setup>
/** ATRIA — coluna (etapa) do Kanban. NÃO É CÓDIGO DO UPSTREAM. */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { stepColorClasses } from '../kanbanStepColor';
import KanbanCard from './KanbanCard.vue';

const props = defineProps({
  step: { type: Object, required: true },
  cards: { type: Array, default: () => [] },
  // Sempre do servidor — nunca `cards.length` (docs/kanban-ui.md §5).
  count: { type: Number, default: 0 },
  // null | 'empty' | 'beyond-page'
  emptyKind: { type: String, default: null },
});

const { t } = useI18n();

const colors = computed(() => stepColorClasses(props.step.color));

// Terminal nunca é marcado só por cor — o glifo é obrigatório (§8.2).
const terminalGlyph = computed(() => {
  if (props.step.completed) return '✓';
  if (props.step.cancelled) return '✕';
  return null;
});
</script>

<template>
  <section
    class="flex flex-col shrink-0 w-[280px] rounded-lg"
    :class="colors.tint"
    :aria-label="step.name"
  >
    <header class="flex items-center gap-2 px-3 py-2">
      <span class="rounded-full size-2 shrink-0" :class="colors.dot" />
      <h2 class="text-sm font-medium truncate text-n-slate-12">
        {{ step.name }}
      </h2>
      <span v-if="terminalGlyph" class="text-xs text-n-slate-11">
        {{ terminalGlyph }}
      </span>
      <span class="ml-auto text-xs tabular-nums text-n-slate-11">
        {{ count }}
      </span>
    </header>

    <div class="flex flex-col gap-2 px-2 pb-2 overflow-y-auto">
      <KanbanCard v-for="card in cards" :key="card.id" :card="card" />

      <p
        v-if="emptyKind === 'empty'"
        class="px-1 py-4 text-xs text-center text-n-slate-10"
      >
        {{ t('KANBAN_ATRIA.EMPTY.COLUMN') }}
      </p>
      <p
        v-else-if="emptyKind === 'beyond-page'"
        class="px-1 py-4 text-xs text-center text-n-slate-10"
      >
        {{ t('KANBAN_ATRIA.EMPTY.BEYOND_PAGE', { count }) }}
      </p>
    </div>
  </section>
</template>
