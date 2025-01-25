<script setup lang="ts">
import request from '@/stores/requestManager';
import { ref } from 'vue';

const contacts = ref<
  Array<{
    contactID: string;
    contactName: string;
    phoneNumber: string;
    message: string;
    date: Date;
    senderID: string;
    direction: boolean;
    status: 'received' | 'sent' | 'delivered' | 'failed' | 'pending';
    deliveredAt: Date;
    sendAt: Date;
  }>
>([]);
const errored = ref<string | undefined>();

async function getContact() {
  const fetchContact = (await request('getContact', 'post')) as {
    body: Array<{
      contactID: string;
      contactName: string;
      phoneNumber: string;
      message: string;
      date: Date;
      senderID: string;
      direction: boolean;
      status: 'received' | 'sent' | 'delivered' | 'failed' | 'pending';
      deliveredAt: Date;
      sendAt: Date;
    }>;
    status: number;
  } | void;

  if (!fetchContact || fetchContact.status != 200) {
    errored.value =
      "l'erreur " + (fetchContact?.status ?? '500') + 'est survenu. réésayer plsu tard';
    return;
  }

  console.log(fetchContact.body);
  contacts.value = fetchContact.body;
}

getContact();
</script>

<template>
  <div class="contactListComp">
    <ul>
      <li v-for="contact in contacts">
        <div class="contactEmbed">
          <div class="conactName">{{ contact.contactName }}</div>
          <div class="lastMessage">{{ contact.message }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style>
.contactListComp {
  background-color: white;
  border-radius: var(--radius);
  padding: 1vh;
}
.contactListComp ul {
  list-style: none;
  padding: 0px;
}

.contactEmbed {
  display: flex;
}

.contactEmbed:hover {
  background-color:;
}

.conactName {
  font-weight: bold;
}
</style>
