import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/base.css'

// Crea l'app Vue, collega router e stato globale, poi monta tutto nella pagina.
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
