<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <div>
    <header>
      <img src="../src/assets/logo.svg" />
      <RouterLink class="link" to="/ui/sms"><img src="../src/assets/smsNetral.svg" /></RouterLink>
      <RouterLink class="link" to="/ui/manySms"
        ><img src="../src/assets/smsNetral.svg"
      /></RouterLink>
      <RouterLink class="link" to="/ui/contact"
        ><img src="../src/assets/contactBook.svg"
      /></RouterLink>
    </header>
    <RouterView class="router" />
  </div>
</template>

<style scoped>
div {
  display: flex;
}

header {
  line-height: 1.5;
  max-height: 5vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2vw;
}

.link {
  text-decoration: none;
  color: var(--color-text);
}

img {
  max-height: 2vw;
  margin: 0.2vw;
}

.router {
  background-color: var(--white);
  height: 100vh;
  width: 97.8vw;
}
</style>
