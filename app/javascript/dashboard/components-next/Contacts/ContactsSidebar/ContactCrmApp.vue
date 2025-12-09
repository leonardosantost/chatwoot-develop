<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useMapGetter } from 'dashboard/composables/store';

const props = defineProps({
  selectedContact: {
    type: Object,
    default: null,
  },
});

const crmUrl = 'https://chatwootorders.pages.dev';
const iframeRef = ref(null);

const currentUser = useMapGetter('auth/getCurrentUser');

const appContextPayload = computed(() => ({
  event: 'appContext',
  data: {
    conversation: null,
    contact: props.selectedContact,
    currentAgent: currentUser.value
      ? {
          id: currentUser.value.id,
          name: currentUser.value.name,
          email: currentUser.value.email,
        }
      : null,
  },
}));

const postContextToIframe = () => {
  const frame = iframeRef.value;
  if (!frame?.contentWindow) {
    return;
  }

  frame.contentWindow.postMessage(
    JSON.stringify(appContextPayload.value),
    '*'
  );
};

const handleMessage = event => {
  if (event?.data !== 'chatwoot-dashboard-app:fetch-info') {
    return;
  }
  postContextToIframe();
};

onMounted(() => {
  window.addEventListener('message', handleMessage);
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
});

watch(
  () => props.selectedContact,
  () => {
    postContextToIframe();
  },
  { deep: true }
);
</script>

<template>
  <div class="flex flex-col w-full h-full min-h-[480px]">
    <iframe
      ref="iframeRef"
      :src="crmUrl"
      class="w-full h-full border-0 rounded-b-md"
      @load="postContextToIframe"
    />
  </div>
</template>
