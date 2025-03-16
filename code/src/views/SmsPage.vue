<script setup lang="ts">
import ContactList from '@/components/ContactList.vue';
import SmsList from '@/components/SmsList.vue';
import request from '@/stores/requestManager';
import { clearPhone, IsPhoneNumber } from '@/stores/tools';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

/*
on loading charge phone on query
if you clik on contact identifier change.
if you enter phone, identifier = phone
if you send new message SmsList and ContactList update our list
*/

//for user update
const route = useRoute();
const identifier = ref<string>(typeof route.query.phone == 'string' ? route.query.phone : '');

const sendMessage = ref('');
const receviedEvent = ref<sseEvent | undefined>(undefined);
const sendStatus = ref<undefined | 'send' | 'errored'>(undefined);

//if phone is in request

async function send() {
  try {
    let body = {};
    if (IsPhoneNumber(clearPhone(identifier.value))) {
      body = { phoneNumber: identifier.value };
    } else {
      body = { ContactID: identifier.value };
    }
    const sendResult = (await request('sendSms', 'post', {
      ...body,
      message: sendMessage.value,
    })) as { body: { data: { message: Message } }; status: 500 | 200 | number } | void;
    if (!sendResult || sendResult.status != 200) {
      sendStatus.value = 'errored';
      return;
    }

    sendMessage.value = '';
    sendStatus.value = 'send';
  } catch (error) {
    console.error(error);
    sendStatus.value = 'send';
    return;
  }
}

//for all new message, reading, sending
async function newEvent() {
  //create sse connection
  const response = await fetch(`${localStorage.getItem('apiLink')}getNewEvent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });

  if (!response.ok || !response.body) {
    console.error('Failed to establish SSE connection.');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const decodedValue = decoder.decode(value);

    try {
      const newEvent = JSON.parse(decodedValue) as sseEvent;
      receviedEvent.value = newEvent;
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  }
}
newEvent();
</script>

<template>
  <div class="sms-page">
    <!-- search -->
    <section class="searchPart">
      <ContactList
        :changeContact="
          (id) => {
            identifier = id;
          }
        "
        :receviedEvent="receviedEvent"
      />
    </section>
    <!-- message -->
    <section class="smsElement">
      <SmsList :identifier="identifier" :receviedEvent="receviedEvent" />
      <form v-if="identifier" @submit.prevent="send" class="sending">
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

<style scoped>
.sms-page {
  background-color: var(--white);
}

section {
  margin: 2vh;
  padding: var(--hGap);
}

section.searchPart {
  width: 36.5vw;
  height: 96vh;
  display: flex;
  flex-direction: column;
  gap: var(--vGap);
}

section.smsElement {
  width: 56.5vw;
  height: 96vh;
  border-radius: var(--radius);
  background-color: white;
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}

form.sending {
  padding: 2vh 0px;
}

input {
  height: 4vh;
  border: none;
  padding: 0px 2%;
  margin-right: 1%;
  border-radius: var(--radius);
  background-color: var(--white);
}

input#sendingText {
  width: 89%;
}

label {
  white-space: nowrap;
  padding: 0 var(--vGap);
}

button {
  border: none;
  background-color: var(--blue);
  color: white;
  height: 4vh;
  border-radius: var(--radius);
  padding: 0 var(--vGap);
}

button#sendButton {
  width: 10%;
}
</style>
