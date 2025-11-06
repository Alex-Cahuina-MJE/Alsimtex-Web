<!-- ErrorBoundary.vue -->
<template>
  <div>
    <div v-if="hasError" class="error-boundary">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Lo sentimos, ha ocurrido un error</h3>
        <p>{{ error }}</p>
        <button class="button-primary" @click="resetError">
          Intentar de nuevo
        </button>
      </div>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const props = defineProps({
  onError: {
    type: Function,
    default: null
  }
})

const error = ref(null)
const hasError = ref(false)

onErrorCaptured((err) => {
  error.value = err.message
  hasError.value = true
  if (props.onError) {
    props.onError(err)
  }
  return false // previene que el error se propague
})

const resetError = () => {
  error.value = null
  hasError.value = false
}
</script>

<style scoped>
.error-boundary {
  padding: 2rem;
  background: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  text-align: center;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-content i {
  font-size: 2rem;
  color: #d32f2f;
}

.error-content h3 {
  margin: 0;
  color: #d32f2f;
}

.error-content p {
  margin: 0;
  color: #616161;
}

.button-primary {
  padding: 0.5rem 1rem;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.button-primary:hover {
  background: #ea580c;
}
</style>