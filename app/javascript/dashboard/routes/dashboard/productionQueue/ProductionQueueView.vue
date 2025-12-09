<script setup>
const productionQueueUrl = 'https://prod.teixeiramilitar.com.br';
</script>

<template>
  <div class="flex flex-1 flex-col min-h-0 w-full bg-n-solid-1">
    <header class="flex items-center px-6 py-4 border-b border-n-weak">
      <div class="flex items-center gap-2 text-lg font-medium text-n-slate-12">
        <span class="i-lucide-list-checks size-5" />
        <span>{{ $t('SIDEBAR.PRODUCTION_QUEUE') }}</span>
      </div>
    </header>
    <div class="flex-1 min-h-0">
      <iframe
        :src="productionQueueUrl"
        :title="$t('SIDEBAR.PRODUCTION_QUEUE')"
        class="w-full h-full border-0"
      />
    </div>
  </div>
</template>
