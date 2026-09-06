<script setup>
/** ATRIA — cartão do Kanban. NÃO É CÓDIGO DO UPSTREAM. */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Label from 'dashboard/components-next/label/Label.vue';

const props = defineProps({
  card: { type: Object, required: true },
});

defineEmits(['open']);

const { t } = useI18n();

// Hues dentro do `validator` do Label.vue (kanban-ui.md §8.4).
const PRIORITY_HUE = {
  low: 'slate',
  medium: 'blue',
  high: 'amber',
  urgent: 'ruby',
};

// Chave i18n escrita por extenso, nunca montada em runtime: chave dinâmica
// some do extrator (`i18n:extract`) e vira string faltando em produção sem
// ninguém perceber. O lint do fork avisa disso e o aviso está certo.
const PRIORITY_LABEL = {
  low: 'KANBAN_ATRIA.PRIORITY.LOW',
  medium: 'KANBAN_ATRIA.PRIORITY.MEDIUM',
  high: 'KANBAN_ATRIA.PRIORITY.HIGH',
  urgent: 'KANBAN_ATRIA.PRIORITY.URGENT',
};

const priority = computed(() => props.card.priority ?? null);
const priorityHue = computed(() => PRIORITY_HUE[priority.value] ?? 'slate');
const priorityText = computed(() => {
  const key = PRIORITY_LABEL[priority.value];
  // A chave vem do mapa acima, sempre literal — o extrator enxerga todas.
  // eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys
  return key ? t(key) : null;
});

const patientName = computed(
  () => props.card.contact?.name || props.card.title
);

const dueDate = computed(() => {
  if (!props.card.dueDate) return null;
  return new Date(props.card.dueDate).toLocaleDateString();
});
</script>

<template>
  <article
    class="flex flex-col gap-2 p-3 text-left border rounded-lg cursor-pointer bg-n-solid-1 border-n-weak hover:border-n-strong"
    role="button"
    tabindex="0"
    @click="$emit('open', card.id)"
    @keydown.enter="$emit('open', card.id)"
    @keydown.space.prevent="$emit('open', card.id)"
  >
    <h3 class="text-sm font-medium truncate text-n-slate-12">
      {{ patientName }}
    </h3>

    <p v-if="card.description" class="text-xs line-clamp-2 text-n-slate-11">
      {{ card.description }}
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <Label
        v-if="priorityText"
        :label="priorityText"
        :color="priorityHue"
        compact
      />
      <span v-if="dueDate" class="text-xs text-n-slate-10">{{ dueDate }}</span>
    </div>
  </article>
</template>
