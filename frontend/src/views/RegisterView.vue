<template>
  <div class="register-page">
    <div class="register-container">
      <h1 class="register-title">Crear Cuenta</h1>
      
      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input 
            type="text" 
            id="nombre" 
            v-model="nombre" 
            required
            placeholder="Tu nombre completo"
          >
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="tucorreo@ejemplo.com"
          >
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input-wrapper">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required
              placeholder="Tu contraseña"
            >
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
              :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <div class="password-input-wrapper">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required
              placeholder="Confirma tu contraseña"
            >
            <button 
              type="button" 
              class="toggle-password" 
              @click="showConfirmPassword = !showConfirmPassword"
              :title="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="error-message" v-if="error">
          {{ error }}
        </div>

        <button type="submit" class="register-button" :disabled="isLoading">
          {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
        </button>

        <p class="login-link">
          ¿Ya tienes cuenta? 
          <router-link to="/login">Inicia sesión aquí</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const nombre = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleSubmit = async () => {
  try {
    if (password.value !== confirmPassword.value) {
      error.value = 'Las contraseñas no coinciden';
      return;
    }

    isLoading.value = true;
    error.value = '';
    
    await authStore.register({
      nombre: nombre.value,
      email: email.value,
      password: password.value
    });
    
    router.push('/');
  } catch (err) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-md);
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
}

.register-container {
  background: white;
  padding: var(--spacing-3xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 400px;
  animation: slideInUp 0.5s ease-out;
}

.register-title {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  color: var(--text-primary);
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px 10px;
  font-size: 1.1rem;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: var(--secondary-color);
}

.form-group input {
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: var(--shadow-sm);
}

.register-button {
  background: var(--gradient-primary);
  color: white;
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: var(--spacing-xl);
  color: var(--text-secondary);
}

.login-link a {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: var(--font-semibold);
  transition: color var(--transition-fast);
}

.login-link a:hover {
  color: var(--primary-color);
}

.error-message {
  background: var(--danger-bg);
  color: var(--danger-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-sm);
  text-align: center;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>