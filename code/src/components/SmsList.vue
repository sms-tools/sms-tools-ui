<script setup lang="ts">
import request from '@/stores/requestManager';
import { clearPhone, IsPhoneNumber } from '@/stores/tools';
import { ref, watch, type PropType } from 'vue';

const props = defineProps({
  identifier: {
    type: String,
    required: true,
  },
  lastMessage: {
    type: Object as PropType<Message | undefined>,
  },
  sseDos: {
    type: Function as PropType<(message: Message) => void>,
    required: true,
  },
});
watch(() => props.identifier, loadMessages, { immediate: true });
watch(
  () => props.lastMessage,
  () => {
    if (!props.lastMessage) return;
    if (messages.value) messages.value.push(props.lastMessage);
    else messages.value = [props.lastMessage];
  },
  { immediate: true },
);

const messages = ref<Array<Message> | undefined>([]);
const error = ref<string | undefined>();

async function loadMessages() {
  if (!props.identifier) return;

  //define body type
  let body = {};
  if (IsPhoneNumber(clearPhone(props.identifier))) {
    body = { phoneNumber: props.identifier };
  } else {
    body = { ContactID: props.identifier };
  }
  try {
    const response = await request('getMessage', 'post', body);

    if (response?.status === 200) {
      messages.value = response.body.data;
    } else {
      error.value = `Erreur ${response?.status}`;
    }
  } catch (err) {
    console.error(err);
  }

  const response = await fetch(`${localStorage.getItem('apiLink')}getNewMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify(body),
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
      const newMessage = JSON.parse(decodedValue) as Message;
      //this message go on mother component, after is pass by lastMessage
      props.sseDos(newMessage);
    } catch (error) {
      console.error('Error parsing SSE message:', error);
    }
  }
}
</script>

<template>
  <ul class="smsElement">
    <li
      v-for="message in messages"
      :key="message._id"
      :class="['messageBox', { sended: !message.direction, receved: message.direction }]"
    >
      <div class="messageText">{{ message.message }}</div>
      <div class="messageDate">{{ new Date(message.date).toLocaleString() }}</div>
    </li>
  </ul>
</template>

<style scoped>
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
