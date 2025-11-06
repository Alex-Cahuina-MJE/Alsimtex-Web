<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { storeToRefs } from 'pinia'
import { useNotifications } from '../composables/useNotifications'
import { getAssetBaseUrl } from '../config/api'

const router = useRouter()
const cartStore = useCartStore()
const { addNotification } = useNotifications()
const { items, isCartOpen, totalItems, subtotal, total } = storeToRefs(cartStore)

// Estado para edición de items
const itemEditando = ref(null)
const detallesTemp = ref({
  notas: ''
})

// Definir las opciones de productos disponibles (ya no se usa para edición)
const tiposDeProducto = {
  sabana: {
    nombre: 'Juego de Sábanas',
    requiereTamano: true,
    tamanos: ['1 Plaza', '2 Plazas', 'Queen', 'King']
  },
  funda: {
    nombre: 'Funda de Almohada',
    requiereTamano: false,
    tamanos: []
  },
  edredon: {
    nombre: 'Edredón',
    requiereTamano: true,
    tamanos: ['1 Plaza', '2 Plazas', 'Queen', 'King']
  }
}

// Estado para loading de operaciones
const updatingItems = ref(new Set())

const updateQuantityWithFeedback = async (cartItemId, newQuantity) => {
  if (updatingItems.value.has(cartItemId)) return
  
  updatingItems.value.add(cartItemId)
  try {
    cartStore.updateQuantity(cartItemId, newQuantity)
    // Pequeño delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 200))
  } finally {
    updatingItems.value.delete(cartItemId)
  }
}

const removeItemWithFeedback = async (cartItemId, productName) => {
  if (updatingItems.value.has(cartItemId)) return
  
  // Mostrar confirmación personalizada amigable
  const confirmed = await showConfirmDialog(productName)
  if (!confirmed) return
  
  updatingItems.value.add(cartItemId)
  try {
    cartStore.removeFromCart(cartItemId)
    addNotification('Producto eliminado del carrito', 'success')
  } finally {
    updatingItems.value.delete(cartItemId)
  }
}

// Función para mostrar confirmación amigable
const showConfirmDialog = (productName) => {
  return new Promise((resolve) => {
    // Crear modal de confirmación personalizado
    const modal = document.createElement('div')
    modal.className = 'confirm-modal-overlay'
    modal.innerHTML = `
      <div class="confirm-modal">
        <div class="confirm-header">
          <i class="fas fa-trash-alt"></i>
          <h3>Eliminar producto</h3>
        </div>
        <div class="confirm-body">
          <p>¿Confirma que desea remover este producto de su carrito de compras?</p>
          <div class="product-info">
            <i class="fas fa-box"></i>
            <span class="product-name">"${productName}"</span>
          </div>
        </div>
        <div class="confirm-actions">
          <button class="btn-cancel">Mantener en carrito</button>
          <button class="btn-confirm">Sí, remover producto</button>
        </div>
      </div>
    `
    
    // Agregar estilos
    const style = document.createElement('style')
    style.textContent = `
      .confirm-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
      }
      .confirm-modal {
        background: white;
        border-radius: 12px;
        padding: 24px;
        min-width: 320px;
        max-width: 400px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        animation: modalSlideIn 0.3s ease-out;
      }
      @keyframes modalSlideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .confirm-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      .confirm-header i {
        color: #ef4444;
        font-size: 20px;
      }
      .confirm-header h3 {
        margin: 0;
        color: #1f2937;
        font-size: 18px;
        font-weight: 600;
      }
      .confirm-body p {
        margin: 0 0 16px 0;
        color: #6b7280;
        line-height: 1.5;
        font-size: 15px;
      }
      .product-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #f9fafb;
        border-radius: 8px;
        border-left: 4px solid #14b8a6;
      }
      .product-info i {
        color: #14b8a6;
        font-size: 16px;
      }
      .product-name {
        font-weight: 600;
        color: #1f2937;
        font-size: 14px;
      }
      .confirm-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        justify-content: flex-end;
      }
      .confirm-actions button {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-cancel {
        background: #f3f4f6;
        color: #6b7280;
      }
      .btn-cancel:hover {
        background: #e5e7eb;
      }
      .btn-confirm {
        background: #ef4444;
        color: white;
      }
      .btn-confirm:hover {
        background: #dc2626;
      }
    `
    
    document.head.appendChild(style)
    document.body.appendChild(modal)
    
    // Agregar event listeners
    modal.querySelector('.btn-cancel').onclick = () => {
      document.body.removeChild(modal)
      document.head.removeChild(style)
      resolve(false)
    }
    
    modal.querySelector('.btn-confirm').onclick = () => {
      document.body.removeChild(modal)
      document.head.removeChild(style)
      resolve(true)
    }
    
    // Cerrar con overlay
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal)
        document.head.removeChild(style)
        resolve(false)
      }
    }
  })
}

// Funciones de edición
const iniciarEdicion = (item) => {
  itemEditando.value = item.cartItemId
  detallesTemp.value = {
    notas: item.detalles?.notas || ''
  }
}

const cancelarEdicion = () => {
  itemEditando.value = null
  detallesTemp.value = {
    notas: ''
  }
}

const guardarEdicion = (item) => {
  // Solo guardar las notas adicionales, manteniendo el tipo y tamaño originales
  cartStore.updateItemDetails(item.cartItemId, {
    tipo: item.tipo, // Mantener el tipo original
    tamano: item.tamano, // Mantener el tamaño original
    detalles: {
      notas: detallesTemp.value.notas
    }
  })
  cancelarEdicion()
}

const formatPrice = (price) => {
  return `S/${price.toFixed(2)}`
}

// Función para obtener la URL correcta de la imagen
const getImageUrl = (producto) => {
  if (!producto) {
    return createPlaceholderImage()
  }
  
  // Lista de posibles campos de imagen a verificar
  const imageFields = ['imagen', 'imagen_principal', 'image', 'imageUrl']
  
  for (const field of imageFields) {
    if (producto[field]) {
      if (producto[field].startsWith('http')) {
        // Si ya es una URL absoluta, devolverla tal cual
        return producto[field]
      } else {
        // Si es una ruta relativa, construir la URL completa
        const assetBase = getAssetBaseUrl()
        return `${assetBase}${producto[field]}`
      }
    }
  }
  
  // Si no hay imagen, crear un placeholder SVG
  return createPlaceholderImage()
}

// Crear imagen placeholder SVG optimizada
const createPlaceholderImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxNGI4YTYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwZDkyOGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9InVybCgjZykiIHJ4PSI4Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIzMCIgcj0iMTIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPjxwYXRoIGQ9Ik0zMiAzMGwxMiAxNSAxMi0xNXoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNyIvPjx0ZXh0IHg9IjQwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSI2MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5BTFNJTVRFWDwvdGV4dD48cGF0aCBkPSJNMjAgMjBsNDAgNDBNNjAgMjBMMjAgNjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg=='
}

// Función para manejar errores de imagen
const handleImageError = (event) => {
  // Ocultar la imagen con error para mostrar el fallback
  event.target.style.display = 'none'
}

const procederAlPago = () => {
  // Validar carrito antes de proceder
  const validation = cartStore.validateCart()
  if (!validation.valid) {
    // Mostrar errores usando el sistema de notificaciones
    validation.errors.forEach(error => {
      addNotification(error, 'error')
    })
    return
  }

  // Cerrar el carrito y redirigir a checkout
  cartStore.toggleCart()
  router.push('/checkout')
}
</script>

<template>
  <div class="cart-container" :class="{ 'is-open': isCartOpen }" role="dialog" aria-modal="true" aria-labelledby="cart-title">
    <div class="cart-overlay" @click="cartStore.toggleCart"></div>
    
    <div class="cart-panel">
      <div class="cart-header">
        <h2 id="cart-title">
          <i class="fas fa-shopping-cart" aria-hidden="true"></i>
          Carrito de Compras
        </h2>
        <button class="btn-close" @click="cartStore.toggleCart" aria-label="Cerrar carrito">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div v-if="items.length === 0" class="cart-empty">
        <i class="fas fa-shopping-basket"></i>
        <p>Tu carrito está vacío</p>
        <button class="btn-primary" @click="cartStore.toggleCart">
          Continuar Comprando
        </button>
      </div>

      <template v-else>
        <div class="cart-items">
          <div v-for="item in items" 
               :key="item.cartItemId" 
               class="cart-item">
            <div class="item-image">
              <!-- Siempre mostrar fallback de fondo -->
              <div class="image-fallback">
                <i class="fas fa-tshirt"></i>
                <span>ALSIMTEX</span>
              </div>
              <!-- Imagen encima si existe -->
              <img 
                v-if="item.producto?.imagen || item.producto?.imagen_principal"
                :src="getImageUrl(item.producto)" 
                :alt="item.producto.nombre"
                @error="handleImageError"
                loading="lazy"
                class="product-image"
              >
            </div>
            
            <div class="item-details">
              <div class="item-header">
                <h3>{{ item.producto.nombre }}</h3>
                <div class="item-price-header">
                  <span class="price-unit">S/{{ item.precio.toFixed(2) }}/ud</span>
                </div>
              </div>
              
              <!-- Vista normal -->
              <template v-if="itemEditando !== item.cartItemId">
                <div class="item-specs">
                  <span class="spec categoria">
                    <i class="fas fa-tag"></i>
                    {{ item.tipo }}
                  </span>
                  <span v-if="item.tamano" class="spec tamano">
                    <i class="fas fa-ruler"></i>
                    {{ item.tamano }}
                  </span>
                </div>
                
                <div class="item-notes" v-if="item.detalles?.notas">
                  <i class="fas fa-comment-alt"></i>
                  <span>{{ item.detalles.notas }}</span>
                </div>
                
                <div class="item-actions-inline">
                  <button class="btn-edit" @click="iniciarEdicion(item)" title="Editar notas">
                    <i class="fas fa-comment-alt"></i>
                    <span>Notas</span>
                  </button>
                </div>
              </template>
              <!-- Formulario de edición -->
              <template v-else>
                <div class="edit-form">
                  <div class="product-info-fixed">
                    <div class="info-item">
                      <strong>Tipo:</strong> {{ item.tipo }}
                    </div>
                    <div class="info-item" v-if="item.tamano">
                      <strong>Tamaño:</strong> {{ item.tamano }}
                    </div>
                    <small class="info-note">El tipo y tamaño están definidos por el administrador</small>
                  </div>
                  <form @submit.prevent="guardarEdicion(item)">
                    <div class="form-group">
                      <label for="notas">Notas adicionales:</label>
                      <textarea id="notas" v-model="detallesTemp.notas" placeholder="Agrega notas especiales aquí"></textarea>
                    </div>
                    <div class="form-actions">
                      <button type="submit" class="btn-save">
                        <i class="fas fa-check"></i>
                        Guardar
                      </button>
                      <button type="button" class="btn-cancel" @click="cancelarEdicion">
                        <i class="fas fa-times"></i>
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </template>
            </div>

            <div class="item-controls">
              <div class="quantity-controls">
                <button @click="updateQuantityWithFeedback(item.cartItemId, Math.max(1, item.cantidad - 1))" 
                        :disabled="item.cantidad <= 1 || updatingItems.has(item.cartItemId)"
                        :aria-label="`Disminuir cantidad de ${item.producto.nombre}`">
                  <i class="fas fa-minus"></i>
                </button>
                <span aria-label="Cantidad actual" :class="{ 'updating': updatingItems.has(item.cartItemId) }">
                  {{ updatingItems.has(item.cartItemId) ? '...' : item.cantidad }}
                </span>
                <button @click="updateQuantityWithFeedback(item.cartItemId, item.cantidad + 1)"
                        :disabled="updatingItems.has(item.cartItemId) || item.cantidad >= (item.producto?.stock || 0)"
                        :aria-label="`Aumentar cantidad de ${item.producto.nombre}`">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="stock-info" v-if="item.producto?.stock !== undefined">
                <small :class="{ 'stock-low': item.cantidad >= item.producto.stock }">
                  <i class="fas fa-warehouse"></i>
                  Stock: {{ item.producto.stock }}
                  <span v-if="item.cantidad >= item.producto.stock" class="stock-warning">
                    (agotado)
                  </span>
                </small>
              </div>
              <div class="item-price-container">
                <div class="item-price" :class="{ 'has-discount': cartStore.obtenerDescuentoItem(item.cartItemId)?.porcentaje > 0 }">
                  <div v-if="cartStore.obtenerDescuentoItem(item.cartItemId)?.porcentaje > 0" class="precio-original">
                    {{ formatPrice(item.precioTotal) }}
                  </div>
                  <div class="precio-final">
                    {{ formatPrice(cartStore.obtenerDescuentoItem(item.cartItemId)?.precioFinal || item.precioTotal) }}
                  </div>
                  <div v-if="cartStore.obtenerDescuentoItem(item.cartItemId)?.porcentaje > 0" class="discount-badge">
                    -{{ Math.round(cartStore.obtenerDescuentoItem(item.cartItemId).porcentaje) }}%
                  </div>
                </div>
                <button class="btn-remove" @click="removeItemWithFeedback(item.cartItemId, item.producto.nombre)" 
                        :disabled="updatingItems.has(item.cartItemId)"
                        :aria-label="`Eliminar ${item.producto.nombre} del carrito`">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row subtotal">
            <span>Subtotal ({{ totalItems }} items):</span>
            <span class="amount">{{ formatPrice(cartStore.subtotalSinDescuento) }}</span>
          </div>
          <div v-if="cartStore.descuentoTotal > 0" class="summary-row discount">
            <span>Descuento por cantidad:</span>
            <span class="amount discount">-{{ formatPrice(cartStore.descuentoTotal) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span class="amount">{{ formatPrice(total) }}</span>
          </div>
          <div class="discount-info">
            <h4>Descuentos por cantidad:</h4>
            <ul>
              <li><span class="discount-badge">15%</span> en compras de 50+ unidades del mismo producto</li>
              <li><span class="discount-badge">10%</span> en compras de 25-49 unidades del mismo producto</li>
              <li><span class="discount-badge">5%</span> en compras de 10-24 unidades del mismo producto</li>
            </ul>
          </div>
        </div>

        <div class="cart-actions">
          <div class="cart-info">
            <small class="auto-save-indicator">
              <i class="fas fa-save"></i>
              Carrito guardado automáticamente
            </small>
          </div>
          <div class="action-buttons">
            <button class="btn-secondary" @click="cartStore.toggleCart">
              Seguir Comprando
            </button>
            <button class="btn-primary" @click="procederAlPago">
              Proceder al Pago
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  pointer-events: none;
}

.cart-container.is-open {
  pointer-events: all;
}

.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
}

.cart-container.is-open .cart-overlay {
  opacity: 1;
  visibility: visible;
}

.cart-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 500px;
  background: var(--bg-primary);
  box-shadow: var(--shadow-2xl);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform var(--transition-normal);
}

.cart-container.is-open .cart-panel {
  transform: translateX(0);
}

.cart-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-header h2 {
  margin: 0;
  font-size: var(--font-xl);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.cart-header i {
  color: var(--secondary-color);
}

.btn-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 10;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-sm);
}

.btn-close:hover {
  background: var(--bg-secondary);
  color: var(--danger-color);
  transform: scale(1.1);
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
  color: var(--text-tertiary);
  text-align: center;
}

.cart-empty i {
  font-size: 4rem;
  margin-bottom: var(--spacing-xl);
  opacity: 0.5;
}

.cart-empty p {
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-xl);
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xl);
}

.cart-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--spacing-lg);
  animation: slideInRight 0.3s ease-out;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.cart-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
  border-color: var(--secondary-color);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.item-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
              linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
              linear-gradient(-45deg, transparent 75%, #f3f4f6 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
  opacity: 0.1;
  z-index: 1;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all var(--transition-fast);
  position: relative;
  z-index: 2;
}

.item-image:hover img {
  transform: scale(1.05);
}

.image-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  font-weight: 600;
  z-index: 1;
  border-radius: var(--border-radius-lg);
}

.image-fallback i {
  font-size: 20px;
  margin-bottom: 4px;
  opacity: 0.9;
}

.image-fallback span {
  font-size: 8px;
  letter-spacing: 0.5px;
  text-align: center;
}

.product-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
}

.item-image:hover .product-image {
  transform: scale(1.05);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
  min-width: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.item-header h3 {
  margin: 0;
  font-size: var(--font-lg);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.price-unit {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  white-space: nowrap;
}

.item-specs {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.spec {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.spec.categoria {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.2);
}

.spec.tamano {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.item-actions-inline {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.btn-edit {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-xs);
}

.btn-edit:hover {
  color: var(--secondary-color);
  border-color: var(--secondary-color);
  background: rgba(20, 184, 166, 0.05);
  transform: translateY(-1px);
}

.btn-edit span {
  font-size: var(--font-xs);
}

.edit-form {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  margin-top: var(--spacing-sm);
  border: 1px solid var(--border-color);
}

.product-info-fixed {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  border: 1px solid var(--border-color);
}

.info-item {
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-sm);
  color: var(--text-primary);
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-note {
  display: block;
  margin-top: var(--spacing-sm);
  color: var(--text-tertiary);
  font-size: var(--font-xs);
  font-style: italic;
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.form-group select,
.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.select-personalizado {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: white;
  font-size: var(--font-base);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.select-personalizado:hover, .select-personalizado:focus {
  border-color: var(--secondary-color);
  outline: none;
  box-shadow: var(--shadow-sm);
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.btn-save,
.btn-cancel {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.btn-save {
  background: var(--secondary-color);
  color: white;
  border: none;
}

.btn-save:hover {
  background: var(--secondary-dark);
  transform: translateY(-2px);
}

.btn-cancel {
  background: var(--danger-bg);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.btn-cancel:hover {
  background: var(--danger-color);
  color: white;
  transform: translateY(-2px);
}

.item-notes {
  font-size: var(--font-sm);
  color: var(--text-primary);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  background: rgba(255, 248, 220, 0.8);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  border-left: 3px solid #f59e0b;
  margin-top: var(--spacing-xs);
}

.item-notes i {
  color: #f59e0b;
  margin-top: 2px;
  flex-shrink: 0;
}

.item-notes span {
  flex: 1;
  line-height: 1.4;
}

.item-controls {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--spacing-md);
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-lg);
}

.quantity-controls button {
  background: var(--bg-secondary);
  border: none;
  width: 24px;
  height: 24px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.quantity-controls button:hover {
  background: var(--secondary-color);
  color: white;
  transform: scale(1.1);
}

.quantity-controls span {
  min-width: 30px;
  text-align: center;
  font-weight: var(--font-semibold);
}

.item-price-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.stock-info {
  text-align: right;
  margin-top: var(--spacing-xs);
}

.stock-info small {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.stock-info .stock-low {
  color: var(--warning-color);
}

.stock-warning {
  color: var(--danger-color);
  font-weight: var(--font-semibold);
}

.item-price {
  font-weight: var(--font-bold);
  color: var(--secondary-color);
  position: relative;
  text-align: right;
}

.item-price.has-discount .precio-original {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
  text-decoration: line-through;
  margin-bottom: var(--spacing-xs);
}

.precio-final {
  font-size: var(--font-lg);
  color: var(--secondary-color);
}

.discount-badge {
  display: inline-block;
  background: var(--success-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  margin-left: var(--spacing-sm);
}

.summary-row.discount {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}

.summary-row.discount .amount {
  color: var(--success-color);
}

.discount-info {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px dashed var(--border-color);
}

.discount-info h4 {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.discount-info ul {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--font-sm);
}

.discount-info li {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.discount-info .discount-badge {
  font-size: var(--font-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--success-bg);
  color: var(--success-color);
}

.btn-remove {
  background: var(--danger-bg);
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  color: var(--danger-color);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-remove:hover {
  background: var(--danger-color);
  color: white;
  transform: scale(1.1);
}

.cart-summary {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-lg);
}

.summary-row.total {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--secondary-color);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 2px solid var(--border-color);
}

.cart-actions {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.cart-info {
  text-align: center;
}

.auto-save-indicator {
  color: var(--text-tertiary);
  font-size: var(--font-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.auto-save-indicator i {
  color: var(--success-color);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--secondary-color);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--secondary-dark);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--secondary-color);
  color: var(--secondary-color);
}

.btn-secondary:hover {
  background: var(--secondary-color);
  color: white;
  transform: translateY(-2px);
}

.quantity-controls span.updating {
  opacity: 0.6;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.quantity-controls button:disabled,
.btn-remove:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cart-panel {
    max-width: 100%;
  }

  .cart-item {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
  
  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-details {
    grid-column: 2;
    grid-row: 1;
  }
  
  .item-header h3 {
    font-size: var(--font-base);
  }
  
  .price-unit {
    font-size: var(--font-xs);
  }

  .item-controls {
    grid-column: 1 / -1;
    grid-row: 2;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color);
  }
  
  .quantity-controls {
    order: 1;
  }
  
  .item-price-container {
    order: 2;
    align-items: flex-end;
  }

  .cart-actions .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .spec {
    font-size: var(--font-xs);
    padding: 2px var(--spacing-xs);
  }
  
  .btn-edit {
    font-size: var(--font-xs);
    padding: var(--spacing-xs);
  }
}
</style>
