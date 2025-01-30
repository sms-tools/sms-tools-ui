<script setup lang="ts">
import request from '@/stores/requestManager';
import { clearPhone, IsPhoneNumber } from '@/stores/tools';
import { ref, watch } from 'vue';

const props = defineProps({
  identifier: {
    type: String,
  },
});
watch(() => props.identifier, search, { immediate: true });

const error = ref<String | undefined>();
const contact = ref<
  | {
      contactID: string;
      contactName: string;
      contactPhoneNumber: string;
      createDate: string;
      nbCharExchanged: number;
      nbMessageIn: number;
      nbMessageOut: number;
      timeForFirstMessage: string;
      timeForLastMessage: string;
    }
  | undefined
>();
async function search() {
  if (!props.identifier) return;
  let body = {};
  if (IsPhoneNumber(clearPhone(props.identifier))) {
    body = { phoneNumber: props.identifier };
  } else {
    body = { ContactID: props.identifier };
  }
  const response = await request('contactInfo', 'post', body);
  if (!response || response.status !== 200) {
    error.value = `Erreur ${response?.status}`;
    console.error(error.value);
    return;
  }

  if (
    typeof response.body.contactID == 'string' &&
    typeof response.body.contactName == 'string' &&
    typeof response.body.contactPhoneNumber == 'string' &&
    typeof response.body.createDate == 'string' &&
    typeof response.body.nbCharExchanged == 'number' &&
    typeof response.body.nbMessageIn == 'number' &&
    typeof response.body.nbMessageOut == 'number' &&
    typeof response.body.timeForFirstMessage == 'string' &&
    typeof response.body.timeForLastMessage == 'string'
  ) {
    contact.value = response.body as {
      contactID: string;
      contactName: string;
      contactPhoneNumber: string;
      createDate: string;
      nbCharExchanged: number;
      nbMessageIn: number;
      nbMessageOut: number;
      timeForFirstMessage: string;
      timeForLastMessage: string;
    };
  } else {
    error.value = 'Invalid response data';
    console.error(error.value);
  }
  console.log(response.body);
}
</script>

<template>
  <div v-if="contact" class="contactInfo">
    <h1>information de {{ contact.contactName }}</h1>
    <span>
      <span>
        <div>date d'inscription</div>
        <div>{{ new Date(contact.createDate).toLocaleString() }}</div>
      </span>
      <span>
        <div>date du premier message</div>
        <div>{{ new Date(contact.timeForFirstMessage).toLocaleString() }}</div>
      </span>
      <span>
        <div>date du dernier message</div>
        <div>{{ new Date(contact.timeForLastMessage).toLocaleString() }}</div>
      </span>
      <span>
        <div>nombre de message</div>
        <div class="messageExchange">
          {{ contact.nbMessageIn + contact.nbMessageOut }} message{{
            contact.nbMessageIn + contact.nbMessageOut > 1 ? 's' : ''
          }}
          <div class="messageExchangeVisu">
            <div
              :style="{
                width:
                  (contact.nbMessageOut / (contact.nbMessageIn + contact.nbMessageOut)) * 100 + '%',
              }"
            >
              {{ contact.nbMessageOut }}
            </div>
            <div
              :style="{
                width:
                  (contact.nbMessageIn / (contact.nbMessageIn + contact.nbMessageOut)) * 100 + '%',
              }"
            >
              {{ contact.nbMessageIn }}
            </div>
          </div>
        </div>
      </span>
      <span>
        <div>nombre de mot{{ contact.nbCharExchanged > 1 ? 's' : '' }} échanger</div>
        <div>{{ contact.nbCharExchanged }}</div>
      </span>
      <span>
        <div>numero de télephone</div>
        <div>{{ contact.contactPhoneNumber }}</div>
      </span>
    </span>
  </div>
</template>

<style lang="css">
span span {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 1vh;
  border-radius: var(--radius);
}
span span:hover {
  background-color: var(--white);
}
.messageExchange {
  display: flex;
  gap: 2vw;
}
.messageExchangeVisu {
  display: flex;
  text-align: center;
  width: 10vw;
  height: 100%;
  border: solid 1px black;
  border-radius: var(--radius);
}

.messageExchangeVisu div {
  height: 100%;
}

.messageExchangeVisu :nth-child(1) {
  background-color: var(--blue);
  border-radius: var(--radius) 0 0 var(--radius);
  color: white;
  min-width: 1em;
}
.messageExchangeVisu :nth-child(2) {
  background-color: var(--green);
  border-radius: 0 var(--radius) var(--radius) 0;
  min-width: 1em;
}
</style>
