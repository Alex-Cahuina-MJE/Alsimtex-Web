<script setup>
import { ref } from 'vue'
import { getApiBase } from '../config/api'
import { getTelefonoDisplay, getEmailPrincipal } from '../config/empresa'

const formData = ref({
  nombre: '',
  email: '',
  telefono: '',
  mensaje: ''
})

const enviando = ref(false)
const mensajeEnviado = ref(false)
const mensajeError = ref('')

const enviarFormulario = async () => {
  if (enviando.value) return

  enviando.value = true
  mensajeError.value = ''
  
  try {
    const response = await fetch(`${getApiBase()}/contacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    })

    const data = await response.json()

    if (response.ok) {
      mensajeEnviado.value = true
      // Limpiar formulario
      formData.value = {
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
      }
    } else {
      mensajeError.value = data.error || 'Error al enviar el mensaje'
    }
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    mensajeError.value = 'Error de conexión. Intenta nuevamente.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="contacto-page">
    <div class="container">
      <h1 class="page-title slide-in-bottom">Contáctanos</h1>
      
      <div class="contacto-container">
        <div class="contacto-info fade-in">
          <h2>Información de Contacto</h2>
          <div class="info-item">
            <i class="icon">📍</i>
            <p>Arequipa, Perú</p>
          </div>
          <div class="info-item">
            <i class="icon">📞</i>
            <p>{{ getTelefonoDisplay() }}</p>
          </div>
          <div class="info-item">
            <i class="icon">📧</i>
            <p>{{ getEmailPrincipal() }}</p>
          </div>
        </div>

        <form @submit.prevent="enviarFormulario" class="contacto-form slide-in-right">
          <div class="form-group">
            <label for="nombre">Nombre</label>
            <input 
              type="text" 
              id="nombre" 
              v-model="formData.nombre" 
              required
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              required
            >
          </div>

          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input 
              type="tel" 
              id="telefono" 
              v-model="formData.telefono"
            >
          </div>

          <div class="form-group">
            <label for="mensaje">Mensaje</label>
            <textarea 
              id="mensaje" 
              v-model="formData.mensaje" 
              required
              rows="5"
            ></textarea>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary" 
            :disabled="enviando"
          >
            {{ enviando ? 'Enviando...' : 'Enviar Mensaje' }}
          </button>

          <div v-if="mensajeEnviado" class="mensaje-exito fade-in">
            ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
          </div>

          <div v-if="mensajeError" class="mensaje-error fade-in">
            {{ mensajeError }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contacto-page {
  padding: calc(80px + var(--spacing-3xl)) 0 var(--spacing-4xl);
  background: var(--bg-secondary);
  min-height: 100vh;
}

.page-title {
  text-align: center;
  margin-bottom: var(--spacing-4xl);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  animation: fadeInDown 0.8s ease-out;
}

.contacto-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--spacing-3xl);
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeInUp 1s ease-out;
}

.contacto-info {
  background: var(--bg-primary);
  padding: var(--spacing-3xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(20, 184, 166, 0.1);
  height: fit-content;
  position: sticky;
  top: calc(80px + var(--spacing-lg));
  transition: all var(--transition-normal);
}

.contacto-info:hover {
  box-shadow: var(--shadow-xl);
  border-color: rgba(20, 184, 166, 0.2);
}

.contacto-info h2 {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-2xl);
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.info-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: var(--gradient-primary);
  transform: scaleY(0);
  transition: transform var(--transition-fast);
}

.info-item:hover::before {
  transform: scaleY(1);
}

.info-item:hover {
  background: rgba(20, 184, 166, 0.05);
  transform: translateX(8px);
}

.icon {
  font-size: 2rem;
  margin-right: var(--spacing-lg);
  color: var(--secondary-color);
  flex-shrink: 0;
}

.info-item p {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.contacto-form {
  background: var(--bg-primary);
  padding: var(--spacing-3xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(20, 184, 166, 0.1);
  transition: all var(--transition-normal);
}

.contacto-form:hover {
  box-shadow: var(--shadow-xl);
  border-color: rgba(20, 184, 166, 0.2);
}

.form-group {
  margin-bottom: var(--spacing-xl);
}

label {
  display: block;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  font-size: var(--font-base);
  letter-spacing: 0.3px;
}

input, textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid rgba(20, 184, 166, 0.2);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  font-size: var(--font-base);
  font-family: inherit;
  color: var(--text-primary);
  background: var(--bg-primary);
}

input:hover, textarea:hover {
  border-color: rgba(20, 184, 166, 0.3);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.1);
  transform: translateY(-2px);
}

textarea {
  resize: vertical;
  min-height: 150px;
}

.btn {
  width: 100%;
  padding: var(--spacing-lg);
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  margin-top: var(--spacing-md);
}

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn:hover::before {
  width: 400px;
  height: 400px;
}

.btn:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.mensaje-exito {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  color: #155724;
  border-radius: var(--border-radius-lg);
  text-align: center;
  font-weight: var(--font-semibold);
  font-size: var(--font-lg);
  box-shadow: var(--shadow-sm);
  animation: bounceIn 0.6s ease-out;
  border: 2px solid #b1dfbb;
}

.mensaje-error {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  border-radius: var(--border-radius-lg);
  text-align: center;
  font-weight: var(--font-semibold);
  font-size: var(--font-lg);
  box-shadow: var(--shadow-sm);
  animation: bounceIn 0.6s ease-out;
  border: 2px solid #fca5a5;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 1024px) {
  .contacto-container {
    grid-template-columns: 1fr;
  }

  .contacto-info {
    position: static;
    order: 2;
  }

  .contacto-form {
    order: 1;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: var(--font-4xl);
  }

  .contacto-info,
  .contacto-form {
    padding: var(--spacing-2xl);
  }

  .icon {
    font-size: 1.5rem;
  }
}
</style>