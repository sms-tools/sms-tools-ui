<script setup lang="ts">
import request from '@/stores/requestManager';
import { ref, watch, type PropType } from 'vue';

const props = defineProps({
  changeContact: {
    type: Function as PropType<(id: string) => void>,
    required: true,
  },
  receviedEvent: {
    type: Object as PropType<sseEvent | undefined>,
    required: false,
  },
});
watch(() => props.receviedEvent, newEvent, { immediate: true });

async function newEvent() {
  if (!props.receviedEvent) return;
  if (props.receviedEvent.event == 'recevied') {
    const receved = props.receviedEvent as {
      contactID: string;
      messageID: string;
      phoneNumber: string;
      event: 'recevied';
      status: receivedEvent;
    };
    contacts.value.set(props.receviedEvent.contactID, {
      contactName: receved.status.contactName,
      phoneNumber: receved.phoneNumber,
      message: receved.status.message,
      date: receved.status.deliveredAt,
      senderID: undefined,
      direction: true,
      status: 'received',
      deliveredAt: receved.status.deliveredAt,
      sendAt: undefined,
      messageID: receved.messageID,
    });
  } else if (props.receviedEvent.event == 'send') {
    const send = props.receviedEvent as {
      contactID: string;
      messageID: string;
      phoneNumber: string;
      event: 'send';
      status: sendEvent;
    };
    contacts.value.set(props.receviedEvent.contactID, {
      contactName: send.status.contactName,
      phoneNumber: send.phoneNumber,
      message: send.status.message,
      date: send.status.sendAt,
      senderID: undefined,
      direction: true,
      status: 'sent',
      deliveredAt: send.status.sendAt,
      sendAt: undefined,
      messageID: send.messageID,
    });
  } else {
    const oldMessage = contacts.value.get(props.receviedEvent.contactID);
    //if last message is same of the event message
    if (oldMessage && oldMessage.messageID == props.receviedEvent.messageID) {
      if (props.receviedEvent.event == 'delivered') {
        const delivred = props.receviedEvent as {
          status: deliveredEvent;
        };
        oldMessage.deliveredAt = delivred.status.deliveredAt;
      }

      oldMessage.status == props.receviedEvent.event;
      contacts.value.set(props.receviedEvent.contactID, oldMessage);
    }
  }
}

const contacts = ref<
  Map<
    string,
    {
      contactName: string | undefined;
      phoneNumber: string;
      message: string;
      messageID: string;
      date: Date;
      senderID: string | undefined;
      direction: boolean;
      status: 'received' | 'sent' | 'delivered' | 'failed' | 'pending';
      deliveredAt: Date | undefined;
      sendAt: Date | undefined;
    }
  >
>(new Map());
const errored = ref<string | undefined>();

async function getContact() {
  const fetchContact = (await request('getContact', 'post')) as {
    body: Array<{
      contactID: string;
      contactName: string | undefined;
      phoneNumber: string;
      message: string;
      date: Date;
      senderID: string;
      direction: boolean;
      status: 'received' | 'sent' | 'delivered' | 'failed' | 'pending';
      deliveredAt: Date;
      sendAt: Date;
      messageID: string;
    }>;
    status: number;
  } | void;

  if (!fetchContact || typeof fetchContact != 'object' || fetchContact.status != 200) {
    errored.value =
      "l'erreur " +
      (fetchContact && fetchContact.status ? fetchContact.status : '500') +
      ' est survenu. réésayer plus tard';
    return;
  }
  fetchContact.body.forEach((Element) => {
    contacts.value.set(Element.contactID, Element);
  });
}

getContact();
</script>

<template>
  <div class="contactListComp">
    <ul>
      <!-- contacts is an map -->
      <li v-for="[contactID, contact] in contacts">
        <div class="contactEmbed" v-on:click="props.changeContact(contactID)">
          <div class="textPart">
            <div class="conactName">{{ contact.contactName ?? contact.phoneNumber }}</div>
            <div class="lastMessage">{{ contact.message }}</div>
          </div>
          <div class="metaPart">
            <img v-if="contact.status === 'sent'" src="../assets/check.svg" alt="Sent" />
            <img
              v-if="contact.status === 'delivered'"
              src="../assets/doubleCheck.svg"
              alt="Delivered"
            />
            {{ new Date(contact.date).toLocaleString() }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.contactListComp {
  padding: 1vh;
  background-color: white;
  border-radius: var(--radius);
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}
.contactListComp ul {
  padding: 0px;
  list-style: none;
}

li {
  margin: 0.5vh;
}

.contactEmbed {
  gap: 1vh;
  padding: 1vh;
  display: flex;
  align-items: center;
  border-radius: var(--radius);
  justify-content: space-between;
}

.contactEmbed:hover {
  background-color: var(--white);
}

.metaPart {
  gap: 1vh;
  color: grey;
  display: flex;
  font-size: 0.8em;
  flex-direction: row;
  justify-content: center;
}
.metaPart img {
  height: 1.5em;
}

.conactName {
  font-weight: bold;
}
</style>
