import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import LazyImage from './components/LazyImage.vue'
import { useAuthStore } from './stores/authStore'

// Importaciones de estilos
import './assets/css/variables.css'
import './assets/css/animations.css'
import './assets/css/main.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

// Crear la aplicación y el store
const app = createApp(App)
const pinia = createPinia()

// Instalar pinia antes que el router
app.use(pinia)
app.use(router)

// Registrar LazyImage globalmente
app.component('LazyImage', LazyImage)

// Función asíncrona para inicializar la aplicación
async function initApp() {
    try {
        const authStore = useAuthStore()
        if (authStore.init) {
            await authStore.init()
        }
        app.mount('#app')
    } catch (error) {
        console.error('Error inicializando la aplicación:', error)
            // Montar la app de todos modos para mostrar mensajes de error si los hay
        app.mount('#app')
    }
}

// Iniciar la aplicación
initApp()