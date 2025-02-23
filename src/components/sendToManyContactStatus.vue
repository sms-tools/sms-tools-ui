<script setup lang="ts">
import { ref } from 'vue';

const state = ref<'offline' | 'online' | 'errored'>('offline');
const errorMessage = ref('');
const usrList =
  defineModel<Array<[string /*name*/, string /*phone*/, string | undefined /*status*/]>>();

async function ping() {
  let apiLink = localStorage.getItem('apiLink');
  if (!apiLink || typeof apiLink != 'string') {
    console.error('No API link, refresh your app');
    errorMessage.value = "problème interne recharger l'app";
    throw new Error('internal app error');
  }
  apiLink = apiLink.replace('api/', '');
  const response = await fetch(apiLink, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response && response.status == 200) state.value = 'online';
  else if (!response || response.status != 200) state.value = 'errored';
}
async function send(createIfNotExist: boolean, message: string) {
  let body = { createIfNotExist, message, data: usrList.value };
  const response = await fetch(`${localStorage.getItem('apiLink')}sendManySms`, {
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
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let messages = buffer.split('\n\n');
    buffer = messages.pop() || '';

    for (const msg of messages) {
      if (!msg.startsWith('data: ')) continue;

      try {
        const jsonString = msg.replace(/^data: /, '').trim();
        const { phone, status } = JSON.parse(jsonString) as {
          phone: string;
          status: 'errored' | 'pending' | 'queuing' | 'send';
        };
        console.log('message receved', phone, status);
        updateStatus(phone, status);
      } catch (error) {
        console.error('eror on pars json :', error);
      }
    }
  }
}

function updateStatus(phone: string, status: 'errored' | 'pending' | 'queuing' | 'send') {
  if (!usrList.value) return;
  const user = usrList.value.findIndex((e: [string, string, string | undefined]) => e[1] == phone);
  console.log(user, usrList.value, usrList.value[1], phone);
  if (user == -1) return;
  usrList.value[user][2] = status;
}
defineExpose({ send });
ping();
</script>
<template>
  <div class="sendToManyContactsStats">
    <h1>etat</h1>
    <div class="state">
      <div class="connection">
        connexion:
        <span class="circle" v-bind:class="state" />
        {{ state === 'online' ? 'en ligne' : state === 'offline' ? 'hors ligne' : 'erreur' }}
      </div>
    </div>
    <h1>avancement</h1>
    <ul>
      <li v-if="usrList && usrList?.length != 0" v-for="usr in usrList">
        <div>
          {{ usr[0] }}: {{ usr[1] }}
          <progress
            :value="
              usr[2] === 'errored'
                ? 0
                : usr[2] === 'pending'
                  ? 10
                  : usr[2] === 'queuing'
                    ? 20
                    : usr[2] === 'send'
                      ? 30
                      : 0
            "
            max="30"
          >
            70 %
          </progress>
        </div>
      </li>
      <li v-else class="errorContact">Aucun contact</li>
    </ul>
  </div>
</template>

<style scoped>
.sendToManyContactsStats {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.connection {
  display: flex;
  align-items: center;
  gap: 1vw;
}
img {
  height: 1em;
  margin: 0.2vw;
}

.circle {
  height: 1em;
  width: 1em;
  border-radius: 50%;
  position: relative;
}
.offline {
  background-color: var(--red);
}

.online {
  background-color: var(--green);
}

h1 {
  text-align: center;
  border-bottom: 2px solid var(--blue);
  margin: 2vh;
}

ul {
  list-style: none;
  background-color: var(--white);
  border-radius: calc(var(--radius) - 1vh);
  margin-top: 1vh;
  height: 100%;
  overflow: scroll;
}
</style>
