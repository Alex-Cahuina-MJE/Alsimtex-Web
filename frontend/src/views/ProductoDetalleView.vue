<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductosStore } from '../stores/productosStore'
import { useCartStore } from '../stores/cartStore'
import { getAssetBaseUrl } from '../config/api'
import ImageCarousel from '../components/ImageCarousel.vue'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const productosStore = useProductosStore()
const cartStore = useCartStore()

const producto = ref(null)
const loading = ref(true)
const cantidad = ref(1)
const productosRelacionados = ref([])
const error = ref('')

onMounted(async () => {
  await cargarProducto()
  await cargarProductosRelacionados()
})

// Observar cambios en la ruta para recargar el producto
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await cargarProducto()
    await cargarProductosRelacionados()
    cantidad.value = 1
  }
})

const cargarProducto = async () => {
  loading.value = true
  try {
    // Usar fetchProductoById para obtener datos frescos del producto
    const currentProductId = route.params.id
    producto.value = await productosStore.fetchProductoById(currentProductId)
    
    if (!producto.value) {
      router.push('/productos')
      return
    }
  } catch (error) {
    console.error('Error cargando producto:', error)
    router.push('/productos')
  } finally {
    loading.value = false
  }
}

const cargarProductosRelacionados = async () => {
  if (producto.value) {
    // Asegurarse de que los productos generales están cargados
    if (productosStore.productos.length === 0) {
      await productosStore.fetchProductos()
    }
    const productosActivos = productosStore.productos.filter(p => p.estado === true)
    productosRelacionados.value = productosActivos
      .filter(p => p.categoria === producto.value.categoria && p.id != producto.value.id)
      .slice(0, 8)
  }
}

const getFullImageUrl = (path) => {
  if (!path) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0ZDRkOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSI5MCIgcj0iMjUiIGZpbGw9IiNhZGIzYmYiLz48cGF0aCBkPSJNMTQ1IDkwbDE1IDIwIDE1LTIweiIgZmlsbD0iIzY5NzU4MyIvPjx0ZXh0IHg9IjE2MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI1MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODAiPkFMU0lNVEVYPC90ZXh0Pjx0ZXh0IHg9IjE2MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPlNpbiBpbWFnZW48L3RleHQ+PC9zdmc+'; // SVG inline instantáneo
  if (path.startsWith('http')) {
    return path;
  }
  const assetBase = getAssetBaseUrl();
  return `${assetBase}${path}`;
}

const imagenes = computed(() => {
  if (!producto.value) return []
  
  const todasLasImagenes = [
    producto.value.imagen_principal,
    ...(producto.value.imagenes || [])
  ].filter(Boolean); // Filtra valores nulos o vacíos

  if (todasLasImagenes.length === 0) {
    return ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0ZDRkOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSI5MCIgcj0iMjUiIGZpbGw9IiNhZGIzYmYiLz48cGF0aCBkPSJNMTQ1IDkwbDE1IDIwIDE1LTIweiIgZmlsbD0iIzY5NzU4MyIvPjx0ZXh0IHg9IjE2MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI1MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODAiPkFMU0lNVEVYPC90ZXh0Pjx0ZXh0IHg9IjE2MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPlNpbiBpbWFnZW48L3RleHQ+PC9zdmc+']; // Array con SVG inline
  }

  return todasLasImagenes.map(img => getFullImageUrl(img));
})

const precioConDescuento = computed(() => {
  if (!producto.value) return 0
  const descuento = producto.value.descuento || 0
  return parseFloat(producto.value.precio_base || 0) * (1 - (descuento / 100))
})

const precioOriginal = computed(() => {
  if (!producto.value) return 0
  return parseFloat(producto.value.precio_base || 0)
})

const porcentajeDescuento = computed(() => {
  if (!producto.value) return 0
  return producto.value.descuento || 0
})

const mostrarTamaño = computed(() => {
  if (!producto.value) return false
  return !['ALMOHADAS', 'SERVICIO', 'PRODUCTO'].includes(producto.value.categoria)
})

const incrementarCantidad = () => {
  if (cantidad.value < (producto.value?.stock || 0) && cantidad.value < 20) {
    cantidad.value++
  }
}

const decrementarCantidad = () => {
  if (cantidad.value > 1) {
    cantidad.value--
  }
}

const agregarAlCarrito = () => {
  if (!producto.value) return

  // Validar stock disponible
  if (producto.value.stock < cantidad.value) {
    error.value = `Solo hay ${producto.value.stock} unidades disponibles`
    setTimeout(() => error.value = '', 3000)
    return
  }

  cartStore.addToCart([{
    producto: {
      id: producto.value.id,
      nombre: producto.value.nombre,
      imagen: imagenes.value[0],
      categoria: producto.value.categoria,
      precio: precioConDescuento.value, // Agregar precio unitario
      stock: producto.value.stock
    },
    tipo: producto.value.categoria
  }])
  
  // Mostrar notificación elegante
  const mensaje = `${cantidad.value} ${producto.value.nombre} agregado al carrito`
  
  Swal.fire({
    title: '¡Agregado al carrito!',
    text: mensaje,
    icon: 'success',
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    background: '#f0fff4',
    color: '#065f46',
    iconColor: '#10b981',
    customClass: {
      popup: 'colored-toast'
    }
  })
}

const verProductoRelacionado = (id) => {
  router.push(`/producto/${id}`)
  window.scrollTo(0, 0)
}

const getProductImage = (producto) => {
  return getFullImageUrl(producto.imagen_principal);
}
</script>

<template>
  <div class="container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando producto...</p>
    </div>

    <div v-else-if="!producto" class="not-found">
      <h2>Producto no encontrado</h2>
      <router-link to="/productos" class="btn-primary">Ver todos los productos</router-link>
    </div>

    <div v-else class="producto-detalle">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/">Inicio</router-link>
        <span>/</span>
        <router-link to="/productos">Productos</router-link>
        <span>/</span>
        <span>{{ producto.categoria }}</span>
        <span>/</span>
        <span>{{ producto.nombre }}</span>
      </nav>

      <!-- Contenido principal -->
      <div class="producto-main">
        <!-- Galería de imágenes con carrusel -->
        <div class="producto-galeria">
          <ImageCarousel 
            :images="imagenes" 
            :alt="producto.nombre"
            placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQ2MCIgaGVpZ2h0PSI0NjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0ZDRkOCIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtZGFzaGFycmF5PSIxMCwxMCIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjIwMCIgcj0iNDAiIGZpbGw9IiNhZGIzYmYiLz48cGF0aCBkPSJNMjIwIDIwMGwzMCAzNSAzMC0zNXoiIGZpbGw9IiM2OTc1ODMiLz48dGV4dCB4PSIyNTAiIHk9IjMwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iNjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3NDgwIj5BTFNJTVRFWDwvdGV4dD48dGV4dCB4PSIyNTAiIHk9IjMzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIj5TaW4gaW1hZ2VuIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+"
            :autoplay="false"
            :show-indicators="imagenes.length > 1"
            :show-counter="imagenes.length > 1"
            :show-thumbnails="false"
            :infinite="true"
          />
        </div>

        <!-- Información del producto -->
        <div class="producto-info">
          <div class="marca">{{ producto.marca || 'ALSIMTEX' }}</div>
          <div class="codigo">Código: {{ producto.codigo || producto.id }}</div>
          
          <h1 class="titulo">{{ producto.nombre }}</h1>
          
          <div class="rating">
            <div class="estrellas">
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star"></i>
              <i class="fas fa-star-half-alt"></i>
            </div>
            <span class="reviews">({{ Math.floor(Math.random() * 1000) + 50 }})</span>
          </div>

          <div class="vendido-por">
            <span>Vendido por</span>
            <strong>ALSIMTEX</strong>
            <div class="seller-badges">
              <span class="badge">¡Recomendado por alsimtex.com!</span>
              <span class="badge">Realiza entregas a tiempo</span>
              <span class="badge">Cumple con sus entregas</span>
            </div>
          </div>

          <!-- Opciones del producto -->
          <!---<div class="opciones">
            <div class="opcion">
              <span class="label">Color:</span>
              <span class="valor">{{ producto.color || 'Varios colores' }}</span>
            </div>
            
            <div class="opcion" v-if="mostrarTamaño">
              <span class="label">Tamaño:</span>
              <div class="talla-display" v-if="producto.subcategoria">
                <span class="talla active">{{ producto.subcategoria }}</span>
              </div>
              <span v-if="error" class="error-mensaje">{{ error }}</span>
            </div>
          </div>
          -->
          <!-- Stock disponible -->
          <div class="stock-info" v-if="producto.stock !== undefined">
            <i class="fas fa-box"></i>
            <span>Stock disponible: {{ producto.stock }} unidades</span>
          </div>

          <!-- Entrega -->
          <div class="entrega-info">
            <h3><i class="fas fa-truck"></i> Entrega en Arequipa</h3>
            <div class="metodos-entrega">
              <div class="metodo">
                <i class="fas fa-home"></i>
                <span>Despacho a domicilio</span>
              </div>
              <div class="metodo disabled">
                <i class="fas fa-store"></i>
                <span>Retira tu compra</span>
                <small>Sin disponibilidad en tienda</small>
              </div>
            </div>
          </div>

          <!-- Precio y compra -->
          <div class="precio-compra">
            <div class="precios">
              <template v-if="porcentajeDescuento > 0">
                <div class="precio-actual">S/ {{ precioConDescuento.toFixed(2) }}</div>
                <div class="precio-antes">S/ {{ precioOriginal.toFixed(2) }}</div>
                <div class="descuento">-{{ porcentajeDescuento }}%</div>
              </template>
              <template v-else>
                <div class="precio-actual">S/ {{ precioOriginal.toFixed(2) }}</div>
              </template>
            </div>

            <div class="cantidad-selector">
              <button @click="decrementarCantidad" :disabled="cantidad <= 1">−</button>
              <input v-model="cantidad" type="number" min="1" max="20" readonly>
              <button @click="incrementarCantidad" :disabled="cantidad >= 20">+</button>
              <span class="limite">Máximo 20 unidades.</span>
            </div>

            <button class="btn-agregar-carrito" @click="agregarAlCarrito">
              <i class="fas fa-shopping-cart"></i>
              Agregar al Carrito
            </button>

            <div class="beneficios">
              <div class="beneficio">
                <i class="fas fa-undo"></i>
                <span>Devolver es fácil y gratis</span>
              </div>
              <div class="beneficio">
                <i class="fas fa-shield-alt"></i>
                <span>Satisfacción garantizada</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Especificaciones -->
      <div class="especificaciones">
        <h2>Especificaciones</h2>
        <div class="spec-grid">
          <div class="spec-item">
            <span class="spec-label">Condición del producto</span>
            <span class="spec-value">Nuevo</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Garantía</span>
            <span class="spec-value">12 meses</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Material</span>
            <span class="spec-value">{{ producto.material || '100% Algodón' }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Categoría</span>
            <span class="spec-value">{{ producto.categoria }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">Subcategoría</span>
            <span class="spec-value">{{ producto.subcategoria }}</span>
          </div>
          <!--<div class="spec-item">
            <span class="spec-label">Tipo</span>
            <span class="spec-value">{{ producto.tipo || 'Juego de sábanas' }}</span>
          </div>
          -->
        </div>
      </div>

      <!-- Información adicional -->
      <div class="informacion-adicional">
        <h2>Información adicional</h2>
        <div class="descripcion">
          <p>{{ producto.descripcion || 'Te invitamos a disfrutar de espacios que inspiran, que evocan emociones y que te conectan con tu capacidad de crear. Nuestra colección de productos textiles te ofrece una combinación perfecta de estilo y funcionalidad.' }}</p>
          
          <div class="detalles">
            <p><strong>Marca:</strong> {{ producto.marca || 'ALSIMTEX' }}</p>
            <p><strong>Modelo:</strong> {{ producto.codigo || 'Premium' }}</p>
            <p><strong>Material:</strong> {{ producto.material || '100% ALGODÓN' }}</p>
            <p><strong>Garantía:</strong> 1 AÑO</p>
            <!--<p><strong>Incluye:</strong> Juego completo según especificaciones</p>-->
          </div>
        </div>
      </div>

      <!-- Productos relacionados -->
      <div class="productos-relacionados" v-if="productosRelacionados.length > 0">
        <h2>También podría interesarte</h2>
        <div class="productos-grid">
          <div 
            v-for="relacionado in productosRelacionados" 
            :key="relacionado.id"
            class="producto-card"
            @click="verProductoRelacionado(relacionado.id)"
          >
            <div class="imagen">
              <img 
                :src="getProductImage(relacionado)" 
                :alt="relacionado.nombre"
                @error="$event.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZWUyZTIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZWM5YzkiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjE2MCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSI2MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNkYzI2MjYiPkVycm9yIGFsIGNhcmdhcjwvdGV4dD48L3N2Zz4='"
              >
            </div>
            <div class="info">
              <div class="marca">{{ relacionado.marca || 'ALSIMTEX' }}</div>
              <h3>{{ relacionado.nombre }}</h3>
              <template v-if="relacionado.descuento">
                <div class="precio">S/ {{ ((parseFloat(relacionado.precio_base || 0) * (1 - (relacionado.descuento || 0)/100))).toFixed(2) }}</div>
                <div class="precio-antes">S/ {{ (parseFloat(relacionado.precio_base || 0)).toFixed(2) }}</div>
                <div class="descuento-tag">-{{ relacionado.descuento }}%</div>
              </template>
              <template v-else>
                <div class="precio">S/ {{ (parseFloat(relacionado.precio_base || 0)).toFixed(2) }}</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--spacing-lg);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(20, 184, 166, 0.2);
  border-top-color: var(--secondary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.not-found {
  text-align: center;
  padding: var(--spacing-4xl) 0;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl) 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-2xl);
}

.breadcrumb a {
  color: var(--secondary-color);
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Layout principal */
.producto-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4xl);
  margin-bottom: var(--spacing-4xl);
}

/* Galería con carrusel */
.producto-galeria {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* Estilos específicos para el carrusel en detalle de producto */
.producto-galeria .image-carousel {
  width: 100%;
  height: 500px;
  border-radius: var(--border-radius-xl);
  overflow: visible;
  box-shadow: var(--shadow-lg);
  background: var(--bg-secondary);
}

.producto-galeria .carousel-container {
  height: 500px;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
}

.producto-galeria .carousel-image {
  height: 100%;
  border-radius: var(--border-radius-xl);
}

/* Miniaturas más prominentes en detalle */
.producto-galeria .carousel-thumbnails {
  margin-top: var(--spacing-lg);
  justify-content: center;
  background: white;
  box-shadow: var(--shadow-md);
}

/* Estilos removidos - ahora usa ImageCarousel */

.miniatura img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Información del producto */
.producto-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.marca {
  font-size: var(--font-sm);
  color: var(--secondary-color);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.codigo {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.titulo {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.3;
}

.rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.estrellas {
  color: #ffa500;
}

.reviews {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.vendido-por {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.vendido-por span {
  color: var(--text-secondary);
}

.vendido-por strong {
  color: var(--text-primary);
  margin-left: var(--spacing-xs);
}

.seller-badges {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.badge {
  font-size: var(--font-xs);
  color: var(--secondary-color);
}

/* Opciones */
.opciones {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.opcion {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.label {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.valor {
  color: var(--text-secondary);
}

.tallas {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.talla {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-sm);
}

.talla.active {
  border-color: var(--secondary-color);
  background: rgba(20, 184, 166, 0.1);
  color: var(--secondary-color);
}

.talla:hover {
  border-color: var(--secondary-color);
}

.stock-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  color: var(--text-primary);
}

.stock-info i {
  color: var(--secondary-color);
}

.talla-display {
  display: flex;
  gap: var(--spacing-sm);
}

.talla-display .talla {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-md);
  background: rgba(20, 184, 166, 0.1);
  color: var(--secondary-color);
  font-weight: var(--font-semibold);
}

/* Entrega */
.entrega-info {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.entrega-info h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-size: var(--font-lg);
}

.metodos-entrega {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.metodo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
}

.metodo.disabled {
  opacity: 0.5;
}

.metodo i {
  color: var(--secondary-color);
}

.metodo small {
  display: block;
  color: var(--text-secondary);
  font-size: var(--font-xs);
}

/* Precio y compra */
.precio-compra {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
}

.precios {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.precio-actual {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.precio-antes {
  font-size: var(--font-lg);
  color: var(--text-secondary);
  text-decoration: line-through;
}

.descuento {
  background: #ef4444;
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
}

.cantidad-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.cantidad-selector button {
  width: 40px;
  height: 40px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  transition: all var(--transition-fast);
}

.cantidad-selector button:hover:not(:disabled) {
  border-color: var(--secondary-color);
  background: rgba(20, 184, 166, 0.1);
}

.cantidad-selector button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.cantidad-selector input {
  width: 60px;
  height: 40px;
  text-align: center;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
}

.limite {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.error-mensaje {
  color: #ef4444;
  font-size: var(--font-sm);
  margin-top: var(--spacing-xs);
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.btn-agregar-carrito {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.btn-agregar-carrito:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.beneficios {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.beneficio {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.beneficio i {
  color: var(--secondary-color);
}

/* Especificaciones */
.especificaciones {
  margin-bottom: var(--spacing-4xl);
}

.especificaciones h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
}

.spec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.spec-label {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.spec-value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* Información adicional */
.informacion-adicional {
  margin-bottom: var(--spacing-4xl);
}

.informacion-adicional h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
}

.descripcion {
  background: var(--bg-secondary);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-xl);
}

.descripcion p {
  line-height: 1.7;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.detalles p {
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.detalles strong {
  color: var(--text-primary);
}

/* Productos relacionados */
.productos-relacionados h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-xl);
  color: var(--text-primary);
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.producto-card {
  background: white;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.producto-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.producto-card .imagen {
  aspect-ratio: 1;
  overflow: hidden;
}

.producto-card .imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.producto-card:hover .imagen img {
  transform: scale(1.1);
}

.producto-card .info {
  padding: var(--spacing-lg);
}

.producto-card .marca {
  font-size: var(--font-xs);
  color: var(--secondary-color);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  margin-bottom: var(--spacing-xs);
}

.producto-card h3 {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-card .precio {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.producto-card .precio-antes {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  text-decoration: line-through;
}

.producto-card .descuento-tag {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: #ef4444;
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
}

/* Responsive */
@media (max-width: 768px) {
  .producto-main {
    grid-template-columns: 1fr;
    gap: var(--spacing-2xl);
  }
  
  .breadcrumb {
    font-size: var(--font-xs);
    flex-wrap: wrap;
  }
  
  .titulo {
    font-size: var(--font-xl);
  }
  
  /* Carrusel responsive en móviles */
  .producto-galeria .image-carousel {
    height: 400px;
  }
  
  .producto-galeria {
    max-width: none;
    margin: 0;
  }
  
  .precio-actual {
    font-size: var(--font-2xl);
  }
  
  .spec-grid {
    grid-template-columns: 1fr;
  }
  
  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }
  
  .tallas {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  /* Carrusel en móviles muy pequeños */
  .producto-galeria .image-carousel {
    height: 350px;
  }
}
</style>