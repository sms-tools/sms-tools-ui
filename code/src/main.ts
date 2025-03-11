import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

localStorage.setItem(
  'apiLink',
  import.meta.env.MODE === 'development' ? `/api/` : 'sms.mpqa.fr/api/',
);

app.mount('#app');
