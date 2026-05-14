import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/base.css' // stili globali + Tailwind

const app = createApp(App)

app.use(createPinia()) // store globale (es. autenticazione)
app.use(router)        // sistema di navigazione tra pagine

app.mount('#app')
