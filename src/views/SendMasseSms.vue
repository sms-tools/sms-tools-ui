<script setup lang="ts">
import SelectContacts from '@/components/SelectContacts.vue';
import SendToManyContactStatus from '@/components/sendToManyContactStatus.vue';
import { ref } from 'vue';

const contacts = ref<Array<[string /*name*/, string /*phone*/, string | undefined /*status*/]>>();
const createIfDosntExist = ref<boolean>(false);
const message = ref<string>();
const SendToManyContactStatusRef = ref();
async function sendMassSms() {
  if (SendToManyContactStatusRef.value) {
    SendToManyContactStatusRef.value.send(createIfDosntExist.value, message.value);
  }
}
</script>

<template>
  <div class="page">
    <div class="selection">
      <section class="SelectManyContacts">
        <SelectContacts v-model="contacts" />
      </section>
      <section class="send">
        <form @submit.prevent="sendMassSms">
          <label for="message">message à envoyer</label>
          <input
            type="text"
            id="message"
            v-model="message"
            required
            placeholder="message a envoyer"
          />
          <label for="createIfDosntExist">crée le contact si il n'existe pas</label>
          <div class="check">
            <input type="checkbox" id="createIfDosntExist" v-model="createIfDosntExist" />
          </div>
          <button>envoyer les messages</button>
        </form>
      </section>
    </div>
    <section class="sendingStatus">
      <SendToManyContactStatus v-model="contacts" ref="SendToManyContactStatusRef" />
    </section>
  </div>
</template>

<style scoped>
.page {
  background-color: var(--white);
}

form {
  display: grid;
  grid-template-columns: min-content auto;
  gap: 1vh;
  width: 100%;
}

form > label {
  text-wrap: nowrap;
}

input {
  border: none;
}

input[type='checkbox'] {
  height: 1em;
}
input[type='text'] {
  background-color: var(--white);
  border-radius: calc(var(--radius) - 1vh);
  padding: 0 0.5em;
}

.check {
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 0 0 0 1em;
}

.selection {
  height: 96vh;
  width: 34vw;
}

.SelectManyContacts {
  height: 80vh;
  background-color: white;
  border-radius: var(--radius);
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}

.send {
  background-color: white;
  border-radius: var(--radius);
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}

.sendingStatus {
  width: 64vw;
  border-radius: var(--radius);
  background-color: white;
  box-shadow: 0px 0px 10px rgba(200, 200, 200, 0.25);
}

.send > form > button {
  grid-column: 1 / 3;
}

section {
  margin: 2vh;
  padding: 1vh;
}
</style>
