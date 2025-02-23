<script setup lang="ts">
import ContactInfo from '@/components/ContactInfo.vue';
import ContactList from '@/components/ContactList.vue';
import { ref } from 'vue';

const currentContact = ref<string | undefined>();
</script>

<template>
  <div class="contactPage">
    <section class="searchPart">
      <ContactList
        :change-contact="
          (id) => {
            currentContact = id;
          }
        "
      />
    </section>
    <section class="contactInfo">
      <ContactInfo :identifier="currentContact" />
    </section>
  </div>
</template>

<style lang="css" scoped>
section {
  margin: 2vh;
  padding: 2vh;
}

section.searchPart {
  width: 36.5vw;
  height: 96vh;
}

section.contactInfo {
  width: 56.5vw;
  height: 96vh;
  border-radius: var(--radius);
  background-color: white;
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}
</style>
