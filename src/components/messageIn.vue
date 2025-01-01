<script setup lang="ts">
import { ref } from 'vue';
const message = ref<message>();
</script>

<template>
  <div class="message-comp">
    <div v-if="message">{{ message.message }}</div>
    <div v-else>Chargement</div>
  </div>
</template>
