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
      contactName: string | undefined;
      contactPhoneNumber: string;
      createDate: string;
      nbCharExchangedIn: number;
      nbCharExchangedOut: number;
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
    error.value = `Error ${response ? response?.status : 'with returned object'}`;
    console.error(error.value);
    return;
  }

  if (
    typeof response.body.contactID == 'string' &&
    typeof response.body.contactName == 'string' &&
    typeof response.body.contactPhoneNumber == 'string' &&
    typeof response.body.createDate == 'string' &&
    typeof response.body.nbCharExchangedIn == 'number' &&
    typeof response.body.nbCharExchangedOut == 'number' &&
    typeof response.body.nbMessageIn == 'number' &&
    typeof response.body.nbMessageOut == 'number' &&
    typeof response.body.timeForFirstMessage == 'string' &&
    typeof response.body.timeForLastMessage == 'string'
  ) {
    contact.value = response.body as {
      contactID: string;
      contactName: string | undefined;
      contactPhoneNumber: string;
      createDate: string;
      nbCharExchangedIn: number;
      nbCharExchangedOut: number;
      nbMessageIn: number;
      nbMessageOut: number;
      timeForFirstMessage: string;
      timeForLastMessage: string;
    };
  } else {
    error.value = 'Invalid response data';
    console.error(error.value);
  }
}

function copyToClipboard() {
  if (contact.value?.contactPhoneNumber) {
    navigator.clipboard
      .writeText(contact.value.contactPhoneNumber)
      .then(() => {
        console.log('truc');
      })
      .catch((err) => console.error('error in copy', err));
  }
}
</script>
<template>
  <div v-if="contact" class="contactInfo">
    <h1>Information de {{ contact.contactName }}</h1>
    <span>
      <span>
        <div>Date d'inscription</div>
        <div>{{ new Date(contact.createDate).toLocaleString() }}</div>
      </span>
      <span>
        <div>Date du premier message</div>
        <div>{{ new Date(contact.timeForFirstMessage).toLocaleString() }}</div>
      </span>
      <span>
        <div>Date du dernier message</div>
        <div>{{ new Date(contact.timeForLastMessage).toLocaleString() }}</div>
      </span>
      <span>
        <div>Nombre de messages</div>
        <div class="Exchange">
          {{ contact.nbMessageIn + contact.nbMessageOut }} message{{
            contact.nbMessageIn + contact.nbMessageOut > 1 ? 's' : ''
          }}
          <div class="ExchangeVisu">
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
        <div>
          Nombre de mot{{ contact.nbCharExchangedIn + contact.nbCharExchangedOut > 1 ? 's' : '' }}
          échangés
        </div>
        <div class="Exchange">
          {{ contact.nbCharExchangedIn + contact.nbCharExchangedOut }} mot{{
            contact.nbCharExchangedIn + contact.nbCharExchangedOut > 1 ? 's' : ''
          }}
          <div class="ExchangeVisu">
            <div
              :style="{
                width:
                  (contact.nbCharExchangedOut /
                    (contact.nbCharExchangedIn + contact.nbCharExchangedOut)) *
                    100 +
                  '%',
              }"
            >
              {{ contact.nbCharExchangedOut }}
            </div>
            <div
              :style="{
                width:
                  (contact.nbCharExchangedIn /
                    (contact.nbCharExchangedIn + contact.nbCharExchangedOut)) *
                    100 +
                  '%',
              }"
            >
              {{ contact.nbCharExchangedIn }}
            </div>
          </div>
        </div>
      </span>
      <span>
        <div>Numéro de téléphone</div>
        <div class="copy" @click="copyToClipboard" style="cursor: pointer">
          {{ contact.contactPhoneNumber }}
          <img src="../assets/copy.svg" />
        </div>
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
.Exchange {
  display: flex;
  gap: 2vw;
}
.ExchangeVisu {
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

.ExchangeVisu :nth-child(1) {
  background-color: var(--blue);
  border-radius: var(--radius) 0 0 var(--radius);
  color: white;
  min-width: 1em;
}
.ExchangeVisu :nth-child(2) {
  background-color: var(--green);
  border-radius: 0 var(--radius) var(--radius) 0;
  min-width: 1em;
}

.copy:hover {
  background-color: white;
}

.copy {
  border-radius: var(--radius);
  padding: 0 1vh;
  display: flex;
  align-items: center;
  gap: 5px;
}

.copy img {
  height: 1em;
}

/* no in transition, but transition is active for out of click */
.copy {
  background-color: white;
  transition: background-color 100ms ease-in-out 1s;
}

.copy:active {
  background-color: var(--green);
  transition: none;
}

.copy.released {
  transition: background-color 100ms ease-in-out 1s;
  background-color: white;
}
</style>
