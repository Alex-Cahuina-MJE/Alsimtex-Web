<template>
  <AdminLayout>
    <div class="editar-productos-container">
      <div class="header">
        <h1>✏️ Editar Productos</h1>
        <p>Modifica rápidamente los datos de tus productos desde aquí</p>
      </div>

      <!-- Búsqueda y filtros -->
      <div class="search-section">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="🔍 Buscar producto por nombre..."
          class="search-input"
        >
        <select v-model="selectedCategoria" class="filter-select">
          <option value="all">Todas las categorías</option>
          <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando productos...</p>
      </div>

      <!-- Tabla de productos -->
      <div v-else class="productos-table-wrapper">
        <table class="productos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in filteredProductos" :key="producto.id" class="product-row">
              <td class="cell-id">{{ producto.id }}</td>
              <td class="cell-nombre">{{ producto.nombre }}</td>
              <td class="cell-categoria">{{ producto.categoria }}</td>
              <td class="cell-precio">
                <input 
                  v-model.number="producto.precio_base" 
                  type="number" 
                  class="input-field"
                  @change="handlePriceChange(producto)"
                >
              </td>
              <td class="cell-stock">
                <input 
                  v-model.number="producto.stock" 
                  type="number" 
                  class="input-field"
                  @change="handleStockChange(producto)"
                >
              </td>
              <td class="cell-estado">
                <button 
                  class="estado-btn"
                  :class="{ 'activo': producto.estado, 'inactivo': !producto.estado }"
                  @click="toggleEstado(producto)"
                >
                  {{ producto.estado ? '✅ Activo' : '❌ Inactivo' }}
                </button>
              </td>
              <td class="cell-acciones">
                <button 
                  class="btn-editar"
                  @click="abrirModalEditar(producto)"
                  title="Editar completo"
                >
                  📝 Editar
                </button>
                <button 
                  class="btn-eliminar"
                  @click="eliminarProducto(producto.id)"
                  title="Eliminar"
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredProductos.length === 0" class="empty-state">
          <p>No se encontraron productos</p>
        </div>
      </div>

      <!-- Modal de edición completa -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2>Editar Producto</h2>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre</label>
              <input v-model="productoEditando.nombre" type="text" class="form-input">
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="productoEditando.descripcion" class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label>Precio Base</label>
              <input v-model.number="productoEditando.precio_base" type="number" class="form-input">
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input v-model.number="productoEditando.stock" type="number" class="form-input">
            </div>
            <div class="form-group">
              <label>Categoría</label>
              <select v-model="productoEditando.categoria" class="form-input">
                <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>

            <div class="form-group" v-if="shouldShowSubcategoria">
              <label>Tamaño</label>
              <select v-model="productoEditando.subcategoria" class="form-input">
                <option value="">Seleccionar tamaño</option>
                <option value="2 PLAZAS">2 PLAZAS</option>
                <option value="1 PLAZA">1 PLAZA</option>
                <option value="1.5 PLAZAS">1.5 PLAZAS</option>
                <option value="KING">KING</option>
              </select>
            </div>

            <div class="form-group">
              <label>Stock Disponible</label>
              <input 
                v-model.number="productoEditando.stock" 
                type="number" 
                min="0"
                class="form-input"
              >
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Cancelar</button>
            <button class="btn-save" @click="guardarEdicion">💾 Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useProductosStore } from '../../stores/productosStore'
import AdminLayout from '../../components/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const productosStore = useProductosStore()

const loading = ref(true)
const searchQuery = ref('')
const selectedCategoria = ref('all')
const showModal = ref(false)
const productoEditando = ref({})

const categorias = [
  'SABANAS',
  'COBERTORES',
  'EDREDRONES',
  'PROTECORES',
  'FUNDAS DE COLCHON',
  'FRAZADAS',
  'DUVET',
  'SERVICIO',
  'PRODUCTO',
  'RESPALDOS',
  'ALMOHADAS'
]

const categoriasConTamaño = [
  'SABANAS',
  'COBERTORES',
  'EDREDRONES',
  'PROTECORES',
  'FUNDAS DE COLCHON',
  'FRAZADAS',
  'DUVET'
]

const shouldShowSubcategoria = computed(() => {
  return categoriasConTamaño.includes(productoEditando.value?.categoria || '')
})

const productos = ref([])

const filteredProductos = computed(() => {
  return productos.value.filter(p => {
    const nombreMatch = p.nombre.toLowerCase().includes(searchQuery.value.toLowerCase())
    const categoriaMatch = selectedCategoria.value === 'all' || p.categoria === selectedCategoria.value
    return nombreMatch && categoriaMatch
  })
})

onMounted(async () => {
  if (!authStore.isAdmin()) {
    router.push('/')
    return
  }

  try {
    const data = await productosStore.fetchProductos()
    productos.value = data || []
  } catch (err) {
    console.error('Error cargando productos:', err)
  } finally {
    loading.value = false
  }
})

const handlePriceChange = async (producto) => {
  try {
    await productosStore.updateProducto(producto.id, {
      precio_base: producto.precio_base
    })
  } catch (err) {
    console.error('Error actualizando precio:', err)
  }
}

const handleStockChange = async (producto) => {
  try {
    await productosStore.updateProducto(producto.id, {
      stock: producto.stock
    })
  } catch (err) {
    console.error('Error actualizando stock:', err)
  }
}

const toggleEstado = async (producto) => {
  try {
    await productosStore.toggleEstadoProducto(producto.id)
    producto.estado = !producto.estado
  } catch (err) {
    console.error('Error cambiando estado:', err)
  }
}

const abrirModalEditar = (producto) => {
  productoEditando.value = { ...producto }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  productoEditando.value = {}
}

const guardarEdicion = async () => {
  try {
    await productosStore.updateProducto(productoEditando.value.id, productoEditando.value)
    
    // Actualizar en la lista local
    const index = productos.value.findIndex(p => p.id === productoEditando.value.id)
    if (index !== -1) {
      productos.value[index] = { ...productoEditando.value }
    }
    
    closeModal()
    alert('✅ Producto actualizado correctamente')
  } catch (err) {
    console.error('Error guardando:', err)
    alert('❌ Error al guardar cambios')
  }
}

const eliminarProducto = async (id) => {
  if (!confirm('¿Está seguro de que desea eliminar este producto?')) return
  
  try {
    await productosStore.deleteProducto(id)
    productos.value = productos.value.filter(p => p.id !== id)
    alert('✅ Producto eliminado correctamente')
  } catch (err) {
    console.error('Error eliminando:', err)
    alert('❌ Error al eliminar producto')
  }
}
</script>

<style scoped>
.editar-productos-container {
  padding: var(--spacing-2xl);
  background: var(--bg-primary);
  min-height: 100vh;
}

.header {
  margin-bottom: var(--spacing-3xl);
  text-align: center;
}

.header h1 {
  font-size: var(--font-4xl);
  margin-bottom: var(--spacing-md);
  color: var(--primary-color);
}

.header p {
  font-size: var(--font-lg);
  color: var(--text-secondary);
}

.search-section {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  flex-wrap: wrap;
}

.search-input,
.filter-select {
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  flex: 1;
  min-width: 200px;
  background: white;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-4xl);
}

.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto var(--spacing-lg);
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.productos-table-wrapper {
  overflow-x: auto;
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
}

.productos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-sm);
}

.productos-table thead {
  background: var(--bg-secondary);
  font-weight: 600;
  color: var(--primary-color);
}

.productos-table th {
  padding: var(--spacing-lg);
  text-align: left;
  border-bottom: 2px solid var(--border-color);
}

.productos-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.productos-table tbody tr:hover {
  background-color: rgba(20, 184, 166, 0.05);
}

.productos-table td {
  padding: var(--spacing-md) var(--spacing-lg);
}

.cell-id {
  font-weight: 600;
  color: var(--primary-color);
}

.input-field {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}

.estado-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-xs);
}

.estado-btn.activo {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.estado-btn.inactivo {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.estado-btn:hover {
  transform: scale(1.05);
}

.cell-acciones {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.btn-editar,
.btn-eliminar {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-xs);
}

.btn-editar {
  background: var(--primary-color);
  color: white;
}

.btn-editar:hover {
  background: #0d9488;
  transform: translateY(-2px);
}

.btn-eliminar {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.btn-eliminar:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-4xl);
  color: var(--text-secondary);
  font-size: var(--font-lg);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal {
  background: white;
  border-radius: var(--border-radius-xl);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2xl);
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: var(--font-2xl);
  color: var(--primary-color);
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--font-2xl);
  cursor: pointer;
  color: var(--text-secondary);
}

.modal-body {
  padding: var(--spacing-2xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-base);
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-textarea {
  min-height: 120px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.btn-cancel,
.btn-save {
  padding: var(--spacing-md) var(--spacing-2xl);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background: var(--border-color);
}

.btn-save {
  background: var(--primary-color);
  color: white;
}

.btn-save:hover {
  background: #0d9488;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .editar-productos-container {
    padding: var(--spacing-lg);
  }

  .search-section {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    min-width: auto;
  }

  .productos-table {
    font-size: var(--font-xs);
  }

  .productos-table th,
  .productos-table td {
    padding: var(--spacing-sm);
  }

  .cell-acciones {
    flex-direction: column;
  }

  .btn-editar,
  .btn-eliminar {
    width: 100%;
  }
}
</style>
