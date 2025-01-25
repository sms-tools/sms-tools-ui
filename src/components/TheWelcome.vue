<script setup lang="ts">
import request from '@/stores/requestManager';
import { ref, onMounted } from 'vue';

const loading = ref(true);
const data = ref<{ total: string } | null>(null);

onMounted(async () => {
  const fetchProgress = await request('getProgress');
  if (!fetchProgress) {
    data.value = { total: 'erreur au chargement' };
  } else {
    loading.value = false;
    data.value = { total: fetchProgress.body.data.total };
  }
});
</script>

<template>
  <header></header>
  <main>
    votre consomation total:
    <div v-if="loading">Loading...</div>
    <div v-else>{{ data?.total }} client</div>
  </main>
</template>
