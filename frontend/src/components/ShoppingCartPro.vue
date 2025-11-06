<template>
  <Teleport to="body">
    <!-- Overlay del carrito -->
    <Transition name="cart-overlay">
      <div 
        v-if="isCartOpen" 
        class="cart-overlay" 
        @click="cartStore.toggleCart"
      ></div>
    </Transition>

    <!-- Panel principal del carrito -->
    <Transition name="cart-panel">
      <aside 
        v-if="isCartOpen"
        class="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <!-- Header del carrito -->
        <header class="cart-header">
          <div class="cart-title-section">
            <h2 id="cart-title" class="cart-title">
              <i class="fas fa-shopping-bag"></i>
              Carrito de Compras
            </h2>
            <div class="cart-count-badge">{{ totalItems }}</div>
          </div>
          <button 
            class="cart-close-btn"
            @click="cartStore.toggleCart"
            aria-label="Cerrar carrito"
          >
            <i class="fas fa-times"></i>
          </button>
        </header>

        <!-- Contenido del carrito -->
        <div class="cart-content">
          <!-- Estado vacío -->
          <div v-if="items.length === 0" class="cart-empty-state">
            <div class="empty-illustration">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h3>Tu carrito está vacío</h3>
            <p>Agrega productos para comenzar tu compra</p>
            <button 
              class="btn-continue-shopping"
              @click="cartStore.toggleCart"
            >
              <i class="fas fa-arrow-left"></i>
              Continuar Comprando
            </button>
          </div>

          <!-- Lista de productos -->
          <div v-else class="cart-items-container">
            <div class="cart-items-list">
              <TransitionGroup name="cart-item" tag="div">
                <article
                  v-for="item in items"
                  :key="item.cartItemId"
                  class="cart-item"
                  :class="{ 'updating': updatingItems.has(item.cartItemId) }"
                >
                  <!-- Imagen del producto -->
                  <div class="item-image-container">
                    <img 
                      :src="getImageUrl(item)" 
                      :alt="item.producto.nombre"
                      class="item-image"
                      loading="lazy"
                    >
                    <div v-if="item.descuento" class="item-discount-badge">
                      -{{ item.descuento }}%
                    </div>
                    <!-- Sistema simplificado -->
                  </div>

                  <!-- Información del producto -->
                  <div class="item-info">
                    <div class="item-main-info">
                      <h3 class="item-name">{{ item.producto.nombre }}</h3>
                      <button 
                        class="item-remove-btn"
                        @click="removeItemWithConfirmation(item.cartItemId)"
                        :disabled="updatingItems.has(item.cartItemId)"
                        aria-label="Eliminar producto"
                      >
                        <i class="fas fa-trash-alt"></i>
                      </button>
                    </div>

                    <!-- Especificaciones del producto -->
                    <div class="item-specifications">
                      <span v-if="item.tipo" class="spec-item">
                        <i class="fas fa-tag"></i>
                        {{ item.tipo }}
                      </span>
                      <span v-if="item.tamano" class="spec-item">
                        <i class="fas fa-ruler"></i>
                        {{ item.tamano }}
                      </span>
                      <span v-if="item.detalles?.notas" class="spec-item">
                        <i class="fas fa-sticky-note"></i>
                        {{ item.detalles.notas }}
                      </span>
                    </div>

                    <!-- Precio y controles de cantidad -->
                    <div class="item-bottom-section">
                      <div class="item-pricing">
                        <div v-if="item.precioOriginal && item.precioOriginal !== getItemUnitPrice(item)" class="price-comparison">
                          <span class="price-original">{{ formatPrice(item.precioOriginal) }}</span>
                          <span class="price-current">{{ formatPrice(getItemUnitPrice(item)) }}</span>
                        </div>
                        <div v-else class="price-single">
                          <span class="price-current">{{ formatPrice(getItemUnitPrice(item)) }}</span>
                        </div>
                      </div>

                      <!-- Controles de cantidad -->
                      <div class="quantity-controls">
                        <button 
                          class="quantity-btn decrease"
                          @click="updateQuantityWithFeedback(item.cartItemId, item.cantidad - 1)"
                          :disabled="item.cantidad <= 1 || updatingItems.has(item.cartItemId)"
                          aria-label="Disminuir cantidad"
                        >
                          <i class="fas fa-minus"></i>
                        </button>
                        
                        <div class="quantity-display">
                          <span class="quantity-number">{{ item.cantidad }}</span>
                          <div v-if="updatingItems.has(item.cartItemId)" class="quantity-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                          </div>
                        </div>
                        
                        <button 
                          class="quantity-btn increase"
                          @click="updateQuantityWithFeedback(item.cartItemId, item.cantidad + 1)"
                          :disabled="updatingItems.has(item.cartItemId) || (item.producto.stock && item.cantidad >= item.producto.stock)"
                          aria-label="Aumentar cantidad"
                        >
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Stock warning -->
                    <div v-if="item.producto.stock && item.cantidad >= item.producto.stock" class="stock-warning">
                      <i class="fas fa-exclamation-triangle"></i>
                      Stock limitado ({{ item.producto.stock }} disponibles)
                    </div>
                  </div>
                </article>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Footer del carrito con resumen y checkout -->
        <footer v-if="items.length > 0" class="cart-footer">
          <!-- Resumen de precios -->
          <div class="cart-summary">
            <div class="summary-row">
              <span class="summary-label">Subtotal ({{ totalItems }} productos)</span>
              <span class="summary-value">{{ formatPrice(subtotal) }}</span>
            </div>
            
            <div v-if="totalDiscount > 0" class="summary-row discount">
              <span class="summary-label">
                <i class="fas fa-percentage"></i>
                Descuentos
              </span>
              <span class="summary-value">-{{ formatPrice(totalDiscount) }}</span>
            </div>

            <div class="summary-divider"></div>
            
            <div class="summary-row total">
              <span class="summary-label">Total</span>
              <span class="summary-value">{{ formatPrice(total) }}</span>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="cart-actions">
            <button 
              class="btn-continue-shopping secondary"
              @click="cartStore.toggleCart"
            >
              <i class="fas fa-arrow-left"></i>
              Seguir Comprando
            </button>
            
            <button 
              class="btn-checkout primary"
              @click="procederAlPago"
              :disabled="!canCheckout"
            >
              <i class="fas fa-credit-card"></i>
              Proceder al Pago
              <span class="checkout-amount">{{ formatPrice(total) }}</span>
            </button>
          </div>

          <!-- Información adicional -->
          <div class="cart-additional-info">
            <div class="security-badge">
              <i class="fas fa-shield-alt"></i>
              <span>Compra 100% segura</span>
            </div>
            <div class="shipping-info">
              <i class="fas fa-truck"></i>
              <span>Envío gratuito en pedidos mayores a S/100</span>
            </div>
          </div>
        </footer>
      </aside>
    </Transition>

    <!-- Modal de confirmación para eliminar producto -->
    <ConfirmModal
      v-model:show="showRemoveModal"
      title="Eliminar Producto"
      :message="`¿Estás seguro de que quieres eliminar &quot;${itemToRemove?.producto?.nombre || 'este producto'}&quot; del carrito?`"
      confirm-text="Sí, eliminar"
      cancel-text="Cancelar"
      type="warning"
      @confirm="confirmRemoveItem"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { storeToRefs } from 'pinia'
import { useNotifications } from '../composables/useNotifications'
import { getAssetBaseUrl } from '../config/api'
import ConfirmModal from './ConfirmModal.vue'

const router = useRouter()
const cartStore = useCartStore()
const { addNotification } = useNotifications()
const { items, isCartOpen, totalItems, subtotal, total } = storeToRefs(cartStore)

// Estado para operaciones en progreso
const updatingItems = ref(new Set())
const showRemoveModal = ref(false)
const itemToRemove = ref(null)

// Computed properties
const totalDiscount = computed(() => {
  return items.value.reduce((total, item) => {
    const unitPrice = getItemUnitPrice(item)
    if (item.precioOriginal && item.precioOriginal > unitPrice) {
      return total + ((item.precioOriginal - unitPrice) * item.cantidad)
    }
    return total
  }, 0)
})

const canCheckout = computed(() => {
  return items.value.length > 0 && updatingItems.value.size === 0
})

// Funciones auxiliares
const formatPrice = (price) => {
  const numPrice = parseFloat(price) || 0
  return `S/${numPrice.toFixed(2)}`
}

const safeToFixed = (value, decimals = 2) => {
  const numValue = parseFloat(value) || 0
  return numValue.toFixed(decimals)
}

const getItemUnitPrice = (item) => {
  if (!item) return 0
  
  // Si tiene precio definido directamente, usarlo
  if (item.precio && item.precio > 0) {
    return parseFloat(item.precio)
  }
  
  // Si tiene precioTotal y cantidad, calcular precio unitario
  if (item.precioTotal && item.cantidad && item.cantidad > 0) {
    return parseFloat(item.precioTotal) / parseInt(item.cantidad)
  }
  
  // Si tiene precio del producto, usarlo
  if (item.producto && item.producto.precio) {
    return parseFloat(item.producto.precio)
  }
  
  return 0
}

const getImageUrl = (item) => {
  console.log('🖼️ getImageUrl llamado para item:', item.producto?.nombre)
  
  if (!item || !item.producto) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBkeT0iLjNlbSI+SW1hZ2VuPC90ZXh0Pjwvc3ZnPg=='
  }
  
  const producto = item.producto
  
  console.log('✅ Usando imagen_principal:', producto.imagen_principal)
  
  // 2. Priorizar imagen_principal (productos locales/nuevos)
  if (producto.imagen_principal) {
    if (producto.imagen_principal.startsWith('http')) {
      return producto.imagen_principal
    } else {
      const assetBase = getAssetBaseUrl()
      const imagePath = producto.imagen_principal.startsWith('/') 
        ? producto.imagen_principal 
        : `/${producto.imagen_principal}`
      return `${assetBase}${imagePath}`
    }
  }
  
  // 2. Si no hay imagen_principal, buscar en imagenes array
  if (producto.imagenes && Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
    const primeraImagen = producto.imagenes[0]
    if (primeraImagen.startsWith('http')) {
      return primeraImagen
    } else {
      const assetBase = getAssetBaseUrl()
      const imagePath = primeraImagen.startsWith('/') 
        ? primeraImagen 
        : `/${primeraImagen}`
      return `${assetBase}${imagePath}`
    }
  }
  
  // 3. NUEVO: Si no hay imagen_principal ni imagenes, buscar en 'imagen' (productos de BD)
  if (producto.imagen) {
    // Si ya es una URL completa, devolverla tal cual
    if (producto.imagen.startsWith('http')) {
      return producto.imagen
    } else {
      const assetBase = getAssetBaseUrl()
      const imagePath = producto.imagen.startsWith('/') 
        ? producto.imagen 
        : `/${producto.imagen}`
      return `${assetBase}${imagePath}`
    }
  }
  
  // 4. Imagen por defecto si no hay ninguna
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBkeT0iLjNlbSI+U2luIEltYWdlbjwvdGV4dD48L3N2Zz4='
}

const updateQuantityWithFeedback = async (cartItemId, newQuantity) => {
  if (updatingItems.value.has(cartItemId) || newQuantity < 1) return
  
  updatingItems.value.add(cartItemId)
  try {
    await new Promise(resolve => setTimeout(resolve, 300)) // Feedback visual
    cartStore.updateQuantity(cartItemId, newQuantity)
    
    // Vibración táctil si está disponible
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  } finally {
    updatingItems.value.delete(cartItemId)
  }
}

const removeItemWithConfirmation = (cartItemId) => {
  const item = items.value.find(i => i.cartItemId === cartItemId)
  if (!item) return

  itemToRemove.value = item
  showRemoveModal.value = true
}

const confirmRemoveItem = () => {
  if (!itemToRemove.value) return
  
  cartStore.removeFromCart(itemToRemove.value.cartItemId)
  addNotification('Producto eliminado del carrito', 'success')
  
  // Vibración táctil
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100])
  }
  
  itemToRemove.value = null
}

const procederAlPago = () => {
  const validation = cartStore.validateCart()
  if (!validation.valid) {
    validation.errors.forEach(error => {
      addNotification(error, 'error')
    })
    return
  }

  cartStore.toggleCart()
  router.push('/checkout')
}
</script>

<style scoped>
/* ===== TRANSICIONES ===== */
.cart-overlay-enter-active,
.cart-overlay-leave-active {
  transition: all 0.3s ease;
}

.cart-overlay-enter-from,
.cart-overlay-leave-to {
  opacity: 0;
}

.cart-panel-enter-active,
.cart-panel-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.cart-panel-enter-from,
.cart-panel-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.cart-item-move {
  transition: transform 0.3s ease;
}

/* ===== OVERLAY ===== */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9998;
}

/* ===== PANEL PRINCIPAL ===== */
.cart-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  height: 100vh;
  background: white;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.2);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== HEADER ===== */
.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-lg);
}

.cart-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cart-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cart-title i {
  font-size: 1.1rem;
}

.cart-count-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cart-close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* ===== CONTENIDO ===== */
.cart-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== ESTADO VACÍO ===== */
.cart-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-illustration {
  margin-bottom: 1.5rem;
}

.empty-illustration i {
  font-size: 4rem;
  color: #d1d5db;
}

.cart-empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #374151;
}

.cart-empty-state p {
  margin: 0 0 2rem 0;
  color: #6b7280;
}

/* ===== LISTA DE PRODUCTOS ===== */
.cart-items-container {
  flex: 1;
  overflow: hidden;
}

.cart-items-list {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db #f9fafb;
}

.cart-items-list::-webkit-scrollbar {
  width: 6px;
}

.cart-items-list::-webkit-scrollbar-track {
  background: #f9fafb;
}

.cart-items-list::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

/* ===== ITEM DEL CARRITO ===== */
.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.cart-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cart-item.updating {
  opacity: 0.7;
  pointer-events: none;
}

.cart-item.updating::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  z-index: 1;
}

/* ===== IMAGEN DEL PRODUCTO ===== */
.item-image-container {
  position: relative;
  flex-shrink: 0;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  background: #f9fafb;
}

.item-discount-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  line-height: 1;
}

/* ===== INFORMACIÓN DEL PRODUCTO ===== */
.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-main-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  flex: 1;
  padding-right: 0.5rem;
}

.item-remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.item-remove-btn:hover {
  background: #fef2f2;
  transform: scale(1.1);
}

.item-remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== ESPECIFICACIONES ===== */
.item-specifications {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.spec-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
}

.spec-item i {
  font-size: 0.7rem;
}

/* ===== SECCIÓN INFERIOR ===== */
.item-bottom-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

/* ===== PRECIOS ===== */
.item-pricing {
  flex: 1;
}

.price-comparison {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.price-original {
  font-size: 0.75rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.price-current {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color);
}

.price-single .price-current {
  color: var(--text-primary);
}

/* ===== CONTROLES DE CANTIDAD ===== */
.quantity-controls {
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.quantity-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e7eb;
  color: #374151;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-display {
  position: relative;
  padding: 0.5rem 0.75rem;
  background: white;
  border-left: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  min-width: 3rem;
  text-align: center;
}

.quantity-number {
  font-weight: 600;
  color: #111827;
}

.quantity-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #6366f1;
}

/* ===== ADVERTENCIA DE STOCK ===== */
.stock-warning {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f59e0b;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #fef3c7;
  border-radius: 6px;
}

/* ===== FOOTER ===== */
.cart-footer {
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  padding: 1.5rem;
}

/* ===== RESUMEN ===== */
.cart-summary {
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.summary-row.discount {
  color: var(--success-color);
}

.summary-row.total {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.summary-value {
  font-weight: 500;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
}

/* ===== ACCIONES ===== */
.cart-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn-continue-shopping {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
}

.btn-continue-shopping:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.btn-checkout {
  flex: 2;
  padding: 0.75rem 1rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  position: relative;
}

.btn-checkout:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-glow);
}

.btn-checkout:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.checkout-amount {
  margin-left: auto;
  font-weight: 700;
}

/* ===== INFORMACIÓN ADICIONAL ===== */
.cart-additional-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.security-badge,
.shipping-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.security-badge i {
  color: #059669;
}

.shipping-info i {
  color: #3b82f6;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .cart-panel {
    width: 100vw;
    right: 0;
  }
  
  .cart-header {
    padding: 1rem;
  }
  
  .cart-title {
    font-size: 1.1rem;
  }
  
  .cart-items-list {
    padding: 0.75rem;
  }
  
  .cart-item {
    padding: 0.75rem;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
  }
  
  .cart-actions {
    flex-direction: column;
  }
  
  .btn-checkout .checkout-amount {
    margin-left: 0.5rem;
  }
}

@media (max-width: 480px) {
  .cart-footer {
    padding: 1rem;
  }
  
  .item-bottom-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .quantity-controls {
    align-self: flex-end;
  }
}

/* Indicador de diseño seleccionado */
.design-indicator {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(17, 24, 39, 0.9);
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  line-height: 1;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .design-indicator {
    font-size: 0.6rem;
    padding: 1px 4px;
    bottom: 2px;
    left: 2px;
  }
}
</style>