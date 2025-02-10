<script setup lang="ts">
import SelectContacts from '@/components/SelectContacts.vue';
import SendToManyContactStatus from '@/components/sendToManyContactStatus.vue';
</script>

<template>
  <section class="SelectManyContacts">
    <SelectContacts />
  </section>
  <section class="sendingStatus">
    <SendToManyContactStatus />
  </section>
</template>

<style scoped>
.SelectManyContacts {
  height: 96vh;
  width: 34vw;
  border-radius: var(--radius);
  background-color: var(--white);
  border: 1px solid rgba(200, 200, 200, 0.25);
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}

.sendingStatus {
  width: 64vw;
  border-radius: var(--radius);
  background-color: var(--white);
  border: 1px solid rgba(200, 200, 200, 0.25);
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}
</style>
