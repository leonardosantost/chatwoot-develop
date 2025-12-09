<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import KanbanCard from './KanbanCard.vue';

const props = defineProps({
  label: {
    type: Object,
    required: true,
    // { id, title, color }
  },
  conversations: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['drop', 'dragover']);

const { t } = useI18n();

const isDragOver = ref(false);
const draggedConversationId = ref(null);
const dropIndex = ref(null);

const conversationCount = computed(() => props.conversations.length);

const handleDragOver = (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  isDragOver.value = true;
  dropIndex.value = props.conversations.length;
  emit('dragover', props.label.id);
};

const handleDragLeave = () => {
  isDragOver.value = false;
  dropIndex.value = null;
};

const handleDrop = (e) => {
  e.preventDefault();
  isDragOver.value = false;
  const targetIndex =
    dropIndex.value === null ? props.conversations.length : dropIndex.value;

  const conversationId = parseInt(e.dataTransfer.getData('text/plain'));
  const fromLabelId = e.dataTransfer.getData('kanban/fromLabelId');
  const fromIndex = Number.parseInt(
    e.dataTransfer.getData('kanban/fromIndex'),
    10
  );

  if (conversationId) {
    emit('drop', {
      conversationId,
      fromLabelId: fromLabelId || undefined,
      fromIndex: Number.isNaN(fromIndex) ? undefined : fromIndex,
      toIndex: targetIndex,
      labelId: props.label.id,
      labelTitle: props.label.title,
    });
  }

  dropIndex.value = null;
};

const handleDragStart = (conversationId, index) => {
  draggedConversationId.value = conversationId;
  dropIndex.value = index;
};

const handleDragEnd = () => {
  draggedConversationId.value = null;
  dropIndex.value = null;
};

const handleCardDragOver = (index) => {
  dropIndex.value = index;
  isDragOver.value = true;
};
</script>

<template>
  <div
    class="flex flex-col w-80 bg-n-solid-2 dark:bg-n-solid-3 rounded-lg overflow-hidden"
    :class="{ 'ring-2 ring-offset-2': isDragOver }"
    :style="{ '--ring-color': label.color }"
  >
    <!-- Header da coluna -->
    <div
      class="px-4 py-3 border-b border-n-weak"
      :style="{ backgroundColor: label.color + '15' }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-3 h-3 rounded-full flex-shrink-0"
            :style="{ backgroundColor: label.color }"
          />
          <h3 class="font-semibold text-sm text-n-solid-11 dark:text-n-solid-1">
            {{ label.title }}
          </h3>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-n-alpha-2 text-n-slate-11 dark:text-n-slate-1">
          {{ conversationCount }}
        </span>
      </div>
    </div>

    <!-- Área de drop para cards -->
    <div
      class="flex-1 p-3 overflow-y-auto space-y-2 min-h-96 transition-colors"
      :class="[
        isDragOver
          ? 'bg-n-alpha-1 border-2 border-dashed'
          : 'bg-transparent border-2 border-transparent',
      ]"
      :style="isDragOver ? { borderColor: label.color + '50' } : {}"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- Cards de conversa -->
      <template v-if="conversations.length > 0">
        <KanbanCard
          v-for="(conversation, index) in conversations"
          :key="conversation.id"
          :conversation="conversation"
          :label-id="label.id"
          :index="index"
          :is-dragging="draggedConversationId === conversation.id"
          @dragstart="handleDragStart(conversation.id, index)"
          @dragend="handleDragEnd"
          @dragover.prevent="handleCardDragOver(index)"
        />
      </template>

      <!-- Estado vazio -->
      <div
        v-else
        class="flex items-center justify-center h-full text-center text-n-slate-9 dark:text-n-slate-6"
      >
        <div class="py-8">
          <div class="i-lucide-inbox size-8 mx-auto mb-2 opacity-50" />
          <p class="text-sm">
            {{ t('KANBAN.EMPTY_COLUMN') || 'Nenhuma conversa' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
div::-webkit-scrollbar {
  width: 6px;
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
