<script setup>
/**
 * ATRIA — detalhe do cartão. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Recebe o cartão pronto em vez de carregar sozinho, pra poder ser montado com
 * fixture no Histoire e em teste sem API.
 */
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Label from 'dashboard/components-next/label/Label.vue';
import { performedByKind } from '../composables/useKanbanCard';

const props = defineProps({
  card: { type: Object, default: null },
  steps: { type: Array, default: () => [] },
  accountId: { type: [String, Number], default: null },
  isLoading: { type: Boolean, default: false },
  error: { type: Object, default: null },
});

const { t } = useI18n();

const PRIORITY_HUE = {
  low: 'slate',
  medium: 'blue',
  high: 'amber',
  urgent: 'ruby',
};

// Chaves literais: chave montada em runtime some do extrator de i18n.
const PRIORITY_LABEL = {
  low: 'KANBAN_ATRIA.PRIORITY.LOW',
  medium: 'KANBAN_ATRIA.PRIORITY.MEDIUM',
  high: 'KANBAN_ATRIA.PRIORITY.HIGH',
  urgent: 'KANBAN_ATRIA.PRIORITY.URGENT',
};

const PERFORMER_LABEL = {
  agent: 'KANBAN_ATRIA.CARD.BY_AGENT',
  user: 'KANBAN_ATRIA.CARD.BY_USER',
  system: 'KANBAN_ATRIA.CARD.BY_SYSTEM',
};

const stepName = id => props.steps.find(s => s.id === id)?.name ?? null;

const patientName = computed(
  () => props.card?.contact?.name || props.card?.title || null
);

const priorityText = computed(() => {
  const key = PRIORITY_LABEL[props.card?.priority];
  // eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys
  return key ? t(key) : null;
});

const priorityHue = computed(
  () => PRIORITY_HUE[props.card?.priority] ?? 'slate'
);

const dueDate = computed(() =>
  props.card?.dueDate ? new Date(props.card.dueDate).toLocaleString() : null
);

/**
 * Link para a conversa no Chatwoot — é lá que moram os anexos que o paciente
 * mandou (decisão do coordinator, #plano msg 1546). Usa o id do CHATWOOT, não
 * o nosso PK: os dois são números diferentes e trocá-los abriria a conversa
 * errada sem erro nenhum (#plano msg 1548).
 */
const conversationRoute = computed(() => {
  const id = props.card?.chatwootConversationId;
  if (!id || !props.accountId) return null;
  return {
    name: 'inbox_conversation',
    params: { accountId: props.accountId, conversation_id: id },
  };
});

const transitions = computed(() =>
  (props.card?.transitions ?? []).map(transition => {
    const from = stepName(transition.fromStepId);
    const to = stepName(transition.toStepId);
    const kind = performedByKind(transition.performedBy);
    const key = PERFORMER_LABEL[kind];
    // eslint-disable-next-line @intlify/vue-i18n/no-dynamic-keys
    const performer = transition.performedByLabel || t(key);
    return {
      ...transition,
      // Seta e ponto médio são pontuação, não texto traduzível — montados aqui
      // para não virarem string solta no template (regra do lint do fork).
      path: from ? `${from} \u2192 ${to}` : to,
      meta: `${performer} \u00B7 ${new Date(transition.createdAt).toLocaleString()}`,
    };
  })
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <p v-if="isLoading" class="py-6 text-sm text-center text-n-slate-11">
      {{ t('KANBAN_ATRIA.CARD.LOADING') }}
    </p>

    <p v-else-if="error" class="py-6 text-sm text-center text-n-slate-11">
      {{ t('KANBAN_ATRIA.CARD.LOAD_FAILED') }}
    </p>

    <template v-else-if="card">
      <header class="flex flex-wrap items-center gap-2">
        <h2 class="text-base font-medium text-n-slate-12">
          {{ patientName }}
        </h2>
        <Label
          v-if="priorityText"
          :label="priorityText"
          :color="priorityHue"
          compact
        />
      </header>

      <dl class="grid grid-cols-2 gap-3 text-sm">
        <div v-if="card.contact?.phone">
          <dt class="text-xs text-n-slate-10">
            {{ t('KANBAN_ATRIA.CARD.PHONE') }}
          </dt>
          <dd class="text-n-slate-12">{{ card.contact.phone }}</dd>
        </div>
        <div v-if="dueDate">
          <dt class="text-xs text-n-slate-10">
            {{ t('KANBAN_ATRIA.CARD.DUE_DATE') }}
          </dt>
          <dd class="text-n-slate-12">{{ dueDate }}</dd>
        </div>
      </dl>

      <section>
        <h3 class="mb-1 text-xs text-n-slate-10">
          {{ t('KANBAN_ATRIA.CARD.NOTES') }}
        </h3>
        <p
          v-if="card.description"
          class="text-sm whitespace-pre-line text-n-slate-12"
        >
          {{ card.description }}
        </p>
        <p v-else class="text-sm text-n-slate-10">
          {{ t('KANBAN_ATRIA.CARD.NO_NOTES') }}
        </p>
      </section>

      <section>
        <h3 class="mb-1 text-xs text-n-slate-10">
          {{ t('KANBAN_ATRIA.CARD.ATTACHMENTS') }}
        </h3>
        <router-link
          v-if="conversationRoute"
          :to="conversationRoute"
          class="text-sm text-n-brand hover:underline"
          data-testid="kanban-conversation-link"
        >
          {{ t('KANBAN_ATRIA.CARD.OPEN_CONVERSATION') }}
        </router-link>
        <!-- Sem conversa ligada não há anexo a mostrar. Dizer isso é requisito
             do qa-code (#plano msg 1549): silêncio parece tela quebrada. -->
        <p v-else class="text-sm text-n-slate-10">
          {{ t('KANBAN_ATRIA.CARD.NO_CONVERSATION') }}
        </p>
      </section>

      <section>
        <h3 class="mb-2 text-xs text-n-slate-10">
          {{ t('KANBAN_ATRIA.CARD.HISTORY') }}
        </h3>
        <ol v-if="transitions.length" class="flex flex-col gap-2">
          <li
            v-for="transition in transitions"
            :key="transition.id"
            class="flex flex-col gap-0.5 text-sm"
          >
            <span class="text-n-slate-12">{{ transition.path }}</span>
            <span class="text-xs text-n-slate-10">{{ transition.meta }}</span>
            <span v-if="transition.reason" class="text-xs text-n-slate-11">
              {{ transition.reason }}
            </span>
          </li>
        </ol>
        <p v-else class="text-sm text-n-slate-10">
          {{ t('KANBAN_ATRIA.CARD.NO_HISTORY') }}
        </p>
      </section>
    </template>
  </div>
</template>
