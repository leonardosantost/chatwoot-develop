<script setup>
import { onMounted, ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useAlert } from 'dashboard/composables';
import KanbanColumn from './KanbanColumn.vue';
import Button from 'dashboard/components-next/button/Button.vue';

const store = useStore();
const { t } = useI18n();
const { showAlert } = useAlert();

const isLoading = ref(false);
const showUntagged = ref(false);

onMounted(async () => {
  await loadKanbanData();
});

const loadKanbanData = async () => {
  isLoading.value = true;
  try {
    await store.dispatch('kanban/loadKanbanData');
  } catch (error) {
    showAlert({
      message: t('KANBAN.ERROR_LOADING_DATA'),
      type: 'error',
    });
  } finally {
    isLoading.value = false;
  }
};

const kanbanLabels = computed(() =>
  store.getters['kanban/getKanbanLabels']
);

const untaggedConversations = computed(() =>
  store.getters['kanban/getUntaggedConversations']
);

const handleDrop = async (data) => {
  const { conversationId, labelId, labelTitle } = data;

  try {
    await store.dispatch('kanban/moveConversationToLabel', {
      conversationId,
      labelId,
      labelTitle,
    });

    showAlert({
      message: t('KANBAN.CONVERSATION_MOVED'),
      type: 'success',
    });
  } catch (error) {
    showAlert({
      message: t('KANBAN.ERROR_MOVING_CONVERSATION'),
      type: 'error',
    });
  }
};

const toggleUntaggedView = () => {
  showUntagged.value = !showUntagged.value;
};

const refreshData = async () => {
  await loadKanbanData();
  showAlert({
    message: t('KANBAN.DATA_REFRESHED'),
    type: 'success',
  });
};
</script>

<template>
  <div class="flex flex-col h-screen bg-n-solid-1 dark:bg-n-black">
    <!-- Header -->
    <div class="flex-shrink-0 border-b border-n-weak px-6 py-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-n-solid-12 dark:text-n-solid-0">
          {{ t('SIDEBAR.SALES_FUNNEL') || 'Funil de Vendas' }}
        </h1>
        <p class="text-sm text-n-slate-10 dark:text-n-slate-6 mt-1">
          {{ t('KANBAN.SUBTITLE') || 'Organize suas conversas em colunas por etiqueta' }}
        </p>
      </div>

      <div class="flex gap-2">
        <Button
          icon="i-lucide-refresh-cw"
          color="slate"
          size="sm"
          :disabled="isLoading"
          @click="refreshData"
        >
          {{ t('COMMON.REFRESH') }}
        </Button>

        <Button
          :icon="showUntagged ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          color="slate"
          size="sm"
          @click="toggleUntaggedView"
        >
          {{ showUntagged ? t('KANBAN.HIDE_UNTAGGED') : t('KANBAN.SHOW_UNTAGGED') }}
        </Button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex items-center justify-center flex-1">
      <div class="text-center">
        <div class="i-lucide-loader size-8 animate-spin mx-auto mb-4 text-n-slate-9" />
        <p class="text-n-slate-10">{{ t('COMMON.LOADING') }}</p>
      </div>
    </div>

    <!-- Kanban board -->
    <div v-else class="flex-1 overflow-x-auto overflow-y-hidden p-6">
      <div class="flex gap-6 h-full pb-4 min-w-min">
        <!-- Colunas com labels -->
        <KanbanColumn
          v-for="label in kanbanLabels"
          :key="label.id"
          :label="label"
          :conversations="store.getters['kanban/getConversationsByLabel'](label.id)"
          @drop="handleDrop"
        />

        <!-- Coluna de conversas sem label (opcional) -->
        <div v-if="showUntagged" class="flex-shrink-0">
          <KanbanColumn
            :label="{ id: 'untagged', title: t('KANBAN.UNTAGGED') || 'Sem etiqueta', color: '#9CA3AF' }"
            :conversations="untaggedConversations"
            @drop="handleDrop"
          />
        </div>

        <!-- Estado vazio -->
        <div
          v-if="kanbanLabels.length === 0 && !isLoading"
          class="flex items-center justify-center flex-1 text-center"
        >
          <div>
            <div class="i-lucide-inbox size-12 mx-auto mb-4 text-n-slate-8" />
            <h3 class="text-lg font-semibold text-n-solid-11 dark:text-n-solid-1 mb-2">
              {{ t('KANBAN.NO_LABELS') || 'Nenhuma etiqueta disponível' }}
            </h3>
            <p class="text-n-slate-9 dark:text-n-slate-6 max-w-md">
              {{ t('KANBAN.CREATE_LABELS_HINT') || 'Crie etiquetas nas configurações para começar a usar o kanban' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scrolling */
div {
  scroll-behavior: smooth;
}

/* Custom scrollbar for horizontal scroll */
div::-webkit-scrollbar {
  height: 6px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
