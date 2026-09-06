<script setup>
/**
 * ATRIA — Kanban. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Só leitura nesta etapa: quem opera o Kanban é a secretária digital, por
 * API/tools. A tela existe pra ver as etapas, ver onde cada cartão está e
 * abrir o cartão (Fábio, #plano msg 1530). Não há mover.
 */
import { onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMapGetter } from 'dashboard/composables/store.js';
import { useKanbanBoards } from 'dashboard/atria/composables/useKanbanBoards';
import KanbanBoard from 'dashboard/atria/components/KanbanBoard.vue';

const { t } = useI18n();
const route = useRoute();
const currentUser = useMapGetter('getCurrentUser');

// `access_token` é o api_access_token do Chatwoot — o mesmo que o backend leva
// de volta ao Chatwoot pra provar quem é (introspecção). NÃO é a tripla do
// devise_token_auth que o axios do dashboard usa; aquela o /profile recusa.
const kanban = useKanbanBoards({
  token: () => currentUser.value?.access_token ?? null,
  accountId: () => route.params.accountId ?? null,
});

const isLoading = computed(
  () => kanban.isLoadingBoards.value || kanban.isLoadingCards.value
);

onMounted(kanban.load);
</script>

<template>
  <section
    class="flex flex-col w-full h-full overflow-hidden bg-n-surface-1"
    aria-labelledby="kanban-atria-title"
  >
    <header class="flex items-center gap-2 px-4 py-3 border-b border-n-weak">
      <span
        class="flex items-center justify-center rounded-full size-6 bg-n-solid-blue"
      >
        <span class="i-lucide-square-kanban size-[14px] text-n-brand" />
      </span>
      <h1 id="kanban-atria-title" class="text-base font-medium text-n-slate-12">
        {{ t('KANBAN_ATRIA.TITLE') }}
      </h1>
    </header>

    <KanbanBoard
      :boards="kanban.boards.value"
      :active-board-id="kanban.activeBoardId.value"
      :steps="kanban.steps.value"
      :cards-by-step="kanban.cardsByStep.value"
      :counts-by-step="kanban.countsByStep.value"
      :step-empty-kind="kanban.stepEmptyKind"
      :is-loading="isLoading"
      :error="kanban.error.value"
      @select-board="kanban.selectBoard"
      @retry="kanban.load"
    />
  </section>
</template>
