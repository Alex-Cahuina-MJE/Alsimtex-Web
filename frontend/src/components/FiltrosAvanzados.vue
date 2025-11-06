```vue
<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['filtrar'])

const props = defineProps({
  productos: {
    type: Array,
    required: true
  }
})

const rangoPrecio = ref([0, 1000])
const descuentoMinimo = ref(0)
const mostrarSoloOfertas = ref(false)
const stockDisponible = ref(false)
const ordenarPor = ref('relevancia')

// Calcular estadísticas
const estadisticas = computed(() => {
  if (!props.productos.length) return {
    precioMin: 0,
    precioMax: 1000,
    precioPromedio: 0,
    totalProductos: 0,
    conDescuento: 0,
    stockTotal: 0
  }

  const precios = props.productos.map(p => p.precio_base)
  return {
    precioMin: Math.min(...precios),
    precioMax: Math.max(...precios),
    precioPromedio: precios.reduce((a, b) => a + b, 0) / precios.length,
    totalProductos: props.productos.length,
    conDescuento: props.productos.filter(p => p.descuento > 0).length,
    stockTotal: props.productos.reduce((total, p) => total + (p.stock || 0), 0)
  }
})

// Observar cambios en los filtros
const aplicarFiltros = () => {
  emit('filtrar', {
    rangoPrecio: rangoPrecio.value,
    descuentoMinimo: descuentoMinimo.value,
    mostrarSoloOfertas: mostrarSoloOfertas.value,
    stockDisponible: stockDisponible.value,
    ordenarPor: ordenarPor.value
  })
}

const formatoPrecio = (precio) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(precio)
}

const resetearFiltros = () => {
  rangoPrecio.value = [estadisticas.value.precioMin, estadisticas.value.precioMax]
  descuentoMinimo.value = 0
  mostrarSoloOfertas.value = false
  stockDisponible.value = false
  ordenarPor.value = 'relevancia'
  aplicarFiltros()
}
</script>

<template>
  <div class="filtros-avanzados">
    <!-- Estadísticas -->
    <div class="estadisticas-section">
      <h3 class="section-title">
        <i class="fas fa-chart-line"></i>
        Estadísticas
      </h3>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-tags"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ estadisticas.totalProductos }}</div>
            <div class="stat-label">Productos</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-percentage"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ estadisticas.conDescuento }}</div>
            <div class="stat-label">En oferta</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-money-bill-wave"></i>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatoPrecio(estadisticas.precioPromedio) }}</div>
            <div class="stat-label">Precio promedio</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rango de precios -->
    <div class="filtro-section">
      <h3 class="section-title">
        <i class="fas fa-dollar-sign"></i>
        Rango de Precios
      </h3>
      <div class="precio-range">
        <div class="precio-inputs">
          <div class="precio-input">
            <label>Mínimo</label>
            <input 
              type="number" 
              v-model.number="rangoPrecio[0]"
              :min="estadisticas.precioMin"
              :max="rangoPrecio[1]"
              @change="aplicarFiltros"
            >
          </div>
          <div class="precio-input">
            <label>Máximo</label>
            <input 
              type="number" 
              v-model.number="rangoPrecio[1]"
              :min="rangoPrecio[0]"
              :max="estadisticas.precioMax"
              @change="aplicarFiltros"
            >
          </div>
        </div>
        <div class="precio-slider">
          <input 
            type="range" 
            v-model.number="rangoPrecio[0]"
            :min="estadisticas.precioMin"
            :max="estadisticas.precioMax"
            @input="aplicarFiltros"
          >
          <input 
            type="range" 
            v-model.number="rangoPrecio[1]"
            :min="estadisticas.precioMin"
            :max="estadisticas.precioMax"
            @input="aplicarFiltros"
          >
        </div>
      </div>
    </div>

    <!-- Descuentos -->
    <div class="filtro-section">
      <h3 class="section-title">
        <i class="fas fa-percent"></i>
        Descuentos
      </h3>
      <div class="descuento-options">
        <label class="switch-label">
          <input 
            type="checkbox" 
            v-model="mostrarSoloOfertas"
            @change="aplicarFiltros"
          >
          <span class="switch-text">Solo ofertas</span>
        </label>
        <div class="descuento-slider">
          <label>Descuento mínimo: {{ descuentoMinimo }}%</label>
          <input 
            type="range" 
            v-model.number="descuentoMinimo"
            min="0"
            max="70"
            step="5"
            @input="aplicarFiltros"
          >
        </div>
      </div>
    </div>

    <!-- Stock -->
    <div class="filtro-section">
      <h3 class="section-title">
        <i class="fas fa-box"></i>
        Disponibilidad
      </h3>
      <label class="switch-label">
        <input 
          type="checkbox" 
          v-model="stockDisponible"
          @change="aplicarFiltros"
        >
        <span class="switch-text">Mostrar solo productos en stock</span>
      </label>
      <div class="stock-info">
        <i class="fas fa-info-circle"></i>
        <span>Stock total: {{ estadisticas.stockTotal }} unidades</span>
      </div>
    </div>

    <!-- Ordenamiento -->
    <div class="filtro-section">
      <h3 class="section-title">
        <i class="fas fa-sort"></i>
        Ordenar por
      </h3>
      <select 
        v-model="ordenarPor"
        @change="aplicarFiltros"
        class="orden-select"
      >
        <option value="relevancia">Más relevantes</option>
        <option value="precio-asc">Precio: menor a mayor</option>
        <option value="precio-desc">Precio: mayor a menor</option>
        <option value="descuento">Mayor descuento</option>
        <option value="stock">Mayor stock</option>
      </select>
    </div>

    <!-- Botón resetear -->
    <button class="btn-resetear" @click="resetearFiltros">
      <i class="fas fa-undo"></i>
      Resetear filtros
    </button>
  </div>
</template>

<style scoped>
.filtros-avanzados {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  display: grid;
  grid-template-columns: repeat(4, 1fr); 
  gap: var(--spacing-xl);
}

@media (max-width: 1280px) {
  .filtros-avanzados {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .filtros-avanzados {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filtros-avanzados {
    grid-template-columns: 1fr;
  }
}

.section-title {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-primary);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: var(--spacing-sm);
}

.section-title i {
  color: var(--primary-color);
}

/* Estadísticas */
.estadisticas-section {
  grid-column: span 4;
}

@media (max-width: 1280px) {
  .estadisticas-section {
    grid-column: span 3;
  }
}

@media (max-width: 1024px) {
  .estadisticas-section {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .estadisticas-section {
    grid-column: span 1;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(234, 88, 12, 0.05));
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  border: 2px solid var(--border-color);
  transition: all var(--transition-normal);
  text-align: center;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-lg);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

/* Filtros */
.filtro-section {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  transition: all var(--transition-normal);
}

.filtro-section:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.filtro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.filtro-header h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filtro-header h3 i {
  color: var(--primary-color);
}

/* Rango de precios */
.precio-range {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.precio-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.precio-separador {
  color: var(--text-secondary);
  font-weight: var(--font-bold);
}

.precio-input {
  flex: 1;
}

.precio-input label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.precio-input label {
  display: block;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.precio-input input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-base);
}

.precio-input input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.precio-slider {
  position: relative;
  height: 40px;
}

.precio-slider input[type="range"] {
  position: absolute;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
}

.precio-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

.precio-slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Descuentos */
.opciones-grupo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.opcion-checkbox {
  background: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.switch-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  cursor: pointer;
}

.switch-label input[type="checkbox"] {
  accent-color: var(--primary-color);
  width: 18px;
  height: 18px;
}

.switch-text {
  font-size: var(--font-sm);
  color: var(--text-primary);
}

.descuento-slider {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
}

.descuento-slider label {
  display: block;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.descuento-slider input[type="range"] {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  outline: none;
}

.descuento-slider input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

.descuento-slider input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Stock */
.stock-info {
  margin-top: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.stock-info i {
  color: var(--primary-color);
}

/* Ordenamiento */
.orden-select {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-base);
  background: white;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--spacing-md) center;
  padding-right: calc(var(--spacing-md) * 2 + 12px);
}

.orden-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

/* Botón resetear */
.btn-resetear {
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--border-radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-resetear:hover {
  color: var(--primary-color);
  background: var(--primary-color-light);
}

/* Responsive */
@media (max-width: 480px) {
  .filtros-avanzados {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .stat-card {
    padding: var(--spacing-sm);
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    font-size: var(--font-base);
  }

  .precio-inputs {
    flex-direction: column;
  }

  .precio-separador {
    display: none;
  }
}
</style>
```