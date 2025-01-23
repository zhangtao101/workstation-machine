import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import VxeTable from 'vxe-table'
import 'vxe-table/lib/style.css'

import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'

import print from 'vue3-print-nb'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(print)

app.use(VxeTable)
app.use(VxeUI)

app.mount('#app')
