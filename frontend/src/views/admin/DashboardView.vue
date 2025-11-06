<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useProductosStore } from '../../stores/productosStore'
import { useUsuariosStore } from '../../stores/usuariosStore'
import AdminLayout from '../../components/AdminLayout.vue'
import axios from 'axios'
import { getApiBase } from '../../config/api'

const router = useRouter()
const authStore = useAuthStore()
const productosStore = useProductosStore()
const usuariosStore = useUsuariosStore()

const stats = ref({
  totalProductos: 0,
  totalUsuarios: 0,
  productosActivos: 0,
  productosInactivos: 0,
  totalAdmins: 0,
  totalClientes: 0
})

const loading = ref(true)

onMounted(async () => {
  if (!authStore.isAdmin()) {
    router.push('/')
    return
  }
  
  await loadDashboardData()
})

const chartData = ref({
  ventasPorMes: Array(12).fill(0),
  categorias: {},
  crecimiento: 0
})

const animatedStats = ref({
  totalProductos: 0,
  totalUsuarios: 0,
  productosActivos: 0,
  totalVentas: 0
})

// Computed para calcular porcentajes de categorías
const categoriasConPorcentaje = computed(() => {
  const categorias = chartData.value.categorias
  const total = Object.values(categorias).reduce((sum, count) => sum + count, 0)
  
  if (total === 0) return []
  
  return Object.entries(categorias).map(([nombre, cantidad]) => ({
    nombre: nombre.charAt(0) + nombre.slice(1).toLowerCase(),
    cantidad,
    porcentaje: Math.round((cantidad / total) * 100)
  })).sort((a, b) => b.cantidad - a.cantidad)
})

// Computed para calcular los segmentos del gráfico donut
const donutSegments = computed(() => {
  const total = Object.values(chartData.value.categorias).reduce((sum, count) => sum + count, 0)
  if (total === 0) return []
  
  const colores = [
    '#14b8a6', '#059669', '#047857', '#10b981', '#0d9488', '#0f766e'
  ]
  
  let offset = 0
  const circumference = 2 * Math.PI * 80 // radio = 80
  
  return Object.entries(chartData.value.categorias)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, cantidad], index) => {
      const porcentaje = (cantidad / total) * 100
      const dashArray = (porcentaje / 100) * circumference
      const currentOffset = offset
      offset += dashArray
      
      return {
        nombre: nombre.charAt(0) + nombre.slice(1).toLowerCase(),
        cantidad,
        porcentaje: Math.round(porcentaje),
        dashArray: `${dashArray} ${circumference}`,
        dashOffset: -currentOffset + circumference / 4,
        color: colores[index % colores.length]
      }
    })
})

const loadDashboardData = async () => {
  loading.value = true
  try {
    // Cargar productos reales
    await productosStore.fetchProductos()
    
    // Cargar usuarios reales
    await usuariosStore.fetchUsuarios()
    
    // Calcular categorías de productos
    const categorias = {}
    productosStore.productos.forEach(p => {
      const cat = p.categoria || 'OTROS'
      categorias[cat] = (categorias[cat] || 0) + 1
    })
    chartData.value.categorias = categorias
    
    // Obtener estadísticas de ventas reales del backend
    try {
      const token = localStorage.getItem('token')
      const url = `${getApiBase()}/pedidos/estadisticas/ventas`
      console.log('🔍 Solicitando estadísticas desde:', url)
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📊 Estadísticas recibidas:', response.data)
      
      const estadisticas = response.data
      chartData.value.ventasPorMes = estadisticas.ventasPorMes || Array(12).fill(0)
      chartData.value.crecimiento = estadisticas.crecimiento || 0
      
      // Calcular estadísticas reales
      stats.value = {
        totalProductos: productosStore.productos.length,
        totalUsuarios: usuariosStore.usuarios.length,
        productosActivos: productosStore.productos.filter(p => p.estado).length,
        productosInactivos: productosStore.productos.filter(p => !p.estado).length,
        totalAdmins: usuariosStore.usuarios.filter(u => u.rol === 'admin').length,
        totalClientes: usuariosStore.usuarios.filter(u => u.rol === 'user').length,
        totalVentas: estadisticas.ventasMes || 0
      }
      
      console.log('✅ Stats actualizados:', stats.value)
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error)
      console.error('Detalles del error:', error.response?.data || error.message)
      // Si no hay pedidos o hay error, usar valores por defecto
      chartData.value.ventasPorMes = Array(12).fill(0)
      chartData.value.crecimiento = 0
      
      stats.value = {
        totalProductos: productosStore.productos.length,
        totalUsuarios: usuariosStore.usuarios.length,
        productosActivos: productosStore.productos.filter(p => p.estado).length,
        productosInactivos: productosStore.productos.filter(p => !p.estado).length,
        totalAdmins: usuariosStore.usuarios.filter(u => u.rol === 'admin').length,
        totalClientes: usuariosStore.usuarios.filter(u => u.rol === 'user').length,
        totalVentas: 0
      }
    }
    
    // Animar estadísticas
    animateStats()
  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

const animateStats = () => {
  const duration = 2000
  const start = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const easing = 1 - Math.pow(1 - progress, 3) // Easing out cubic
    
    animatedStats.value = {
      totalProductos: Math.floor(stats.value.totalProductos * easing),
      totalUsuarios: Math.floor(stats.value.totalUsuarios * easing),
      productosActivos: Math.floor(stats.value.productosActivos * easing),
      totalVentas: Math.floor(stats.value.totalVentas * easing)
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  
  animate()
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
  <AdminLayout>
    <div class="container">
      <div class="dashboard-header">
        <h1 class="page-title">Panel de Administración</h1>
        <p class="welcome-text">Bienvenido, {{ authStore.user?.nombre || 'Admin' }}</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando datos...</p>
      </div>

      <div v-else class="dashboard-content">
        <!-- Estadísticas Modernas con Animaciones -->
        <section class="stats-section-modern">
          <div class="stat-card-modern productos">
            <div class="stat-background">
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-icon-modern">
                <i class="fas fa-box"></i>
                <div class="icon-glow"></div>
              </div>
              <div class="stat-data">
                <div class="stat-number">{{ animatedStats.totalProductos }}</div>
                <div class="stat-label">Total Productos</div>
                <div class="stat-change positive">
                  <i class="fas fa-arrow-up"></i>
                  +{{ Math.floor(Math.random() * 15) + 5 }}%
                </div>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar" :style="{ width: (animatedStats.totalProductos / Math.max(stats.totalProductos, 1)) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="stat-card-modern usuarios">
            <div class="stat-background">
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-icon-modern">
                <i class="fas fa-users"></i>
                <div class="icon-glow"></div>
              </div>
              <div class="stat-data">
                <div class="stat-number">{{ animatedStats.totalUsuarios }}</div>
                <div class="stat-label">Total Usuarios</div>
                <div class="stat-change positive">
                  <i class="fas fa-arrow-up"></i>
                  +{{ Math.floor(Math.random() * 20) + 8 }}%
                </div>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar" :style="{ width: (animatedStats.totalUsuarios / Math.max(stats.totalUsuarios, 1)) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="stat-card-modern activos">
            <div class="stat-background">
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-icon-modern">
                <i class="fas fa-check-circle"></i>
                <div class="icon-glow"></div>
              </div>
              <div class="stat-data">
                <div class="stat-number">{{ animatedStats.productosActivos }}</div>
                <div class="stat-label">Productos Activos</div>
                <div class="stat-change positive">
                  <i class="fas fa-arrow-up"></i>
                  +{{ Math.floor(Math.random() * 12) + 3 }}%
                </div>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar" :style="{ width: (animatedStats.productosActivos / Math.max(stats.productosActivos, 1)) * 100 + '%' }"></div>
            </div>
          </div>

          <div class="stat-card-modern ventas">
            <div class="stat-background">
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-icon-modern">
                <i class="fas fa-chart-line"></i>
                <div class="icon-glow"></div>
              </div>
              <div class="stat-data">
                <div class="stat-number">S/. {{ animatedStats.totalVentas.toLocaleString() }}</div>
                <div class="stat-label">Ventas del Mes</div>
                <div class="stat-change positive">
                  <i class="fas fa-arrow-up"></i>
                  +{{ chartData.crecimiento }}%
                </div>
              </div>
            </div>
            <div class="stat-progress">
              <div class="progress-bar" :style="{ width: (animatedStats.totalVentas / Math.max(stats.totalVentas, 1)) * 100 + '%' }"></div>
            </div>
          </div>
        </section>

        <!-- Gráficos Interactivos -->
        <section class="charts-section">
          <div class="chart-card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-area"></i> Ventas por Mes</h3>
              <div class="chart-controls">
                <button class="chart-btn active">12M</button>
                <button class="chart-btn">6M</button>
                <button class="chart-btn">3M</button>
              </div>
            </div>
            <div class="chart-container">
              <div v-if="chartData.ventasPorMes.every(v => v === 0)" class="no-data">
                <i class="fas fa-chart-area"></i>
                <p>No hay datos de ventas aún</p>
              </div>
              <div v-else class="mini-chart">
                <div 
                  v-for="(value, index) in chartData.ventasPorMes" 
                  :key="index"
                  class="chart-bar"
                  :style="{ 
                    height: value > 0 ? (value / Math.max(...chartData.ventasPorMes, 1)) * 100 + '%' : '5%',
                    animationDelay: index * 0.05 + 's'
                  }"
                  :title="`Mes ${index + 1}: S/. ${value.toLocaleString()}`"
                ></div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <h3><i class="fas fa-chart-pie"></i> Productos por Categoría</h3>
            </div>
            <div class="donut-chart">
              <div v-if="donutSegments.length === 0" class="no-data">
                <i class="fas fa-chart-pie"></i>
                <p>No hay productos registrados</p>
              </div>
              <template v-else>
                <div class="donut-container">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" stroke-width="20"/>
                    <circle 
                      v-for="(segment, index) in donutSegments" 
                      :key="index"
                      cx="100" cy="100" r="80" fill="none" 
                      :stroke="segment.color" 
                      stroke-width="20"
                      :stroke-dasharray="segment.dashArray"
                      :stroke-dashoffset="segment.dashOffset"
                      class="donut-segment"
                    />
                  </svg>
                  <div class="donut-center">
                    <div class="donut-total">{{ stats.totalProductos }}</div>
                    <div class="donut-label">Productos</div>
                  </div>
                </div>
                <div class="legend">
                  <div 
                    v-for="(segment, index) in donutSegments" 
                    :key="index"
                    class="legend-item"
                  >
                    <div 
                      class="legend-color" 
                      :style="{ backgroundColor: segment.color }"
                    ></div>
                    <span>{{ segment.nombre }} ({{ segment.porcentaje }}%)</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </section>

        <!-- Detalles de Usuarios -->
        <section class="details-section">
          <div class="detail-card">
            <div class="detail-header">
              <i class="fas fa-user-shield"></i>
              <h3>Administradores</h3>
            </div>
            <div class="detail-number">{{ stats.totalAdmins }}</div>
          </div>

          <div class="detail-card">
            <div class="detail-header">
              <i class="fas fa-user"></i>
              <h3>Clientes</h3>
            </div>
            <div class="detail-number">{{ stats.totalClientes }}</div>
          </div>
        </section>

        <!-- Accesos Rápidos -->
        <section class="quick-access">
          <h2>Accesos Rápidos</h2>
          <div class="quick-links">
            <router-link to="/admin/productos" class="quick-link">
              <i class="fas fa-box"></i>
              <span>Gestionar Productos</span>
            </router-link>
            <router-link to="/admin/usuarios" class="quick-link">
              <i class="fas fa-users"></i>
              <span>Gestionar Usuarios</span>
            </router-link>
            <router-link to="/productos" class="quick-link">
              <i class="fas fa-store"></i>
              <span>Ver Tienda</span>
            </router-link>
            <router-link to="/nosotros" class="quick-link">
              <i class="fas fa-info-circle"></i>
              <span>Sobre Nosotros</span>
            </router-link>
            <router-link to="/admin/configuracion" class="quick-link featured">
              <i class="fas fa-cogs"></i>
              <span>Configuración Empresa</span>
              <span class="badge-new">¡NUEVO!</span>
            </router-link>
          </div>
        </section>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>

.dashboard-header {
  margin-bottom: var(--spacing-3xl);
}

.page-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-sm);
}

.welcome-text {
  font-size: var(--font-lg);
  color: var(--text-secondary);
}

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

/* Estadísticas */
/* Estadísticas Modernas */
.stats-section-modern {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-4xl);
}

.stat-card-modern {
  position: relative;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--border-radius-3xl);
  padding: var(--spacing-2xl);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  animation: cardFloat 8s ease-in-out infinite;
}

@keyframes cardFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.stat-card-modern:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 32px 64px -12px rgba(0, 0, 0, 0.15),
    0 25px 32px -5px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.stat-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--border-radius-3xl);
}

.stat-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(5, 150, 105, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(14, 165, 233, 0.03) 0%, transparent 50%);
  animation: patternShift 20s ease-in-out infinite;
}

@keyframes patternShift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10px, -10px); }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  position: relative;
  z-index: 2;
}

.stat-icon-modern {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--border-radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  flex-shrink: 0;
}

.stat-card-modern.productos .stat-icon-modern {
  background: linear-gradient(135deg, #14b8a6, #059669);
  box-shadow: 0 8px 32px rgba(20, 184, 166, 0.4);
}

.stat-card-modern.usuarios .stat-icon-modern {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
}

.stat-card-modern.activos .stat-icon-modern {
  background: linear-gradient(135deg, #10b981, #047857);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
}

.stat-card-modern.ventas .stat-icon-modern {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.4);
}

.icon-glow {
  position: absolute;
  inset: -4px;
  border-radius: var(--border-radius-2xl);
  background: inherit;
  filter: blur(8px);
  opacity: 0.6;
  z-index: -1;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.stat-data {
  flex: 1;
}

.stat-number {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: var(--font-extrabold);
  background: linear-gradient(135deg, #1f2937, #374151);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-base);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-sm);
}

.stat-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
}

.stat-change.positive {
  color: #059669;
}

.stat-change.negative {
  color: #dc2626;
}

.stat-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 0 0 var(--border-radius-3xl) var(--border-radius-3xl);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #14b8a6, #059669);
  transition: width 2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6));
  animation: progressShine 2s ease-in-out infinite;
}

/* Gráficos */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-4xl);
}

.chart-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--border-radius-3xl);
  padding: var(--spacing-2xl);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.chart-header h3 {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.chart-controls {
  display: flex;
  gap: var(--spacing-xs);
}

.chart-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid rgba(20, 184, 166, 0.3);
  background: transparent;
  color: var(--secondary-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-btn:hover,
.chart-btn.active {
  background: var(--secondary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.mini-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 200px;
  padding: var(--spacing-lg);
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #14b8a6, #10b981, #059669);
  border-radius: 4px 4px 0 0;
  min-height: 10%;
  animation: barGrow 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  transform: scaleY(0);
  transform-origin: bottom;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.chart-bar:hover {
  filter: brightness(1.1);
  transform: scaleY(1) scaleX(1.1);
}

@keyframes barGrow {
  to {
    transform: scaleY(1);
  }
}

/* Gráfico Donut */
.donut-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.donut-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.donut-segment {
  transition: all 0.3s ease;
  animation: donutDraw 2s ease-out forwards;
}

@keyframes donutDraw {
  from {
    stroke-dasharray: 0 503;
  }
}

.donut-center {
  position: absolute;
  text-align: center;
}

.donut-total {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.donut-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: var(--border-radius-xs);
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.no-data i {
  font-size: 3rem;
  opacity: 0.3;
}

.no-data p {
  font-size: var(--font-base);
}

.stat-card {
  background: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-normal);
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-2xl);
  color: white;
}

.stat-icon.productos {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.usuarios {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.activos {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.inactivos {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Detalles de Usuarios */
.details-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-3xl);
}

.detail-card {
  background: var(--bg-primary);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--secondary-color);
  transition: all var(--transition-normal);
}

.detail-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.detail-header i {
  font-size: var(--font-2xl);
  color: var(--secondary-color);
}

.detail-header h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.detail-number {
  font-size: var(--font-4xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.stat-info h3 {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-info p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* Accesos Rápidos */
.quick-access {
  margin-bottom: var(--spacing-3xl);
}

.quick-access h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
}

.quick-link {
  background: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  transition: all var(--transition-normal);
  border: 2px solid transparent;
  color: var(--text-primary);
}

.quick-link:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
  border-color: var(--secondary-color);
}

.quick-link i {
  font-size: var(--font-3xl);
  color: var(--secondary-color);
}

.quick-link span {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
}

.quick-link.featured {
  position: relative;
  border: 2px solid var(--secondary-color);
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.05), rgba(20, 184, 166, 0.1));
}

.quick-link.featured:hover {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.15));
  transform: translateY(-3px);
}

.badge-new {
  position: absolute;
  top: -8px;
  right: -8px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  padding: 4px 8px;
  border-radius: var(--border-radius-full);
  animation: pulse 2s infinite;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Pedidos Recientes */
.recent-orders {
  background: var(--bg-primary);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
}

.recent-orders h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
}

.orders-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--bg-secondary);
}

th {
  padding: var(--spacing-md);
  text-align: left;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  text-transform: uppercase;
}

td {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--bg-secondary);
  color: var(--text-primary);
}

tbody tr:hover {
  background: var(--bg-secondary);
}

.estado-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
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

.btn-action {
  background: transparent;
  border: none;
  color: var(--secondary-color);
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: var(--font-lg);
  transition: all var(--transition-fast);
}

.btn-action:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: 1fr;
  }

  .quick-links {
    grid-template-columns: repeat(2, 1fr);
  }

  .orders-table {
    font-size: var(--font-sm);
  }

  th, td {
    padding: var(--spacing-sm);
  }
}
</style>
