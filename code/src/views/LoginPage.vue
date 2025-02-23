<script setup lang="ts">
import { ref } from 'vue';

const apiLink = localStorage.getItem('apiLink');
const phone = ref('');
const password = ref('');
const successMessage = ref<string | undefined>(undefined);
const errorMessage = ref<string | undefined>(undefined);

const login = async () => {
  if (!apiLink || typeof apiLink != 'string') {
    console.error('No API link, refresh your app');
    errorMessage.value = "problème interne recharger l'app";
    throw new Error('internal app error');
  }

  try {
    const response = await fetch(apiLink + 'login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: phone.value, password: password.value }),
    });

    if (response.status == 401) {
      errorMessage.value = 'mauvais identifiant ou mot de passe';
      throw new Error('bad credential');
    } else if (!response.ok) {
      errorMessage.value = 'probleme de connexion';
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    successMessage.value = 'connecté !';
    window.history.back();
  } catch (error) {
    console.error('Error during login:', error);
    errorMessage.value = 'un probléme est survenu';
    throw new Error('network error');
  }
};
</script>

<template>
  <div class="login-page">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="username">Phone</label>
        <input id="username" v-model="phone" type="tel" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  cursor: pointer;
}

.success-message {
  color: green;
  margin-top: 1rem;
}

.error-message {
  color: red;
  margin-top: 1rem;
}
</style>
