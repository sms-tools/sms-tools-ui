import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const apiLink = 'https://127.0.0.1/'
app.provide('apiLink', apiLink)

app.mount('#app')
