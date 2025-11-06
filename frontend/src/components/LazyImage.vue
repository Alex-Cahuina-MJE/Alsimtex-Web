<template>
  <div class="lazy-image-container">
    <img
      :src="currentSrc"
      :alt="alt"
      class="lazy-image"
      :class="{ loaded: isLoaded }"
      ref="img"
      @error="handleError"
      @load="handleLoad"
    />
    <div v-if="!isLoaded" class="lazy-image-loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import imageConfig from '../config/images.js';

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2Y4ZmFmYyIgc3Ryb2tlPSIjZTFlNWU5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1kYXNoYXJyYXk9IjUsMTAiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSIxMDAiIHI9IjMwIiBmaWxsPSIjYWViN2MwIi8+PHRleHQgeD0iNTAlIiB5PSI3NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzY5NzU4MyI+Q2FyZ2FuZG8uLi48L3RleHQ+PC9zdmc+'
  }
});

const img = ref(null);
const isLoaded = ref(false);
const hasError = ref(false);
let observer = null;

const currentSrc = computed(() => {
  // Si hay error, siempre mostrar imagen de fallback
  if (hasError.value) {
    return imageConfig.getFallbackUrl(true);
  }
  
  // Si la imagen está cargada, mostrar la original
  if (isLoaded.value) {
    return props.src;
  }
  
  // Mientras carga, mostrar placeholder
  return props.placeholder;
});

const handleError = (error = null) => {
  hasError.value = true;
  isLoaded.value = false;
  // Sin logs - manejo silencioso de errores
};

const handleLoad = () => {
  // Simplificado: si se dispara onLoad, la imagen se cargó correctamente
  isLoaded.value = true;
  hasError.value = false;
};

const loadImage = () => {
  const element = img.value;
  if (!element || isLoaded.value || hasError.value) return;

  // Validar URL antes de intentar cargar
  if (!props.src || props.src.trim() === '') {
    hasError.value = true;
    return;
  }

  // Validación temprana de URLs problemáticas - fallar inmediatamente
  if (!imageConfig.isSafeImageUrl(props.src)) {
    hasError.value = true;
    return;
  }

  // La imagen se carga automáticamente a través del binding :src="currentSrc" en el template
  // Los eventos onLoad y onError manejarán el resultado
  // Timeout de seguridad para evitar carga infinita
  const timeoutId = setTimeout(() => {
    if (!isLoaded.value && !hasError.value) {
      hasError.value = true;
    }
  }, 3000); // 3 segundos máximo

  // Limpiar timeout cuando se resuelva
  const originalOnLoad = img.value.onload;
  const originalOnError = img.value.onerror;

  img.value.onload = (e) => {
    clearTimeout(timeoutId);
    if (originalOnLoad) originalOnLoad(e);
    handleLoad();
  };

  img.value.onerror = (e) => {
    clearTimeout(timeoutId);
    if (originalOnError) originalOnError(e);
    handleError();
  };
};onMounted(() => {
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImage();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (img.value) {
      observer.observe(img.value);
    }
  } else {
    // Fallback para navegadores que no soportan IntersectionObserver
    loadImage();
  }

  // Timeout de seguridad para evitar estados de carga infinita
  setTimeout(() => {
    if (!isLoaded.value && !hasError.value) {
      // Si después de 5 segundos no se ha resuelto nada, mostrar fallback
      hasError.value = true;
    }
  }, 5000);
});

// Watcher para resetear estados cuando cambie la URL
watch(() => props.src, () => {
  isLoaded.value = false;
  hasError.value = false;
  // Reiniciar carga cuando cambie la URL
  loadImage();
}, { immediate: false });

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.lazy-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  overflow: hidden;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image.loaded {
  opacity: 1;
}

.lazy-image-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>