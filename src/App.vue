<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div>
    <header>
      <img src="../src/assets/logo.svg" />
      <RouterLink class="link" to="/sms">Sms</RouterLink>
      <RouterLink class="link" to="/contact">Contact</RouterLink>
      <div>Contact</div>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

header {
  line-height: 1.5;
  max-height: 5vh;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 2vw;
}

.link {
  text-decoration: none;
  color: var(--color-text);
}

img {
  max-height: 100%;
}
</style>
