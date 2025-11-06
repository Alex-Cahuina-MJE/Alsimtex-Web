<template>
  <div class="error-notification-container" v-if="errorStore.hasErrors">
    <TransitionGroup name="error-slide">
      <div
        v-for="error in errorStore.errors"
        :key="error.id"
        :class="['error-notification', error.type]"
        @click="errorStore.removeError(error.id)"
      >
        <i :class="getIconClass(error.type)"></i>
        <span class="error-message">{{ error.message }}</span>
        <button class="close-button" @click.stop="errorStore.removeError(error.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useErrorStore } from '../stores/errorStore';

const errorStore = useErrorStore();

const getIconClass = (type) => {
  switch (type) {
    case 'error':
      return 'fas fa-exclamation-circle';
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'success':
      return 'fas fa-check-circle';
    default:
      return 'fas fa-info-circle';
  }
};
</script>

<style scoped>
.error-notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
}

.error-notification {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.error-notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

.error-notification.error {
  border-left: 4px solid var(--color-error);
  background-color: var(--color-error-bg);
}

.error-notification.warning {
  border-left: 4px solid var(--color-warning);
  background-color: var(--color-warning-bg);
}

.error-notification.success {
  border-left: 4px solid var(--color-success);
  background-color: var(--color-success-bg);
}

.error-notification i {
  margin-right: 10px;
  font-size: 1.2em;
}

.error-notification.error i {
  color: var(--color-error);
}

.error-notification.warning i {
  color: var(--color-warning);
}

.error-notification.success i {
  color: var(--color-success);
}

.error-message {
  flex: 1;
  font-size: 0.9em;
}

.close-button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  margin-left: 10px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.close-button:hover {
  opacity: 1;
}

/* Animaciones */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s ease;
}

.error-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.error-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>