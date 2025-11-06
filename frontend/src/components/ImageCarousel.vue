<template>
  <div class="image-carousel" @mouseenter="pauseAutoplay" @mouseleave="resumeAutoplay">
    <!-- Imagen principal -->
    <div class="carousel-container">
      <LazyImage 
        :src="currentImage" 
        :alt="alt"
        :placeholder="placeholder"
        class="carousel-image"
        @click="handleImageClick"
      />
      
      <!-- Controles de navegación (solo si hay más de 1 imagen) -->
      <div v-if="images.length > 1" class="carousel-controls">
        <button 
          @click="previousImage" 
          class="carousel-btn carousel-btn-prev"
          :disabled="currentIndex === 0 && !infinite"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <button 
          @click="nextImage" 
          class="carousel-btn carousel-btn-next"
          :disabled="currentIndex === images.length - 1 && !infinite"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <!-- Indicadores de posición -->
      <div v-if="images.length > 1 && showIndicators" class="carousel-indicators">
        <button
          v-for="(image, index) in images"
          :key="index"
          @click="goToImage(index)"
          class="indicator"
          :class="{ active: index === currentIndex }"
        ></button>
      </div>
      
      <!-- Contador de imágenes -->
      <div v-if="images.length > 1 && showCounter" class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
      
      <!-- Indicador removido - sistema simplificado -->
    </div>
    
    <!-- Miniaturas (opcional) -->
    <div v-if="images.length > 1 && showThumbnails" class="carousel-thumbnails">
      <div
        v-for="(image, index) in images"
        :key="index"
        @click="goToImage(index)"
        class="thumbnail"
        :class="{ active: index === currentIndex }"
      >
        <LazyImage 
          :src="image" 
          :alt="`${alt} - imagen ${index + 1}`"
          class="thumbnail-image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import LazyImage from './LazyImage.vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
    validator: (images) => images.length > 0
  },
  alt: {
    type: String,
    default: 'Imagen del producto'
  },
  placeholder: {
    type: String,
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  autoplayInterval: {
    type: Number,
    default: 3000
  },
  infinite: {
    type: Boolean,
    default: true
  },
  showIndicators: {
    type: Boolean,
    default: true
  },
  showCounter: {
    type: Boolean,
    default: false
  },
  showThumbnails: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'image-selected'])

const currentIndex = ref(0)
const autoplayTimer = ref(null)
const isAutoplayPaused = ref(false)

const currentImage = computed(() => {
  return props.images[currentIndex.value] || props.placeholder
})

// Emitir imagen seleccionada cuando cambia el índice
watch(currentIndex, (newIndex) => {
  console.log('🎯 WATCH TRIGGERED - currentIndex changed to:', newIndex)
  const selectedImage = props.images[newIndex]
  const selectedDesign = {
    imageUrl: selectedImage,
    imageIndex: newIndex,
    designNumber: newIndex + 1,
    totalDesigns: props.images.length
  }
  console.log('🎯 Emitting image-selected:', selectedDesign)
  emit('image-selected', selectedDesign)
}, { immediate: true })

const nextImage = () => {
  const oldIndex = currentIndex.value
  if (props.infinite) {
    currentIndex.value = (currentIndex.value + 1) % props.images.length
  } else if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
  console.log('🔄 nextImage: changed from', oldIndex, 'to', currentIndex.value)
}

const previousImage = () => {
  if (props.infinite) {
    currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
  } else if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goToImage = (index) => {
  if (index >= 0 && index < props.images.length) {
    currentIndex.value = index
    
    // Scroll thumbnail into view if needed
    const thumbnails = document.querySelector('.carousel-thumbnails')
    if (thumbnails) {
      const thumbnail = thumbnails.children[index]
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }
}

const startAutoplay = () => {
  console.log('🎬 SIMPLE startAutoplay called');
  
  // Limpiar timer existente
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value);
  }
  
  // Forzar inicio incondicional para testing
  console.log('✅ FORCING autoplay start - 2 second interval');
  autoplayTimer.value = setInterval(() => {
    console.log('🔄 TICK! Changing from index', currentIndex.value);
    nextImage();
    console.log('🔄 New index:', currentIndex.value);
  }, 2000); // 2 segundos para testing
}

const stopAutoplay = () => {
  if (autoplayTimer.value) {
    clearInterval(autoplayTimer.value)
    autoplayTimer.value = null
  }
}

const pauseAutoplay = () => {
  isAutoplayPaused.value = true
  stopAutoplay()
}

const resumeAutoplay = () => {
  isAutoplayPaused.value = false
  startAutoplay()
}

const handleImageClick = (event) => {
  // Solo emitir clic si no se hizo clic en controles
  if (!event.target.closest('.carousel-btn') && !event.target.closest('.indicator')) {
    emit('click', event)
  }
}

// Keyboard navigation
const handleKeydown = (event) => {
  if (props.images.length <= 1) return
  
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      previousImage()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextImage()
      break
    case 'Home':
      event.preventDefault()
      goToImage(0)
      break
    case 'End':
      event.preventDefault()
      goToImage(props.images.length - 1)
      break
  }
}

// Watch for images changes
watch(() => props.images, () => {
  if (currentIndex.value >= props.images.length) {
    currentIndex.value = 0
  }
}, { immediate: true })

onMounted(() => {
  console.log('🎠 ImageCarousel mounted with:', {
    images: props.images,
    autoplay: props.autoplay,
    interval: props.autoplayInterval
  }); // DEBUG
  startAutoplay()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopAutoplay()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.image-carousel {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--border-radius-lg);
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--spacing-sm);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.image-carousel:hover .carousel-controls {
  opacity: 1;
  pointer-events: auto;
}

.carousel-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(var(--blur-sm));
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.carousel-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.carousel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-md);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(var(--blur-sm));
  border-radius: var(--border-radius-full);
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--border-radius-full);
  border: none;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.8);
}

.image-counter {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(var(--blur-sm));
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.carousel-thumbnails {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  overflow-x: auto;
  padding: var(--spacing-md);
  scrollbar-width: thin;
  scrollbar-color: rgba(20, 184, 166, 0.5) transparent; 
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(var(--blur-sm, 8px));
  border-radius: var(--border-radius-lg, 12px);
  border: 1px solid rgba(20, 184, 166, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.carousel-thumbnails::-webkit-scrollbar {
  height: 4px;
}

.carousel-thumbnails::-webkit-scrollbar-track {
  background: transparent;
}

.carousel-thumbnails::-webkit-scrollbar-thumb {
  background: var(--color-primary-light);
  border-radius: var(--border-radius-full);
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 3px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.thumbnail.active {
  border-color: var(--secondary-color, #14b8a6);
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(20, 184, 166, 0.4);
  position: relative;
}

.thumbnail.active::after {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid var(--secondary-color, #14b8a6);
  border-radius: var(--border-radius-md);
  background: rgba(20, 184, 166, 0.1);
  pointer-events: none;
}

.thumbnail:hover:not(.active) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: rgba(20, 184, 166, 0.3);
}

.thumbnail:active {
  transform: scale(0.95);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Responsive */
@media (max-width: 768px) {
  .carousel-btn {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .carousel-controls {
    padding: 0 var(--spacing-xs);
  }
  
  .thumbnail {
    width: 70px;
    height: 70px;
  }
  
  .image-counter {
    font-size: var(--font-xs);
    padding: 4px 8px;
  }
}

@media (max-width: 480px) {
  .carousel-thumbnails {
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
  }
  
  .thumbnail {
    width: 50px;
    height: 50px;
    border-width: 2px;
  }
  
  .thumbnail.active {
    transform: scale(1.05);
  }
  
  .thumbnail:hover {
    transform: scale(1.1);
  }
  
  .carousel-btn {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
}

/* Indicador de diseño seleccionado */
.design-selector {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.design-label {
  opacity: 0.9;
}

.design-number {
  background: var(--color-primary, #e11d48);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.8rem;
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .design-selector {
    bottom: 8px;
    left: 8px;
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .design-number {
    padding: 1px 6px;
    font-size: 0.75rem;
  }
}
</style>