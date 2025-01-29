<script setup lang="ts">
import ContactList from '@/components/ContactList.vue';
import { ref } from 'vue';

const currentContact = ref<string | undefined>();
</script>

<template>
  <div class="contactPage">
    <ContactList
      :change-contact="
        (id) => {
          currentContact = id;
        }
      "
    />
    <section class="contactInfo"></section>
  </div>
</template>

<style></style>
