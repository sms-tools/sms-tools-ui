<script setup lang="ts">
import request from '@/stores/requestManager';
import { ref } from 'vue';

const phone = ref('');
const data = ref<Array<Message>>([]);
let sseReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

async function search() {
  if (!phone.value) {
    console.log('Phone number is required.');
    return;
  }

  // Requête initiale pour récupérer les messages existants
  try {
    const fetchMessage = (await request('getMessage', 'post', {
      phoneNumber: phone.value,
    })) as { body: { data: Array<Message> } } | void;

    if (!fetchMessage || !Array.isArray(fetchMessage.body.data)) {
      console.error('Failed to fetch messages');
      data.value = [];
      return;
    }
    data.value = fetchMessage.body.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    data.value = [];
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

    console.log('SSE connected.');

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
</script>
<template>
  <div class="sms-page">
    <form @submit.prevent="search">
      <div>
        <label for="phone">Numéro de téléphone</label>
        <input
          id="phone"
          v-model="phone"
          type="tel"
          required
          pattern="[0-9]{10}"
          placeholder="Entrez un numéro de téléphone"
        />
      </div>
      <button type="submit">Rechercher</button>
    </form>

    <ul>
      <li v-for="message in data" :key="message._id" class="messageBox">
        <strong>{{ message.contactID }}</strong> : {{ message.message }}
        <small>{{ new Date(message.date).toLocaleString() }}</small>
      </li>
    </ul>
  </div>
</template>

<!-- <script setup lang="ts">
import request from '@/stores/requestManager';
import { ref } from 'vue';

const phone = ref('');
const data = ref<Array<message>>([]);
async function search() {
  if (!phone.value) {
    return;
  }
  const fetchMessage = (await request('getMessage', 'post', {
    phoneNumber: phone.value,
  })) as void | { body: { data: Array<message> } };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.log((fetchMessage as any).body.data);
  if (
    !fetchMessage ||
    !Array.isArray(fetchMessage.body.data) ||
    typeof fetchMessage == 'function'
  ) {
    console.log(
      !fetchMessage,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      !Array.isArray((fetchMessage as any).body.data),
      typeof fetchMessage == 'function',
    );
    data.value = [];
  } else {
    data.value = fetchMessage.body.data;
  }

  // Implementation of SSE to update data with new messages
  const response = await fetch(localStorage.getItem('apiLink') + 'getNewMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ phoneNumber: phone.value }),
  });
  const reader = response?.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  if (!reader) {
    console.log('error, sse not connected');
    return;
  }
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const decodedValue = decoder.decode(value);
    console.log('Received', decodedValue);
    try {
      const newMessage = JSON.parse(decodedValue);
      data.value.push(newMessage);
    } catch (error) {
      console.error('Error parsing SSE message', error);
    }
  }
}
</script>

<template>
  <div class="sms-page">
    <form @submit.prevent="search">
      <div>
        <label for="username">numero de telephone</label>
        <input id="username" v-model="phone" type="tel" required pattern="[0-9]{10}" />
      </div>
      <button type="submit">rechercher</button>
    </form>
    <li v-for="message in data" :key="message._id" class="messageBox">{{ message }}</li>
  </div>
</template> -->
