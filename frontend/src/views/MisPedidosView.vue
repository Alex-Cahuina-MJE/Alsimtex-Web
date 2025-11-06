<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { getApiBase } from '../config/api'

const router = useRouter()
const authStore = useAuthStore()

const pedidos = ref([])
const loading = ref(true)
const pedidoDetalle = ref(null)
const detalleAbierto = ref(false)
const apiBase = getApiBase()

onMounted(async () => {
  if (!authStore.isAuthenticated()) {
    router.push('/login')
    return
  }
  await loadPedidos()
})

const capitalizar = (texto) => {
  if (!texto || typeof texto !== 'string') return '—'
  const normalizado = texto.replace(/_/g, ' ').toLowerCase()
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1)
}

const loadPedidos = async () => {
  loading.value = true
  try {
    const userId = authStore.user?.id
    if (!userId) throw new Error('Usuario no identificado')
    
    const resp = await fetch(`${apiBase}/pedidos/usuario/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token && { 'Authorization': `Bearer ${authStore.token}` })
      }
    })
    if (!resp.ok) {
      throw new Error(`Error ${resp.status}: No se pudo cargar pedidos`)
    }
    const data = await resp.json()
    // Mapear para la vista
    pedidos.value = data.map(p => ({
      id: p.id,
      numero: p.numero_pedido,
      fecha: p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleString('es-PE') : '—',
      total: Number(p.total) || 0,
      estado: capitalizar(p.estado),
      items_count: Number(p.total_items) || 0,
      metodo_pago: capitalizar(p.metodo_pago)
    }))
  } catch (error) {
    console.error('Error cargando pedidos:', error)
    pedidos.value = []
  } finally {
    loading.value = false
  }
}

const verDetalle = async (pedido) => {
  detalleAbierto.value = true
  pedidoDetalle.value = null
  try {
    const resp = await fetch(`${apiBase}/pedidos/${pedido.id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token && { 'Authorization': `Bearer ${authStore.token}` })
      }
    })
    if (!resp.ok) throw new Error('No se pudo obtener el detalle del pedido')
    const data = await resp.json()
    pedidoDetalle.value = {
      ...data,
      metodo_pago: capitalizar(data.metodo_pago),
      estado: capitalizar(data.estado),
      fecha_pedido: data.fecha_pedido ? new Date(data.fecha_pedido).toLocaleString('es-PE') : '—',
      items: (data.items || []).map(i => ({
        id: i.id,
        producto_id: i.producto_id,
        nombre: i.producto_nombre || `Producto #${i.producto_id}`,
        imagen: i.imagen_principal || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==',
        cantidad: i.cantidad,
        precio_unitario: Number(i.precio_unitario || 0),
        precio_total: Number(i.precio_total || 0),
        tipo: i.tipo,
        tamano: i.tamano,
        notas: i.notas
      }))
    }
  } catch (err) {
    console.error('Detalle de pedido error:', err)
  }
}

const cerrarDetalle = () => {
  detalleAbierto.value = false
  pedidoDetalle.value = null
}

const getEstadoClass = (estado) => {
  const classes = {
    'Completado': 'estado-completado',
    'Pendiente': 'estado-pendiente',
    'En proceso': 'estado-proceso',
    'Cancelado': 'estado-cancelado'
  }
  return classes[estado] || ''
}
</script>

<template>
  <div class="mis-pedidos-page">
    <div class="container">
      <div class="header">
        <h1 class="page-title">Mis Pedidos</h1>
        <p class="subtitle">Revisa el estado y detalle de tus compras</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando tus pedidos...</p>
      </div>

      <div v-else-if="pedidos.length === 0" class="empty-state">
        <i class="fas fa-shopping-bag"></i>
        <p>Aún no has realizado ningún pedido</p>
        <router-link to="/productos" class="btn-primary">
          <i class="fas fa-shopping-cart"></i>
          Ir a Productos
        </router-link>
      </div>

      <div v-else class="pedidos-grid">
        <div v-for="pedido in pedidos" :key="pedido.id" class="pedido-card">
          <div class="card-header">
            <div class="pedido-numero">
              <span class="label">Pedido</span>
              <span class="numero">#{{ pedido.id }}</span>
            </div>
            <span class="estado-badge" :class="getEstadoClass(pedido.estado)">
              {{ pedido.estado }}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <i class="fas fa-calendar"></i>
              <span>{{ pedido.fecha }}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-credit-card"></i>
              <span>{{ pedido.metodo_pago }}</span>
            </div>
            <div class="info-row">
              <i class="fas fa-box"></i>
              <span>{{ pedido.items_count }} producto{{ pedido.items_count !== 1 ? 's' : '' }}</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="total">
              <span>Total:</span>
              <span class="monto">S/. {{ pedido.total.toFixed(2) }}</span>
            </div>
            <button class="btn-detalle" @click="verDetalle(pedido)">
              <i class="fas fa-eye"></i>
              Ver Detalle
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Detalle -->
      <div v-if="detalleAbierto && pedidoDetalle" class="modal-overlay" @click.self="cerrarDetalle">
        <div class="modal-content">
          <button class="modal-close" @click="cerrarDetalle">×</button>
          
          <div class="detalle-header">
            <div>
              <h2>Pedido #{{ pedidoDetalle.id }}</h2>
              <p class="numero-pedido">{{ pedidoDetalle.numero_pedido }}</p>
              <p class="fecha">{{ pedidoDetalle.fecha_pedido }}</p>
            </div>
            <span class="estado-chip" :class="getEstadoClass(pedidoDetalle.estado)">
              {{ pedidoDetalle.estado }}
            </span>
          </div>

          <div class="detalle-grid">
            <!-- Envío -->
            <div class="card">
              <h3><i class="fas fa-shipping-fast"></i> Dirección de Envío</h3>
              <p>{{ pedidoDetalle.direccion_envio?.direccion || '—' }}</p>
              <p>{{ pedidoDetalle.direccion_envio?.ciudad || '—' }}, {{ pedidoDetalle.direccion_envio?.provincia || '—' }}</p>
              <p v-if="pedidoDetalle.direccion_envio?.codigoPostal">CP: {{ pedidoDetalle.direccion_envio.codigoPostal }}</p>
              <p v-if="pedidoDetalle.direccion_envio?.referencia" class="referencia">
                <i class="fas fa-map-marker-alt"></i> {{ pedidoDetalle.direccion_envio.referencia }}
              </p>
            </div>

            <!-- Resumen -->
            <div class="card resumen">
              <h3><i class="fas fa-receipt"></i> Resumen</h3>
              <div class="resumen-row">
                <span>Método de pago</span>
                <span>{{ pedidoDetalle.metodo_pago }}</span>
              </div>
              <div class="resumen-row">
                <span>Subtotal</span>
                <span>S/. {{ Number(pedidoDetalle.subtotal || 0).toFixed(2) }}</span>
              </div>
              <div class="resumen-row">
                <span>Descuento</span>
                <span>- S/. {{ Number(pedidoDetalle.descuento || 0).toFixed(2) }}</span>
              </div>
              <div class="resumen-row">
                <span>Envío</span>
                <span>{{ Number(pedidoDetalle.costo_envio || 0) === 0 ? 'GRATIS' : 'S/. ' + Number(pedidoDetalle.costo_envio).toFixed(2) }}</span>
              </div>
              <div class="resumen-row total">
                <span>Total</span>
                <span>S/. {{ Number(pedidoDetalle.total || 0).toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="card items">
            <h3><i class="fas fa-shopping-bag"></i> Productos</h3>
            <div class="items-list">
              <div class="item" v-for="it in pedidoDetalle.items" :key="it.id">
                <img :src="it.imagen" :alt="it.nombre" @error="$event.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
                <div class="item-info">
                  <h4>{{ it.nombre }}</h4>
                  <p class="muted">
                    {{ it.tipo }}<span v-if="it.tamano"> • {{ it.tamano }}</span> • Cantidad: {{ it.cantidad }}
                  </p>
                  <p v-if="it.notas" class="notas"><i class="fas fa-comment"></i> {{ it.notas }}</p>
                </div>
                <div class="item-price">
                  <div class="unit">S/. {{ it.precio_unitario.toFixed(2) }} c/u</div>
                  <div class="total">S/. {{ it.precio_total.toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" @click="cerrarDetalle">
              <i class="fas fa-times"></i>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mis-pedidos-page {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: calc(80px + var(--spacing-3xl)) 0 var(--spacing-4xl);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

.header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  color: var(--text-secondary);
  font-size: var(--font-lg);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
  gap: var(--spacing-xl);
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

.empty-state i {
  font-size: 5rem;
  color: var(--text-tertiary);
  opacity: 0.5;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: var(--font-xl);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-2xl);
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.pedidos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--spacing-2xl);
}

.pedido-card {
  background: var(--bg-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
}

.pedido-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--secondary-color);
}

.card-header {
  padding: var(--spacing-xl);
  background: var(--gradient-primary);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pedido-numero {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.pedido-numero .label {
  font-size: var(--font-sm);
  opacity: 0.9;
}

.pedido-numero .numero {
  font-size: var(--font-2xl);
  font-weight: var(--font-extrabold);
}

.estado-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-completado {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.estado-pendiente {
  background: rgba(234, 179, 8, 0.2);
  color: #eab308;
}

.estado-proceso {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.estado-cancelado {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.card-body {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.info-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-base);
}

.info-row i {
  width: 20px;
  color: var(--secondary-color);
}

.card-footer {
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
}

.total {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.total span:first-child {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
}

.total .monto {
  font-size: var(--font-xl);
  font-weight: var(--font-extrabold);
  color: var(--secondary-color);
}

.btn-detalle {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-detalle:hover {
  background: var(--secondary-dark);
  transform: scale(1.05);
}

/* Modal Detalle */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-2xl);
  width: min(900px, 95%);
  max-height: 90vh;
  overflow: auto;
  position: relative;
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-2xl);
  animation: slideInBottom 0.4s ease-out;
}

@keyframes slideInBottom {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--bg-secondary);
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.modal-close:hover {
  background: var(--danger-bg);
  color: var(--danger-color);
  transform: rotate(90deg);
}

.detalle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-color);
}

.detalle-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-2xl);
}

.numero-pedido {
  color: var(--text-tertiary);
  font-size: var(--font-sm);
  margin: var(--spacing-xs) 0 0;
}

.fecha {
  color: var(--text-secondary);
  font-size: var(--font-base);
  margin: var(--spacing-xs) 0 0;
}

.estado-chip {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detalle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.card {
  background: var(--bg-secondary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
}

.card h3 {
  margin: 0 0 var(--spacing-md);
  color: var(--secondary-color);
  font-size: var(--font-lg);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card p {
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
  line-height: 1.6;
}

.card .referencia {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px dashed var(--border-color);
  font-style: italic;
  color: var(--text-tertiary);
  display: flex;
  align-items: start;
  gap: var(--spacing-sm);
}

.card.resumen .resumen-row {
  display: flex;
  justify-content: space-between;
  padding: .5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.card.resumen .resumen-row.total {
  font-weight: var(--font-bold);
  font-size: var(--font-lg);
  color: var(--secondary-color);
  border-bottom: none;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--secondary-color);
}

.card.items {
  grid-column: 1 / -1;
}

.card.items .items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.card.items .item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: var(--spacing-md);
  align-items: center;
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.card.items .item:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
}

.card.items img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.item-info h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-base);
}

.item-info .muted {
  color: var(--text-tertiary);
  font-size: var(--font-sm);
  margin-top: var(--spacing-xs);
}

.item-info .notas {
  margin-top: .5rem;
  font-size: var(--font-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  border-left: 3px solid var(--secondary-color);
  display: flex;
  align-items: start;
  gap: var(--spacing-xs);
}

.item-price {
  text-align: right;
}

.item-price .unit {
  color: var(--text-tertiary);
  font-size: var(--font-sm);
}

.item-price .total {
  font-weight: var(--font-bold);
  color: var(--secondary-color);
  font-size: var(--font-lg);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.btn-secondary {
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-secondary:hover {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
  transform: translateY(-2px);
}

@media (max-width: 920px) {
  .detalle-grid {
    grid-template-columns: 1fr;
  }

  .card.items .item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .card.items img {
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .pedidos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
