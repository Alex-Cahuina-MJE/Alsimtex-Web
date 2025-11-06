<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmación'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'warning', // warning, danger, info
    validator: (value) => ['warning', 'danger', 'info'].includes(value)
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

const handleConfirm = () => {
  emit('confirm')
  emit('update:show', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const handleBackdropClick = (event) => {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}

const getIcon = () => {
  const icons = {
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  }
  return icons[props.type] || icons.warning
}

const getIconColor = () => {
  const colors = {
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  }
  return colors[props.type] || colors.warning
}
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click="handleBackdropClick">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-icon" :style="{ color: getIconColor() }">
            <i :class="getIcon()"></i>
          </div>
          
          <div class="modal-body">
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-message">{{ message }}</p>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-cancel" @click="handleCancel">
              {{ cancelText }}
            </button>
            <button 
              class="btn btn-confirm" 
              :class="`btn-${type}`"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--spacing-lg);
}

.modal-container {
  background: white;
  border-radius: var(--border-radius-2xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 450px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-content {
  padding: var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin-bottom: var(--spacing-xl);
  animation: iconPulse 0.5s ease-out;
}

@keyframes iconPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-body {
  margin-bottom: var(--spacing-2xl);
}

.modal-title {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.modal-message {
  font-size: var(--font-base);
  color: var(--text-secondary);
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  width: 100%;
}

.btn {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-xl);
  border: none;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: var(--text-primary);
}

.btn-confirm {
  color: white;
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.3);
}

.btn-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.btn-info:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

/* Transiciones */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 90%;
  }

  .modal-content {
    padding: var(--spacing-xl);
  }

  .modal-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }

  .modal-title {
    font-size: var(--font-xl);
  }

  .modal-actions {
    flex-direction: column-reverse;
  }
}
</style>
