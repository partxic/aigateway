import { createApp } from 'vue'
import App from '@/App.vue'
const app = createApp(App)

import router from '@/router.js'
app.use(router)

import '@/global.css'
app.mount('#app')
