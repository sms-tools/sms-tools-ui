<script setup lang="ts">
import ContactList from '@/components/ContactList.vue';
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
  // reset sse
  if (sseReader) {
    sseReader.cancel();
    sseReader = null;
  }

  if (!phone.value) {
    console.log('Phone number is required.');
    return;
  }

  // fetch existant message
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

  // connect to sse for find new message
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
    })) as { body: { data: { message: Message } }; status: 500 | 200 | number } | void;
    if (!sendResult || sendResult.status != 200) {
      sendStatus.value = 'errored';
      return;
    }

    sendMessage.value = '';
    sendStatus.value = 'send';
    if (data.value) {
      const message = sendResult.body.data.message;
      data.value.push(message);
    } else {
      data.value = [sendResult.body.data.message];
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
    <!-- search -->
    <section class="searchPart">
      <form @submit.prevent="search">
        <label for="phone">message</label>
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
      <ContactList />
    </section>
    <!-- message -->
    <section class="smsElement">
      <ul>
        <li
          v-for="message in data"
          :key="message._id"
          :class="['messageBox', { sended: !message.direction, receved: message.direction }]"
        >
          <div class="messageText">
            {{ message.message }}
          </div>
          <div class="messageDate">
            {{ new Date(message.date).toLocaleString() }}
          </div>
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
        <button type="submit" id="sendButton">envoyer</button>
      </form>
    </section>
  </div>
</template>

<style>
.sms-page {
  background-color: var(--white);
}

section {
  margin: 2vh;
  padding: 2vh;
}

section.searchPart {
  width: 40vw;
  height: 96vh;
}

section.smsElement {
  width: 60vw;
  height: 96vh;
  border-radius: var(--radius);
  background-color: white;
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}

form.sending {
  padding: 1vh 0px;
}

input#sendingText {
  width: 89%;
  height: 4vh;
  border: none;
  padding: 0px 2%;
  margin-right: 1%;
  border-radius: var(--radius);
  background-color: var(--white);
}

button#sendButton {
  width: 10%;
  border: none;
  background-color: var(--blue);
  color: white;
  height: 4vh;
  border-radius: var(--radius);
}

.smsElement ul {
  gap: 10px;
  height: 86vh;
  margin: none;
  display: flex;
  overflow: scroll;
  list-style: none;
  padding: 1vh;
  border-radius: var(--radius);
  flex-direction: column;
  background-color: var(--white);
}

.messageBox {
  padding: 10px;
  min-width: 2vw;
  max-width: 20vw;
}

.messageBox.sended {
  color: white;
  align-self: flex-end;
  background-color: var(--blue);
  border-radius: var(--radius) 0px 10px var(--radius);
}

.messageBox.receved {
  color: black;
  background-color: white;
  border-radius: 0px var(--radius) var(--radius) var(--radius);
}

.messageDate {
  font-size: 0.8em;
  color: grey;
  text-align: right;
}
</style>
