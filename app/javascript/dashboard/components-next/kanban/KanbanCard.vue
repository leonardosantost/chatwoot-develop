<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  conversation: {
    type: Object,
    required: true,
  },
  isDragging: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['dragstart', 'dragend']);

const { t } = useI18n();

const contactName = computed(() => {
  return props.conversation.meta?.contact?.name || props.conversation.meta?.sender?.name || 'Usuário anônimo';
});

const inboxName = computed(() => {
  return props.conversation.inbox?.name || 'Inbox';
});

const lastMessage = computed(() => {
  const messages = props.conversation.messages || [];
  if (messages.length === 0) return '';
  const lastMsg = messages[messages.length - 1];
  return lastMsg.content ? lastMsg.content.substring(0, 100) : '';
});

const unreadCount = computed(() => {
  return props.conversation.unread_count || 0;
});

const handleDragStart = (e) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', props.conversation.id);
  emit('dragstart');
};

const handleDragEnd = () => {
  emit('dragend');
};
</script>

<template>
  <div
    class="bg-white dark:bg-n-solid-3 rounded-lg p-3 shadow-sm border border-n-weak hover:shadow-md transition-shadow cursor-move"
    :class="{ 'opacity-50': isDragging }"
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
  >
    <!-- Header com nome e unread count -->
    <div class="flex items-start justify-between mb-2">
      <h3 class="font-semibold text-sm text-n-solid-11 dark:text-n-solid-1 truncate flex-1">
        {{ contactName }}
      </h3>
      <span
        v-if="unreadCount > 0"
        class="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
      >
        {{ unreadCount }}
      </span>
    </div>

    <!-- Última mensagem -->
    <p
      v-if="lastMessage"
      class="text-xs text-n-slate-10 dark:text-n-slate-5 mb-2 line-clamp-2"
    >
      {{ lastMessage }}
    </p>

    <!-- Footer com inbox e timestamp -->
    <div class="flex items-center justify-between text-xs text-n-slate-9 dark:text-n-slate-6">
      <span class="truncate">{{ inboxName }}</span>
      <span class="ml-2 text-n-slate-8 dark:text-n-slate-7">
        {{ new Date(conversation.created_at).toLocaleDateString() }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
