<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import axios from 'axios'

const loading = ref(true)
const data = ref(null)
const apiLink = inject('apiLink') as string

onMounted(async () => {
  try {
    const response = await axios.get(apiLink)
    data.value = response.data
  } catch (error) {
    console.error('Error fetching data:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <header></header>
  <main>
    votre consomation mensuel:
    <div v-if="loading">Loading...</div>
    <div v-else>{{ data }}</div>
  </main>
</template>
