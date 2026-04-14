import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { useAuthStore } from './stores/auth'

import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
await authStore.initAuthListener()

app.use(router)
app.use(VCalendar, {})
app.mount('#app')
