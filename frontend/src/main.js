import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { createPinia } from 'pinia'

const pinia = createPinia()
createApp(App).use(router).use(pinia).mount('#app')
