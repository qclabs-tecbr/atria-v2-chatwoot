<script setup>
/**
 * ATRIA — Kanban. NÃO É CÓDIGO DO UPSTREAM.
 *
 * Esqueleto do [4.5:8]. O board de verdade (colunas, countsByStep, drawer de
 * transições, detalhe do cartão com anexos) entra aqui nos próximos commits,
 * seguindo `services/agents/docs/kanban-ui.md` §8 no repositório v2/dev.
 *
 * Regras já fixadas que este componente tem que respeitar quando crescer:
 * - cor de etapa vem do `color` que o servidor manda, mapeado para a escala
 *   Radix do fork (§8.2/§8.3 + correção do front-sr, #front msg 1439);
 * - nada de hex cru: quebra o tema escuro do Chatwoot;
 * - erro fala o que aconteceu E onde o cartão ficou (§8.7.1, 5 mensagens).
 */
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <section
    class="flex flex-col w-full h-full overflow-hidden bg-n-surface-1"
    aria-labelledby="kanban-atria-title"
  >
    <header class="flex items-center gap-2 px-6 py-4 border-b border-n-weak">
      <span
        class="flex items-center justify-center rounded-full size-6 bg-n-solid-blue"
      >
        <span class="i-lucide-square-kanban size-[14px] text-n-brand" />
      </span>
      <h1 id="kanban-atria-title" class="text-base font-medium text-n-slate-12">
        {{ t('KANBAN_ATRIA.TITLE') }}
      </h1>
    </header>

    <div class="flex items-center justify-center flex-1 px-6">
      <p class="text-sm text-n-slate-11">
        {{ t('KANBAN_ATRIA.EMPTY.SKELETON') }}
      </p>
    </div>
  </section>
</template>
