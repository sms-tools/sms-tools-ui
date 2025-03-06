<script setup lang="ts">
import request from '@/stores/requestManager';
import { clearPhone, IsPhoneNumber } from '@/stores/tools';
import { ref, watch, type PropType } from 'vue';

const props = defineProps({
  identifier: {
    type: String,
    required: true,
  },
  receviedEvent: {
    type: Object as PropType<sseEvent | undefined>,
  },
});
watch(() => props.identifier, loadMessages, { immediate: true });
watch(() => props.receviedEvent, newEvent, { immediate: true });

const messages = ref<Array<Message> | undefined>([]);
const error = ref<string | undefined>();
const readerRef = ref<ReadableStreamDefaultReader<Uint8Array<ArrayBufferLike>> | null>(null);

async function newEvent() {
  if (!props.receviedEvent) return;
  //if new message is receved
  if (props.receviedEvent.event == 'recevied') {
    //optimise type
    const receved = props.receviedEvent as {
      contactID: string;
      messageID: string;
      event: 'recevied';
      status: receivedEvent;
    };
    //create message
    const message: Message = {
      message: receved.status.message,
      date: receved.status.deliveredAt,
      contactID: receved.contactID,
      direction: true,
      status: 'received',
      deliveredAt: receved.status.deliveredAt,
      senderID: undefined,
      sendAt: undefined,
      messageID: receved.messageID,
    };
    if (Array.isArray(messages.value)) messages.value.push(message);
    else messages.value = [message];
  }
  // for sending message
  else if ((props.receviedEvent.event = 'send')) {
    //optimise type
    const send = props.receviedEvent as {
      contactID: string;
      event: 'recevied';
      messageID: string;
      status: sendEvent;
    };
    //create message
    const message: Message = {
      messageID: send.messageID,
      message: send.status.message,
      date: send.status.sendAt,
      contactID: send.contactID,
      direction: true,
      status: 'received',
      deliveredAt: undefined,
      senderID: undefined,
      sendAt: send.status.sendAt,
    };
    if (Array.isArray(messages.value)) messages.value.push(message);
    else messages.value = [message];
  }
  //for partial event with update
  else if (props.receviedEvent.event == 'delivered' || props.receviedEvent.event == 'failed') {
    if (Array.isArray(messages.value)) {
      //search message
      for (let i = 0; i < messages.value.length; i++) {
        if (messages.value[i].messageID == props.receviedEvent.messageID) {
          //update message
          messages.value[i].status == props.receviedEvent.event;
          if (props.receviedEvent.event == 'delivered') {
            const delivred = props.receviedEvent as {
              status: deliveredEvent;
            };
            messages.value[i].deliveredAt = delivred.status.deliveredAt;
          }
        }
      }
    }
  }
}

/**
 * Asynchronously loads messages based on the provided identifier.
 *
 * This function performs the following steps:
 * 1. Cancels any ongoing message reading operation if `readerRef` is active.
 * 2. Checks if the `identifier` prop is provided; if not, the function returns early.
 * 3. Determines the body type for the request based on whether the identifier is a phone number or a contact ID.
 * 4. Sends a request to fetch messages using the determined body type.
 * 5. Updates the `messages` state with the fetched data if the response status is 200.
 * 6. Sets an error message if the response status is not 200.
 * 7. Logs any errors encountered during the request.
 *
 * @returns {Promise<void>} A promise that resolves when the messages are loaded.
 */
async function loadMessages() {
  if (readerRef.value) {
    await readerRef.value.cancel();
    readerRef.value = null;
  }
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
}
</script>

<template>
  <ul class="smsElement">
    <li
      v-for="message in messages"
      :key="message.messageID"
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
