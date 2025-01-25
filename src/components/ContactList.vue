<script setup lang="ts">
import request from '@/stores/requestManager';
import { ref, watch, type PropType } from 'vue';

const props = defineProps({
  changeContact: {
    type: Function as PropType<(id: string) => void>,
    required: true,
  },
  lastMessage: {
    type: Object as PropType<Message | undefined>,
  },
});
watch(
  () => props.lastMessage,
  () => {
    if (!props.lastMessage) return;
    const BeforeMessage = contacts.value.get(props.lastMessage.contactID ?? '');
    contacts.value.set(props.lastMessage.contactID ?? '', {
      contactName: BeforeMessage?.contactName ?? '',
      phoneNumber: BeforeMessage?.phoneNumber ?? '',
      message: props.lastMessage.message,
      date: props.lastMessage.date,
      senderID: props.lastMessage.senderID,
      direction: props.lastMessage.direction,
      status: props.lastMessage.status,
      deliveredAt: props.lastMessage.deliveredAt,
      sendAt: props.lastMessage.sendAt,
    });
  },
  { immediate: true },
);

const contacts = ref<
  Map<
    string,
    {
      contactName: string;
      phoneNumber: string;
      message: string;
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
      "l'erreur " + (fetchContact?.status ?? '500') + 'est survenu. réésayer plus tard';
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
            <div class="conactName">{{ contact.contactName }}</div>
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

<style>
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
