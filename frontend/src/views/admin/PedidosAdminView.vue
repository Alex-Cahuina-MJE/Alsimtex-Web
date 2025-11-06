<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import AdminLayout from '../../components/AdminLayout.vue'
import { getApiBase, getAssetBaseUrl } from '../../config/api'
import { empresaConfig } from '../../config/empresa'

const router = useRouter()
const authStore = useAuthStore()

const pedidos = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedEstado = ref('all')
const selectedMetodoPago = ref('all')
const startDate = ref('')
const endDate = ref('')
const detalleAbierto = ref(false)
const pedidoDetalle = ref(null)
const detalleLoading = ref(false)

onMounted(async () => {
  if (!authStore.isAdmin()) {
    router.push('/')
    return
  }
  
  await loadPedidos()
})

const apiBase = getApiBase()

const capitalizar = (texto) => {
  if (!texto || typeof texto !== 'string') return '—'
  // Normalizar estados como 'pendiente' -> 'Pendiente', 'en_proceso' -> 'En proceso'
  const normalizado = texto.replace(/_/g, ' ').toLowerCase()
  return normalizado.charAt(0).toUpperCase() + normalizado.slice(1)
}

const loadPedidos = async () => {
  loading.value = true
  try {
    const resp = await fetch(`${apiBase}/pedidos`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token && { 'Authorization': `Bearer ${authStore.token}` })
      }
    })
    if (!resp.ok) {
      throw new Error(`Error ${resp.status}: No se pudo cargar pedidos`)
    }
    const data = await resp.json()
    // Mapear a modelo para la tabla
    pedidos.value = data.map(p => ({
      id: p.id,
      numero: p.numero_pedido,
      cliente: p.datos_cliente?.nombre || '—',
      email: p.datos_cliente?.email || '—',
      telefono: p.datos_cliente?.telefono || '—',
      productos: p.items_detalle || [],
      total_items: Number(p.total_items) || 0,
      total: Number(p.total) || 0,
      fecha: p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleString('es-PE') : '—',
      fecha_pedido_raw: p.fecha_pedido,
      metodo_pago: capitalizar(p.metodo_pago),
      estado: capitalizar(p.estado),
      documento_pago: p.documento_pago || null,
      tipo_entrega: capitalizar(p.tipo_entrega || 'envio'),
      direccion_envio: p.direccion_envio
    }))
  } catch (error) {
    console.error('Error cargando pedidos:', error)
    pedidos.value = []
  } finally {
    loading.value = false
  }
}

const pedidosFiltrados = computed(() => {
  let filtered = pedidos.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.cliente.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.id.toString().includes(query)
    )
  }

  if (selectedEstado.value !== 'all') {
    filtered = filtered.filter(p => p.estado.toLowerCase() === selectedEstado.value.toLowerCase())
  }

  if (selectedMetodoPago.value !== 'all') {
    filtered = filtered.filter(p => p.metodo_pago.toLowerCase() === selectedMetodoPago.value.toLowerCase())
  }

  if (startDate.value) {
    const start = new Date(startDate.value)
    start.setHours(0, 0, 0, 0)
    filtered = filtered.filter(p => {
      const fechaPedido = new Date(p.fecha_pedido_raw)
      return fechaPedido >= start
    })
  }

  if (endDate.value) {
    const end = new Date(endDate.value)
    end.setHours(23, 59, 59, 999)
    filtered = filtered.filter(p => {
      const fechaPedido = new Date(p.fecha_pedido_raw)
      return fechaPedido <= end
    })
  }

  return filtered
})

const totalVentas = computed(() => {
  return pedidosFiltrados.value.reduce((sum, p) => sum + p.total, 0)
})

const getEstadoClass = (estado) => {
  const classes = {
    'Completado': 'estado-completado',
    'Pendiente': 'estado-pendiente',
    'En proceso': 'estado-proceso',
    'Cancelado': 'estado-cancelado'
  }
  return classes[estado] || ''
}

const cambiarEstado = async (pedido) => {
  const estados = ['Pendiente', 'En proceso', 'Completado', 'Cancelado']
  const currentIndex = estados.indexOf(pedido.estado)
  const nextIndex = (currentIndex + 1) % estados.length
  const nuevoEstado = estados[nextIndex]

  const anterior = pedido.estado
  pedido.estado = nuevoEstado

  try {
    const resp = await fetch(`${apiBase}/pedidos/${pedido.id}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(authStore.token && { 'Authorization': `Bearer ${authStore.token}` })
      },
      body: JSON.stringify({ estado: nuevoEstado })
    })
    if (!resp.ok) {
      throw new Error('No se pudo actualizar el estado')
    }
  } catch (error) {
    console.error('Error cambiando estado:', error)
    // revertir visualmente si falla
    pedido.estado = anterior
  }
}

const verDetalle = async (pedido) => {
  detalleLoading.value = true
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
    // Normalizar algunos campos para mostrar
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
  } finally {
    detalleLoading.value = false
  }
}

const cerrarDetalle = () => {
  detalleAbierto.value = false
  pedidoDetalle.value = null
}

const imprimirPedido = () => {
  window.print()
}

const verComprobante = (rutaComprobante) => {
  if (!rutaComprobante) return
  // Construir la URL correcta: el backend sirve desde /uploads, no /api/uploads
  const baseUrl = apiBase.replace('/api', '') // Quitar /api del final
  const url = `${baseUrl}${rutaComprobante}`
  window.open(url, '_blank', 'width=800,height=600')
}

// Función auxiliar para obtener la URL completa de las imágenes
const getProductImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una ruta relativa, construir la URL completa
  return `${getAssetBaseUrl()}${imagePath}`;
}

const sendWhatsApp = async (pedido) => {
  const phone = pedido.telefono;
  if (!phone) {
    alert('El cliente no tiene un número de teléfono registrado.');
    return;
  }

  // Crear mensaje profesional con detalles del pedido
  let message = `🏢 *ALSIMTEX - Confirmación de Pedido*\n\n`;
  message += `Estimado(a) ${pedido.cliente},\n\n`;
  message += `Nos complace confirmar que hemos recibido su pedido:\n\n`;
  message += `📋 *Detalles del Pedido:*\n`;
  message += `• Número de pedido: #${pedido.id}\n`;
  message += `• Fecha: ${new Date(pedido.fecha_pedido).toLocaleDateString('es-PE')}\n`;
  message += `• Estado: ${pedido.estado}\n`;
  message += `• Método de pago: ${pedido.metodo_pago}\n\n`;

  // Agregar productos al mensaje con imágenes
  if (pedido.productos && pedido.productos.length > 0) {
    message += `🛍️ *Productos solicitados:*\n\n`;
    
    for (let i = 0; i < pedido.productos.length; i++) {
      const item = pedido.productos[i];
      message += `*${i + 1}. ${item.producto_nombre}*\n`;
      message += `📦 Cantidad: ${item.cantidad} unidades\n`;
      
      if (item.precio_unitario) {
        message += `💲 Precio unitario: S/. ${parseFloat(item.precio_unitario).toFixed(2)}\n`;
      }
      if (item.subtotal) {
        message += `💰 Subtotal: S/. ${parseFloat(item.subtotal).toFixed(2)}\n`;
      }

      // Agregar imagen del producto si está disponible
      const imageUrl = getProductImageUrl(item.imagen_principal);
      if (imageUrl && !imageUrl.includes('placeholder')) {
        message += `🖼️ Imagen: ${imageUrl}\n`;
      }
      
      message += `\n`;
    }
  }

  // Agregar total y datos de entrega
  message += `💰 *TOTAL DEL PEDIDO: S/. ${pedido.total.toFixed(2)}*\n`;
  message += `📦 Total de artículos: ${pedido.total_items}\n\n`;
  
  if (pedido.direccion_entrega) {
    message += `📍 *Dirección de entrega:*\n${pedido.direccion_entrega}\n\n`;
  }
  
  if (pedido.tipo_entrega) {
    message += `🚚 *Tipo de entrega:* ${pedido.tipo_entrega}\n\n`;
  }

  message += `🤝 Nos pondremos en contacto con usted para coordinar los detalles de entrega y cualquier información adicional que pueda necesitar.\n\n`;
  message += `✨ *¡Gracias por confiar en ${empresaConfig.nombre}!*\n\n`;
  message += `📞 Para consultas adicionales, no dude en contactarnos\n`;
  message += `🌐 Sitio web: ${empresaConfig.web?.url || 'www.alsimtex.com'}\n`;
  message += `⏰ Horario de atención: ${empresaConfig.horarios?.lunesViernes || 'Lunes a Viernes 8:00 AM - 6:00 PM'}`;

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
}
</script>

<template>
  <AdminLayout>
    <div class="container">
      <div class="header">
        <div>
          <h1 class="page-title">Gestión de Pedidos</h1>
          <p class="subtitle">Administra los pedidos de los clientes</p>
        </div>
      </div>

      <!-- Filtros y Búsqueda Mejorados -->
      <div class="filters-section">
        <!-- Barra de búsqueda principal -->
        <div class="main-search">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Buscar por ID, nombre del cliente o email..."
              class="search-input"
            >
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Filtros organizados -->
        <div class="filters-grid">
          <div class="filter-card">
            <label class="filter-label">
              <i class="fas fa-list-alt"></i>
              Estado
            </label>
            <select v-model="selectedEstado" class="filter-select">
              <option value="all">📋 Todos los estados</option>
              <option value="Pendiente">⏳ Pendiente</option>
              <option value="En proceso">🔄 En proceso</option>
              <option value="Completado">✅ Completado</option>
              <option value="Cancelado">❌ Cancelado</option>
            </select>
          </div>

          <div class="filter-card">
            <label class="filter-label">
              <i class="fas fa-credit-card"></i>
              Método de pago
            </label>
            <select v-model="selectedMetodoPago" class="filter-select">
              <option value="all">💳 Todos los métodos</option>
              <option value="yape">📱 Yape</option>
              <option value="plin">💚 Plin</option>
              <option value="transferencia">🏦 Transferencia</option>
            </select>
          </div>

          <div class="filter-card">
            <label class="filter-label">
              <i class="fas fa-calendar-alt"></i>
              Fecha desde
            </label>
            <input type="date" v-model="startDate" class="filter-date">
          </div>

          <div class="filter-card">
            <label class="filter-label">
              <i class="fas fa-calendar-check"></i>
              Fecha hasta
            </label>
            <input type="date" v-model="endDate" class="filter-date">
          </div>
        </div>

        <!-- Estadísticas mejoradas -->
        <div class="stats-section">
          <div class="stat-card total-sales">
            <div class="stat-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total de Ventas</span>
              <span class="stat-value">S/. {{ totalVentas.toFixed(2) }}</span>
            </div>
          </div>
          
          <div class="stat-card total-orders">
            <div class="stat-icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total de Pedidos</span>
              <span class="stat-value">{{ pedidosFiltrados.length }}</span>
            </div>
          </div>

          <div class="stat-card avg-order">
            <div class="stat-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Promedio por Pedido</span>
              <span class="stat-value">
                S/. {{ pedidosFiltrados.length > 0 ? (totalVentas / pedidosFiltrados.length).toFixed(2) : '0.00' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="quick-actions">
          <button class="action-btn refresh" @click="loadPedidos" title="Actualizar">
            <i class="fas fa-sync-alt"></i>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="pedidos-table-container">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>

        <div v-else-if="pedidosFiltrados.length === 0" class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <p>Aún no hay pedidos registrados</p>
          <span class="info-text">Los pedidos aparecerán aquí cuando los clientes realicen compras</span>
        </div>

        <!-- Tabla de Pedidos Responsiva -->
        <div v-else class="pedidos-table">
          <div class="table-scroll-hint">
            <i class="fas fa-arrows-alt-h"></i>
            <span>Desliza horizontalmente para ver todas las columnas</span>
          </div>
          <table>
            <thead>
              <tr>
                <th class="col-id">ID</th>
                <th class="col-cliente">Cliente</th>
                <th class="col-email">Email</th>
                <th class="col-productos">Productos</th>
                <th class="col-total">Total</th>
                <th class="col-fecha">Fecha</th>
                <th class="col-documento">Documento</th>
                <th class="col-metodo">Método</th>
                <th class="col-estado">Estado</th>
                <th class="col-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidosFiltrados" :key="pedido.id" class="pedido-row">
                <td class="pedido-id">#{{ pedido.id }}</td>
                <td class="cliente-nombre">
                  <div class="cliente-info">
                    <strong>{{ pedido.cliente }}</strong>
                    <small v-if="pedido.telefono">{{ pedido.telefono }}</small>
                  </div>
                </td>
                <td class="email-cell">{{ pedido.email }}</td>
                <td class="productos-cell">
                  <div class="productos-lista">
                    <template v-for="(item, index) in pedido.productos" :key="item.id">
                      <div v-if="index < 2" class="producto-item">
                        <img 
                          :src="item.imagen_principal || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='" 
                          :alt="item.producto_nombre"
                          class="producto-miniatura"
                          @error="$event.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='"
                        >
                        <div class="producto-info">
                          <span class="producto-nombre">{{ item.producto_nombre }}</span>
                          <small class="producto-cantidad">Qty: {{ item.cantidad }}</small>
                        </div>
                      </div>
                    </template>
                    <div v-if="pedido.productos.length > 2" class="mas-productos">
                      +{{ pedido.productos.length - 2 }} más
                    </div>
                    <div v-if="pedido.productos.length === 0" class="sin-productos">
                      Sin productos
                    </div>
                  </div>
                </td>
                <td class="total">
                  <span class="total-amount">S/. {{ pedido.total.toFixed(2) }}</span>
                  <small class="items-count">{{ pedido.total_items }} items</small>
                </td>
                <td class="fecha-cell">
                  <div class="fecha-info">
                    {{ new Date(pedido.fecha_pedido_raw).toLocaleDateString('es-PE') }}
                    <small>{{ new Date(pedido.fecha_pedido_raw).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit'}) }}</small>
                  </div>
                </td>
                <td class="documento-cell">
                  <div v-if="pedido.documento_pago" class="comprobante-container">
                    <button 
                      class="btn-comprobante" 
                      @click="verComprobante(pedido.documento_pago)"
                      title="Ver comprobante de pago"
                    >
                      <i class="fas fa-file-image"></i>
                      <span>Ver</span>
                    </button>
                  </div>
                  <span v-else class="sin-comprobante">
                    <i class="fas fa-times-circle"></i>
                    Sin comprobante
                  </span>
                </td>
                <td class="metodo-cell">
                  <div class="metodo-pago" :class="`metodo-${pedido.metodo_pago.toLowerCase()}`">
                    <i class="fas fa-credit-card"></i>
                    {{ pedido.metodo_pago }}
                  </div>
                </td>
                <td class="estado-cell">
                  <button 
                    class="estado-badge"
                    :class="getEstadoClass(pedido.estado)"
                    @click="cambiarEstado(pedido)"
                    title="Click para cambiar estado"
                  >
                    {{ pedido.estado }}
                  </button>
                </td>
                <td class="acciones">
                  <div class="acciones-group">
                    <button class="btn-action view" title="Ver detalles" @click="verDetalle(pedido)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action print" title="Imprimir" @click="imprimirPedido">
                      <i class="fas fa-print"></i>
                    </button>
                    <button class="btn-action whatsapp" title="Enviar WhatsApp" @click="sendWhatsApp(pedido)">
                      <i class="fab fa-whatsapp"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Detalle Pedido -->
      <div v-if="detalleAbierto" class="modal-overlay" @click.self="cerrarDetalle">
        <div class="modal-content pedido-detalle-modal">
          <button class="modal-close" @click="cerrarDetalle">×</button>
          <div v-if="detalleLoading" class="loading">
            <div class="spinner"></div>
            <p>Cargando detalle...</p>
          </div>
          <div v-else-if="pedidoDetalle" class="detalle-wrapper">
            <div class="detalle-header">
              <div>
                <h2>Pedido #{{ pedidoDetalle.id }} <small>({{ pedidoDetalle.numero_pedido }})</small></h2>
                <p class="detalle-sub">{{ pedidoDetalle.fecha_pedido }} • {{ pedidoDetalle.metodo_pago }}</p>
              </div>
              <span class="estado-chip" :class="getEstadoClass(pedidoDetalle.estado)">{{ pedidoDetalle.estado }}</span>
            </div>

            <div class="detalle-grid">
              <!-- Cliente -->
              <div class="card">
                <h3>Cliente</h3>
                <p><strong>Nombre:</strong> {{ pedidoDetalle.datos_cliente?.nombre || '—' }}</p>
                <p><strong>Email:</strong> {{ pedidoDetalle.datos_cliente?.email || '—' }}</p>
                <p><strong>Teléfono:</strong> {{ pedidoDetalle.datos_cliente?.telefono || '—' }}</p>
                <p><strong>Documento:</strong> {{ pedidoDetalle.datos_cliente?.documento || '—' }}</p>
                <p class="entrega-info">
                  <strong>Tipo de entrega:</strong> 
                  <span :class="'tipo-entrega-' + pedidoDetalle.tipo_entrega">
                    {{ capitalizar(pedidoDetalle.tipo_entrega) }}
                  </span>
                </p>
              </div>

              <!-- Envío -->
              <div class="card">
                <h3>Envío</h3>
                <p>{{ pedidoDetalle.direccion_envio?.direccion || '—' }}</p>
                <p>{{ pedidoDetalle.direccion_envio?.ciudad || '—' }}, {{ pedidoDetalle.direccion_envio?.provincia || '—' }}</p>
                <p v-if="pedidoDetalle.direccion_envio?.codigoPostal">CP: {{ pedidoDetalle.direccion_envio.codigoPostal }}</p>
                <p v-if="pedidoDetalle.direccion_envio?.referencia" class="referencia">Ref: {{ pedidoDetalle.direccion_envio.referencia }}</p>
              </div>

              <!-- Resumen -->
              <div class="card resumen">
                <h3>Resumen</h3>
                <div class="resumen-row"><span>Subtotal</span><span>S/. {{ Number(pedidoDetalle.subtotal || 0).toFixed(2) }}</span></div>
                <div class="resumen-row"><span>Descuento</span><span>- S/. {{ Number(pedidoDetalle.descuento || 0).toFixed(2) }}</span></div>
                <div class="resumen-row"><span>Envío</span><span>{{ Number(pedidoDetalle.costo_envio || 0) === 0 ? 'GRATIS' : 'S/. ' + Number(pedidoDetalle.costo_envio).toFixed(2) }}</span></div>
                <div class="resumen-row total"><span>Total</span><span>S/. {{ Number(pedidoDetalle.total || 0).toFixed(2) }}</span></div>
              </div>
            </div>

            <!-- Items -->
            <div class="card items">
              <h3>Productos</h3>
              <table class="items-table">
                <thead>
                  <tr>
                    <th class="producto-header">Producto</th>
                    <th>Detalles</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-right">Precio Unit.</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="it in pedidoDetalle.items" :key="it.id" class="item-row">
                    <td>
                      <div class="product-cell">
                        <img 
                          :src="it.imagen" 
                          :alt="it.nombre" 
                          class="product-image"
                          @error="$event.target.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='"
                        >
                        <span class="product-name">{{ it.nombre }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="detalles-cell">
                        <span class="item-detail-tag">{{ it.tipo }}</span>
                        <span v-if="it.tamano" class="item-detail-tag">{{ it.tamano }}</span>
                      </div>
                      <p v-if="it.notas" class="notas-pedido">{{ it.notas }}</p>
                    </td>
                    <td class="text-center">{{ it.cantidad }}</td>
                    <td class="text-right">S/. {{ it.precio_unitario.toFixed(2) }}</td>
                    <td class="text-right total-col">S/. {{ it.precio_total.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="acciones-detalle">
              <button class="btn-action print" @click="imprimirPedido"><i class="fas fa-print"></i> Imprimir</button>
              <button class="btn-action view" @click="cerrarDetalle"><i class="fas fa-times"></i> Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>

.header {
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  color: var(--text-secondary);
  font-size: var(--font-lg);
}

/* === SECCIÓN DE FILTROS MEJORADA === */
.filters-section {
  background: linear-gradient(135deg, var(--bg-primary) 0%, rgba(20, 184, 166, 0.05) 100%);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(20, 184, 166, 0.1);
  backdrop-filter: blur(10px);
}

/* Barra de búsqueda principal */
.main-search {
  margin-bottom: var(--spacing-xl);
}

.search-box {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-color);
  font-size: var(--font-lg);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-4xl) var(--spacing-lg) var(--spacing-4xl);
  border: 2px solid transparent;
  border-radius: var(--border-radius-2xl);
  font-size: var(--font-lg);
  background: var(--bg-primary);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1), var(--shadow-lg);
  transform: translateY(-2px);
}

.search-input::placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

.clear-search {
  position: absolute;
  right: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  background: var(--text-tertiary);
  color: var(--bg-primary);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-sm);
  transition: all var(--transition-fast);
}

.clear-search:hover {
  background: var(--danger-color);
  transform: translateY(-50%) scale(1.1);
}

/* Grid de filtros */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.filter-card {
  background: var(--bg-primary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.filter-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary-color);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-sm);
}

.filter-label i {
  color: var(--secondary-color);
  font-size: var(--font-base);
}

.filter-select,
.filter-date {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  cursor: pointer;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

.filter-select:focus,
.filter-date:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.filter-select:hover,
.filter-date:hover {
  border-color: var(--secondary-color);
}

/* Sección de estadísticas mejorada */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--secondary-color);
  transition: width var(--transition-normal);
}

.stat-card:hover::before {
  width: 100%;
  opacity: 0.1;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-2xl);
}

.stat-icon {
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  color: white;
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-xl);
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.total-sales .stat-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.total-orders .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.avg-order .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1;
}

/* Acciones rápidas */
.quick-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.action-btn {
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  font-weight: var(--font-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left var(--transition-normal);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn.refresh {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

.action-btn.export {
  background: linear-gradient(135deg, #059669, #047857);
}

.pedidos-table-container {
  background: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
}

.pedidos-table {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.table-scroll-hint {
  display: none;
  background: rgba(20, 184, 166, 0.1);
  color: var(--secondary-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  text-align: center;
  font-size: var(--font-sm);
  border-bottom: 1px solid rgba(20, 184, 166, 0.2);
  align-items: center;
  gap: var(--spacing-sm);
}

.table-scroll-hint i {
  opacity: 0.7;
}

/* Mostrar hint solo en pantallas pequeñas */
@media (max-width: 1200px) {
  .table-scroll-hint {
    display: flex;
  }
}



/* Estilos mejorados para celdas de tabla */
.cliente-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cliente-info strong {
  color: var(--text-primary);
  font-size: var(--font-base);
}

.cliente-info small {
  color: var(--text-secondary);
  font-size: var(--font-xs);
}

.email-cell {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  word-break: break-word;
}

.productos-cell {
  max-width: 250px;
}

.productos-lista {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.producto-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.producto-item:hover {
  background: var(--bg-tertiary);
  transform: translateX(2px);
}

.producto-miniatura {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.producto-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.producto-nombre {
  font-size: var(--font-sm);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.producto-cantidad {
  color: var(--text-secondary);
  font-size: var(--font-xs);
}

.mas-productos {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  font-style: italic;
  text-align: center;
  padding: var(--spacing-xs);
  background: rgba(0,0,0,0.05);
  border-radius: var(--border-radius-sm);
}

.sin-productos {
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  font-style: italic;
  text-align: center;
  padding: var(--spacing-md);
}

.total {
  font-weight: var(--font-bold);
  color: var(--primary-color);
}

.total-amount {
  display: block;
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--secondary-color);
}

.items-count {
  display: block;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.fecha-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.fecha-info small {
  color: var(--text-secondary);
  font-size: var(--font-xs);
}

.documento-cell {
  text-align: center;
}

.sin-comprobante {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  color: var(--text-tertiary);
  font-size: var(--font-xs);
}

.metodo-pago {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  background: var(--bg-secondary);
}

.metodo-yape {
  background: rgba(139, 69, 238, 0.1);
  color: #8b45ee;
}

.metodo-plin {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.metodo-transferencia {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.acciones-group {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.entrega-info {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}

.tipo-entrega-envio {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: var(--border-radius-md);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
}

.tipo-entrega-retiro {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-radius: var(--border-radius-md);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
}

.loading, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
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

.empty-state i {
  font-size: 4rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-state .info-text {
  display: block;
  margin-top: var(--spacing-md);
  color: var(--text-tertiary);
  font-size: var(--font-sm);
  font-style: italic;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px; /* Reducido para mejor adaptabilidad */
}

thead {
  background: var(--bg-secondary);
  position: sticky;
  top: 0;
  z-index: 10;
}

th {
  padding: var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  text-transform: uppercase;
  border-bottom: 2px solid var(--border-color);
}

/* Anchos específicos para columnas optimizados */
.col-id { width: 70px; min-width: 70px; }
.col-cliente { width: 150px; min-width: 120px; }
.col-email { width: 180px; min-width: 150px; }
.col-productos { width: 200px; min-width: 180px; }
.col-total { width: 100px; min-width: 90px; }
.col-fecha { width: 120px; min-width: 100px; }
.col-documento { width: 100px; min-width: 80px; }
.col-metodo { width: 100px; min-width: 80px; }
.col-estado { width: 100px; min-width: 80px; }
.col-acciones { width: 100px; min-width: 90px; }

td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--bg-secondary);
  color: var(--text-primary);
  vertical-align: top;
}

.pedido-row {
  transition: all var(--transition-fast);
}

.pedido-row:hover {
  background: var(--bg-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.pedido-id {
  font-weight: var(--font-bold);
  color: var(--secondary-color);
}

.cliente-nombre {
  font-weight: var(--font-semibold);
}

.text-center {
  text-align: center;
}

.total {
  font-weight: var(--font-bold);
  color: var(--primary-color);
}

.estado-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.estado-badge:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.estado-completado {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.estado-pendiente {
  background: rgba(234, 179, 8, 0.1);
  color: #eab308;
}

.estado-proceso {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.estado-cancelado {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.acciones {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-action {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  font-size: var(--font-lg);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-fast);
}

.btn-action.view {
  color: var(--secondary-color);
}

.btn-action.view:hover {
  background: rgba(20, 184, 166, 0.1);
}

.btn-action.print {
  color: #6366f1;
}

.btn-action.print:hover {
  background: rgba(99, 102, 241, 0.1);
}

.btn-action.whatsapp {
  color: #25D366;
}

.btn-action.whatsapp:hover {
  background: rgba(37, 211, 102, 0.1);
}

.comprobante-container {
  display: flex;
  justify-content: center;
}

.btn-comprobante {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-xs);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
  font-weight: var(--font-semibold);
}

.btn-comprobante:hover {
  background: var(--primary-color);
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.sin-comprobante {
  color: var(--text-tertiary);
  font-style: italic;
  font-size: var(--font-sm);
}



/* === RESPONSIVE DESIGN === */
@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .filters-section {
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-xl);
  }

  .main-search {
    margin-bottom: var(--spacing-lg);
  }

  .search-input {
    padding: var(--spacing-md) var(--spacing-3xl) var(--spacing-md) var(--spacing-3xl);
    font-size: var(--font-base);
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .filter-card {
    padding: var(--spacing-md);
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .stat-card {
    padding: var(--spacing-lg);
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: var(--font-lg);
  }

  .stat-value {
    font-size: var(--font-xl);
  }

  .quick-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
    justify-content: center;
  }
  
  /* Tabla más compacta en móviles */
  table {
    min-width: 900px;
  }
  
  th, td {
    padding: var(--spacing-sm);
    font-size: var(--font-sm);
  }
  
  .producto-miniatura {
    width: 30px;
    height: 30px;
  }
  
  .producto-nombre {
    font-size: var(--font-xs);
  }
  
  .btn-action {
    padding: var(--spacing-xs);
    font-size: var(--font-sm);
  }

  .page-title {
    font-size: var(--font-2xl);
    text-align: center;
  }

  .subtitle {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .filters-section {
    padding: var(--spacing-md);
  }

  .search-input {
    padding: var(--spacing-sm) var(--spacing-2xl) var(--spacing-sm) var(--spacing-2xl);
  }

  .search-icon {
    left: var(--spacing-md);
    font-size: var(--font-base);
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-base);
  }

  .action-btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-sm);
  }
}

/* Modal Detalle */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
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

.modal-content.pedido-detalle-modal {
  background: var(--bg-primary);
  border-radius: var(--border-radius-2xl);
  width: min(1000px, 95%);
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

.detalle-header small {
  color: var(--text-tertiary);
  font-size: var(--font-sm);
  font-weight: var(--font-normal);
}

.detalle-sub { 
  color: var(--text-secondary); 
  margin-top: .25rem;
  font-size: var(--font-base);
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
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.card {
  background: var(--bg-secondary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card h3 {
  margin: 0 0 var(--spacing-md);
  color: var(--secondary-color);
  font-size: var(--font-lg);
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-sm);
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

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: var(--spacing-lg);
}

.items-table th,
.items-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.items-table th {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  text-transform: uppercase;
}

.producto-header {
  width: 40%;
}

.text-right {
  text-align: right;
}

.item-row:last-child td {
  border-bottom: none;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.product-image {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.product-name {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.detalles-cell {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.item-detail-tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-xs);
}

.notas-pedido {
  margin-top: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-tertiary);
  font-style: italic;
}

.total-col {
  font-weight: var(--font-bold);
  color: var(--secondary-color);
}

.acciones-detalle { 
  display: flex; 
  justify-content: flex-end; 
  gap: var(--spacing-md); 
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
}

.acciones-detalle .btn-action {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
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
</style>
