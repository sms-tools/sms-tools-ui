<script setup lang="ts">
import { ref } from 'vue';

const usrList = defineModel<Array<[string /*name*/, string /*phone*/]>>();
const phoneNumber = ref<string>('');
const userName = ref<string>('');

function submit() {
  if (!usrList.value) usrList.value = [[userName.value, phoneNumber.value]];
  else usrList.value.push([userName.value, phoneNumber.value]);
  phoneNumber.value = '';
  userName.value = '';
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      lines.forEach((line) => {
        const lineSplit = line.split('	' /*google sheet default copy*/);
        let name, phone;

        //compatible with
        // name phone
        // firstname lastname phone
        // firstname lastname email(ignored) phone
        if (lineSplit.length == 2) {
          [name, phone] = lineSplit;
        } else if (lineSplit.length == 3) {
          name = lineSplit[0] + ' ' + lineSplit[1];
          phone = lineSplit[2];
        } else if (lineSplit.length == 4 && lineSplit[2].includes('@')) {
          name = lineSplit[0] + ' ' + lineSplit[1];
          phone = lineSplit[3];
        }

        if (name && phone) {
          if (!usrList.value) usrList.value = [[name.trim(), phone.trim()]];
          else usrList.value.push([name.trim(), phone.trim()]);
        }
      });
    };
    reader.readAsText(file);
  }
}
</script>

<template>
  <div class="selectContactComposent">
    <form @submit.prevent="submit">
      <h1>Selectionner un fichier</h1>
      <input type="file" @change="handleFileUpload" accept=".tsv" />
      <h1>ajouter des utilisateur</h1>
      <div class="form">
        <label for="name">Nom du client</label>
        <input type="text" id="name" v-model="userName" placeholder="nom du client" />
        <label for="phone">Numero de téléphone</label>
        <input
          id="phone"
          v-model="phoneNumber"
          type="tel"
          pattern="[0-9]{10}"
          required
          placeholder="numero de télephone"
        />
      </div>
      <button type="submit">ajouter ce contact</button>
    </form>

    <ul>
      <li v-if="usrList && usrList?.length != 0" v-for="usr in usrList">
        <div>{{ usr[0] }}: {{ usr[1] }}</div>
      </li>
      <li v-else class="errorContact">Aucun contact séléctionné</li>
    </ul>
  </div>
</template>

<style scoped>
.selectContactComposent {
  display: flex;
  flex-direction: column;
  height: 100%;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1vh;
}
.form {
  display: grid;
  grid-template-columns: min-content auto;
  gap: 1vh;
}

.form > label {
  text-wrap: nowrap;
}

ul {
  list-style: none;
  background-color: var(--white);
  border-radius: calc(var(--radius) - 1vh);
  margin-top: 1vh;
  height: 100%;
  overflow: scroll;
}

input[type='text'],
input[type='tel'] {
  border: none;
  background-color: var(--white);
  border-radius: calc(var(--radius) - 1vh);
  padding: 0 0.5em;
}

.errorContact {
  text-align: center;
}
</style>
