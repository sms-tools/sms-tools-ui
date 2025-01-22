<script setup lang="ts">
import router from '@/router';
import request from '@/stores/requestManager';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const ContactName = ref('');
const phoneNumber = ref(route.query.phone || '');
const errorMessage = ref<string | undefined>(undefined);

async function submit() {
  if (!phoneNumber.value) {
    console.log('Phone number is required.');
    return;
  }
  if (!ContactName.value.trim()) {
    console.log('Contact name is required.');
    return;
  }

  const contactCreated = await request('/createContact', 'post', {
    ContactName: ContactName.value,
    phoneNumber: phoneNumber.value,
  });
  if (!contactCreated) {
    errorMessage.value = 'Error during sending new contact';
    return;
  }
  if (contactCreated.status == 400) {
    errorMessage.value = contactCreated.body.message;
    return;
  }
  if (contactCreated.status == 500) {
    errorMessage.value = 'Server error : ' + contactCreated.body.message;
    return;
  }
  const cleanPath = document.referrer.split('/');
  cleanPath.splice(0, 3);
  router.push({ path: cleanPath.join('/'), query: { phone: phoneNumber.value } });
}
</script>
<template>
  <div class="create-contact-pages">
    <h1>Create an contact</h1>
    <form @submit.prevent="submit">
      <input id="name" v-model="ContactName" type="text" required placeholder="Name of client" />
      <input
        id="phone"
        v-model="phoneNumber"
        type="tel"
        pattern="[0-9]{10}"
        required
        placeholder="Phone number"
      />
      <button type="submit">Create</button>
    </form>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>
