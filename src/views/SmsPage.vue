<script setup lang="ts">
import ContactList from '@/components/ContactList.vue';
import SmsList from '@/components/SmsList.vue';
import request from '@/stores/requestManager';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

/*
on loading charge phone on query
if you clik on contact identifier change.
if you enter phone, identifier = phone
if you send new message SmsList and ContactList update our list
*/

const route = useRoute();
//for user update
const phone = ref((route.query.phone || '') as string);
const identifier = ref<string>(phone.value || '');

const sendMessage = ref('');
const lastMessage = ref<Message | undefined>(undefined);
const sendStatus = ref<undefined | 'send' | 'errored'>(undefined);
const popUpVisible = ref(false);

//if phone is in request
if (phone.value != '') search();

async function search() {
  identifier.value = phone.value;
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
    lastMessage.value = sendResult.body.data.message;
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
      <!-- if not fond -->
      <div v-if="popUpVisible">
        cet utilisateur semble inconnus...
        <a :href="`/createContact?phone=${phone}`">cliquez ici pour le créer</a>
      </div>
      <ContactList
        :changeContact="
          (id) => {
            identifier = id;
          }
        "
        :lastMessage="lastMessage"
      />
    </section>
    <!-- message -->
    <section class="smsElement">
      <SmsList
        :identifier="identifier"
        :lastMessage="lastMessage"
        :sseDos="
          (message: Message) => {
            lastMessage = message;
          }
        "
      />
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

<style>
.sms-page {
  background-color: var(--white);
}

section {
  margin: 2vh;
  padding: 2vh;
}

section.searchPart {
  width: 36.5vw;
  height: 96vh;
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
</style>
