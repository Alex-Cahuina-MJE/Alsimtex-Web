<template>
  <div v-if="isOpen" class="design-selector-overlay" @click="closeModal">
    <div class="design-selector-modal" @click.stop>
      <!-- Header del modal -->
      <div class="modal-header">
        <h3 class="modal-title">Seleccionar Diseño</h3>
        <button @click="closeModal" class="close-btn" aria-label="Cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Información del producto -->
      <div class="product-info">
        <h4>{{ product.nombre }}</h4>
        <p>Selecciona el diseño que más te guste:</p>
      </div>

      <!-- Opciones de diseño -->
      <div class="design-options">
        <div 
          v-for="(image, index) in images" 
          :key="index"
          class="design-option"
          :class="{ 'selected': selectedDesignIndex === index }"
          @click="selectDesign(index)"
        >
          <div class="design-radio">
            <input 
              type="radio" 
              :id="`design-${index}`"
              :value="index"
              v-model="selectedDesignIndex"
              name="design-selection"
            >
            <label :for="`design-${index}`" class="radio-label"></label>
          </div>
          
          <div class="design-preview">
            <img 
              :src="image" 
              :alt="`${product.nombre} - Diseño ${index + 1}`"
              class="design-image"
              loading="lazy"
            >
            <div class="design-number">Diseño {{ index + 1 }}</div>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="modal-actions">
        <button @click="closeModal" class="btn-cancel">
          Cancelar
        </button>
        <button 
          @click="confirmSelection" 
          class="btn-confirm"
          :disabled="selectedDesignIndex === null"
        >
          Agregar al Carrito
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    required: true
  },
  images: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'design-selected'])

const selectedDesignIndex = ref(0) // Preseleccionar el primer diseño

const selectDesign = (index) => {
  selectedDesignIndex.value = index
}

const confirmSelection = () => {
  if (selectedDesignIndex.value !== null) {
    const selectedDesign = {
      imageUrl: props.images[selectedDesignIndex.value],
      imageIndex: selectedDesignIndex.value,
      designNumber: selectedDesignIndex.value + 1,
      totalDesigns: props.images.length
    }
    
    emit('design-selected', selectedDesign)
    closeModal()
  }
}

const closeModal = () => {
  emit('close')
}

// Reset selection when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    selectedDesignIndex.value = 0 // Reset to first design
  }
})
</script>

<style scoped>
.design-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.design-selector-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.product-info {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.product-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.product-info p {
  color: #6b7280;
  margin: 0;
  font-size: 0.9rem;
}

.design-options {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.design-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.design-option:hover {
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.design-option.selected {
  border-color: #e11d48;
  background: #fef2f2;
  box-shadow: 0 0 0 1px #fda4af;
}

.design-radio {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.design-radio input[type="radio"] {
  opacity: 0;
  position: absolute;
}

.radio-label {
  display: block;
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.design-option.selected .radio-label {
  border-color: #e11d48;
  background: #e11d48;
}

.design-option.selected .radio-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
}

.design-preview {
  text-align: center;
}

.design-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.design-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
}

.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-confirm {
  padding: 0.75rem 1.5rem;
  background: #e11d48;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #be185d;
  transform: translateY(-1px);
}

.btn-confirm:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .design-selector-modal {
    width: 95vw;
    margin: 1rem;
  }
  
  .design-options {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .design-image {
    height: 120px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
</style>