<script setup lang="ts">
import request from '@/stores/requestManager';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const phone = ref(route.query.phone || '');
const sendMessage = ref('');
const sendStatus = ref<undefined | 'send' | 'errored'>(undefined);
const data = ref<Array<Message> | undefined>();
const popUpVisible = ref(false);
let sseReader: ReadableStreamDefaultReader<Uint8Array> | null = null;
if (phone.value != '') search();

async function search() {
  if (!phone.value) {
    console.log('Phone number is required.');
    return;
  }

  // Requête initiale pour récupérer les messages existants
  try {
    const fetchMessage = (await request('getMessage', 'post', {
      phoneNumber: phone.value,
    })) as { body: { data: Array<Message> }; status: number } | void;

    if (fetchMessage && fetchMessage.status == 404) {
      popUpVisible.value = true;
      data.value = undefined;
      return;
    }
    if (!fetchMessage || !Array.isArray(fetchMessage.body.data) || fetchMessage.status != 200) {
      console.error('Failed to fetch messages');
      data.value = undefined;
      return;
    }
    data.value = fetchMessage.body.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    data.value = undefined;
    return;
  }

  // Déconnexion d'une connexion SSE précédente (si existante)
  if (sseReader) {
    sseReader.cancel();
    sseReader = null;
  }

  // Connexion SSE pour écouter les nouveaux messages
  try {
    const response = await fetch(`${localStorage.getItem('apiLink')}getNewMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ phoneNumber: phone.value }),
    });

    if (!response.ok || !response.body) {
      console.error('Failed to establish SSE connection.');
      return;
    }

    const reader = response.body.getReader();
    sseReader = reader;
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const decodedValue = decoder.decode(value);
      console.log('Received SSE message:', decodedValue);

      // Traiter le message reçu
      try {
        const newMessage = JSON.parse(decodedValue) as Message;
        data.value.push(newMessage);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    }
  } catch (error) {
    console.error('Error during SSE connection:', error);
  } finally {
    console.log('SSE connection closed.');
    sseReader = null;
  }
}

async function send() {
  try {
    const sendResult = (await request('sendSms', 'post', {
      phone: phone.value,
      message: sendMessage.value,
    })) as { body: { data: Message }; status: 500 | 200 | number } | void;
    if (!sendResult || sendResult.status != 200) {
      sendStatus.value = 'errored';
      return;
    }

    sendMessage.value = '';
    sendStatus.value = 'send';
    console.log(sendResult.body.data);
    if (data.value) {
      data.value.push(sendResult.body.data);
    } else {
      data.value = [sendResult.body.data];
    }
  } catch (error) {
    console.error(error);
    sendStatus.value = 'send';
    return;
  }
}
</script>
<template>
  <div class="sms-page">
    <form @submit.prevent="search">
      <label for="phone">Numéro de téléphone</label>
      <input
        id="phone"
        v-model="phone"
        type="tel"
        required
        pattern="[0-9]{10}"
        placeholder="Entrez un numéro de téléphone"
      />
      <button type="submit">Rechercher</button>
    </form>
    <div v-if="popUpVisible">
      cet utilisateur semble inconnus...
      <a :href="`/createContact?phone=${phone}`">cliquez ici pour le créer</a>
    </div>
    <ul>
      <li v-for="message in data" :key="message._id" class="messageBox">
        <strong>{{ message.contactID }}</strong> : {{ message.message }}
        <small>{{ new Date(message.date).toLocaleString() }}</small>
      </li>
    </ul>

    <form v-if="Array.isArray(data)" @submit.prevent="send" class="sending">
      <input
        type="text"
        name="sendingText"
        id="sendingText"
        placeholder="votre message"
        required
        v-model="sendMessage"
      />
      <button type="submit">envoyer</button>
    </form>
  </div>
</template>
