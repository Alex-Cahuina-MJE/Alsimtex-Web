<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useProductosStore } from '../../stores/productosStore'
import AdminLayout from '../../components/AdminLayout.vue'
import Swal from 'sweetalert2'

const router = useRouter()
const authStore = useAuthStore()
const productosStore = useProductosStore()

const loading = ref(true)
const showModal = ref(false)
const modalMode = ref('create') // 'create' o 'edit'
const searchQuery = ref('')
const selectedCategoria = ref('all')
const imageError = ref(false)

const productoForm = ref({
  id: null,
  nombre: '',
  descripcion: '',
  precio_base: '',
  categoria: 'SABANAS',
  subcategoria: '',
  imagenes: [],
  imagen_principal: '',
  stock: 0,
  estado: true,
  descuento: 0,
  created_at: null,
  updated_at: null
})

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
const subcategorias = ['1 PLAZA', '1.5 PLAZAS', '2 PLAZAS', 'KING', 'QUEEN']

onMounted(async () => {
  if (!authStore.isAdmin()) {
    router.push('/')
    return
  }
  
  await loadProductos()
})

const loadProductos = async () => {
  loading.value = true
  try {
    await productosStore.fetchProductos()
  } catch (error) {
    console.error('Error cargando productos:', error)
    alert('Error al cargar productos')
  } finally {
    loading.value = false
  }
}

// Categorías que no requieren tamaño
const categoriaSinTamaño = ['ALMOHADAS', 'SERVICIO', 'PRODUCTO']

// Categorías donde el tamaño es opcional
const categoriaTamañoOpcional = ['RESPALDOS']

// Solo para propósito de validación del formulario
const validarFormularioAntesDeSalvar = (form) => {
  const requiereTamaño = !categoriaSinTamaño.includes(form.categoria)
  const tamañoObligatorio = requiereTamaño && !categoriaTamañoOpcional.includes(form.categoria)
  
  if (tamañoObligatorio && !form.subcategoria) {
    throw new Error('El tamaño es obligatorio para esta categoría')
  }
}

// Calcular precio con descuento
const calcularPrecioConDescuento = (precio, descuento) => {
  if (!precio) return 0;
  const precioNum = parseFloat(precio);
  const descuentoNum = parseFloat(descuento || 0);
  return precioNum - (precioNum * (descuentoNum / 100));
}

const requiereTamaño = computed(() => {
  return !categoriaSinTamaño.includes(productoForm.value.categoria)
})

const requiereTamañoObligatorio = computed(() => {
  return requiereTamaño.value && !categoriaTamañoOpcional.includes(productoForm.value.categoria)
})

const productosFiltrados = computed(() => {
  let filtered = productosStore.productos

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.nombre.toLowerCase().includes(query) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(query))
    )
  }

  if (selectedCategoria.value !== 'all') {
    filtered = filtered.filter(p => p.categoria === selectedCategoria.value)
  }

  return filtered
})

const openCreateModal = () => {
  modalMode.value = 'create'
  productoForm.value = {
    id: null,
    nombre: '',
    descripcion: '',
    precio_base: '',
    categoria: 'SABANAS',
    subcategoria: '',
    imagenes: [],
    imagen_principal: '',
    stock: 0,
    estado: true,
    descuento: 0
  }
  imageError.value = false
  showModal.value = true
}

const openEditModal = (producto) => {
  modalMode.value = 'edit'
  productoForm.value = { 
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio_base: producto.precio_base,
    categoria: producto.categoria,
    subcategoria: producto.subcategoria || '',
    imagenes: producto.imagenes || [],
    imagen_principal: producto.imagen_principal || '',
    stock: producto.stock || 0,
    estado: producto.estado,
    descuento: producto.descuento || 0,
    created_at: producto.created_at,
    updated_at: producto.updated_at
  }
  imageError.value = false
  showModal.value = true
}

const addImage = () => {
  if (!productoForm.value.imagenes) {
    productoForm.value.imagenes = []
  }
  // Limitar a 3 imágenes adicionales (4 en total contando la principal)
  if (productoForm.value.imagenes.length < 3) {
    productoForm.value.imagenes.push('')
  }
}

const removeImage = (index) => {
  productoForm.value.imagenes.splice(index, 1)
}

const closeModal = () => {
  showModal.value = false
  imageError.value = false
}

const validarYProcesarURLImagen = (url) => {
  if (!url || url.trim() === '') return null;
  
  const urlLimpia = url.trim();
  
  // Si la URL ya es absoluta (comienza con http:// o https://)
  if (urlLimpia.startsWith('http://') || urlLimpia.startsWith('https://')) {
    return urlLimpia;
  }
  
  // Si la URL es relativa a la carpeta public
  if (urlLimpia.startsWith('/public/')) {
    return urlLimpia;
  }
  
  // Si es una ruta de la carpeta images
  if (urlLimpia.includes('images/')) {
    return `/public/${urlLimpia.replace(/^\/+/, '')}`;
  }
  
  // En cualquier otro caso, asumimos que es una ruta relativa a la carpeta public/images/productos
  return `/public/images/productos/${urlLimpia.split('/').pop()}`;
}

const saveProducto = async () => {
  try {
    // Validar campos requeridos
    if (!productoForm.value.nombre?.trim()) {
      throw new Error('El nombre del producto es obligatorio');
    }
    if (!productoForm.value.precio_base) {
      throw new Error('El precio base es obligatorio');
    }
    if (!productoForm.value.categoria) {
      throw new Error('La categoría es obligatoria');
    }

    // Validar tamaño según la categoría
    validarFormularioAntesDeSalvar(productoForm.value);

    // Validar imagen principal
    if (!productoForm.value.imagen_principal?.trim()) {
      throw new Error('La imagen principal es obligatoria');
    }

    // Procesar todas las URLs de imágenes
    const imagenesProcesadas = (productoForm.value.imagenes || [])
      .filter(url => url && url.trim()) // Filtrar URLs vacías
      .map(url => validarYProcesarURLImagen(url))
      .filter(url => url !== null); // Filtrar URLs inválidas

    // Preparar datos del producto - solo campos permitidos
    const productoData = {
      id: modalMode.value === 'edit' ? productoForm.value.id : undefined,
      nombre: productoForm.value.nombre.trim(),
      descripcion: productoForm.value.descripcion?.trim() || null,
      precio_base: parseFloat(productoForm.value.precio_base),
      categoria: productoForm.value.categoria,
      subcategoria: productoForm.value.subcategoria || null,
      stock: parseInt(productoForm.value.stock) || 0,
      descuento: parseFloat(productoForm.value.descuento) || 0,
      estado: productoForm.value.estado,
      imagen_principal: validarYProcesarURLImagen(productoForm.value.imagen_principal),
      imagenes: imagenesProcesadas,
      created_at: productoForm.value.created_at,
      updated_at: productoForm.value.updated_at
    };

    // Validar que los números sean válidos
    if (isNaN(productoData.precio_base) || productoData.precio_base <= 0) {
      throw new Error('El precio base debe ser un número válido mayor a 0');
    }
    if (isNaN(productoData.stock) || productoData.stock < 0) {
      throw new Error('El stock debe ser un número válido igual o mayor a 0');
    }

    let mensaje = '';
    if (modalMode.value === 'create') {
      await productosStore.createProducto(productoData);
      mensaje = `Producto "${productoData.nombre}" creado exitosamente`;
    } else {
      await productosStore.updateProducto(productoForm.value.id, productoData);
      mensaje = `Producto "${productoData.nombre}" actualizado exitosamente`;
    }
    
    await Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: mensaje,
      showConfirmButton: false,
      timer: 1500
    });
    
    closeModal();
    await loadProductos(); // Recargar la lista de productos
  } catch (error) {
    console.error('Error guardando producto:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Error al guardar el producto',
      confirmButtonText: 'Entendido'
    });
  }
}

const deleteProducto = async (id, nombre) => {
  // Confirmar con SweetAlert2
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `¿Deseas eliminar el producto "${nombre}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (!result.isConfirmed) return;
  
  try {
    await productosStore.deleteProducto(id);
    await Swal.fire({
      icon: 'success',
      title: 'Eliminado',
      text: `El producto "${nombre}" ha sido eliminado exitosamente`,
      showConfirmButton: false,
      timer: 1500
    });
    await loadProductos(); // Recargar la lista
  } catch (error) {
    console.error('Error eliminando producto:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Error al eliminar el producto',
      confirmButtonText: 'Entendido'
    });
  }
}

const toggleEstado = async (producto) => {
  try {
    await productosStore.toggleEstadoProducto(producto.id);
    const nuevoEstado = !producto.estado;
    
    await Swal.fire({
      icon: 'success',
      title: 'Estado actualizado',
      text: `El producto "${producto.nombre}" ha sido ${nuevoEstado ? 'activado' : 'desactivado'}`,
      showConfirmButton: false,
      timer: 1500
    });
    
    await loadProductos(); // Recargar la lista
  } catch (error) {
    console.error('Error cambiando estado:', error);
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.message || 'Error al cambiar el estado del producto',
      confirmButtonText: 'Entendido'
    });
  }
}
</script>

<template>
  <AdminLayout>
    <div class="container">
      <div class="header">
        <div>
          <h1 class="page-title">Gestión de Productos</h1>
          <p class="subtitle">Administra el catálogo de productos</p>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <i class="fas fa-plus"></i>
          Nuevo Producto
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por nombre, ID o marca..."
          >
        </div>
        
        <div class="filter-group">
          <label>Categoría:</label>
          <select v-model="selectedCategoria">
            <option value="all">Todas</option>
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
      </div>

      <!-- Tabla de Productos -->
      <div class="productos-table">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando productos...</p>
        </div>

        <div v-else-if="productosFiltrados.length === 0" class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No se encontraron productos</p>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio Base</th>
              <th>Descuento</th>
              <th>Precio Final</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="producto in productosFiltrados" :key="producto.id">
              <td>{{ producto.id }}</td>
              <td class="producto-imagen-cell">
                <div class="producto-imagen-mini">
                  <img 
                    v-if="producto.imagen_principal" 
                    :src="producto.imagen_principal" 
                    :alt="producto.nombre"
                    @error="$event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='"
                  >
                  <div v-else class="no-imagen">
                    <i class="fas fa-image"></i>
                  </div>
                </div>
              </td>
              <td class="producto-nombre">{{ producto.nombre }}</td>
              <td>{{ producto.categoria }}</td>
              <td class="precio">S/. {{ parseFloat(producto.precio_base).toFixed(2) }}</td>
              <td class="descuento-cell">
                <span v-if="producto.descuento > 0" class="descuento-badge">
                  {{ producto.descuento }}%
                </span>
                <span v-else>-</span>
              </td>
              <td class="precio-final">
                <template v-if="producto.descuento > 0">
                  <span class="precio-con-descuento">
                    S/. {{ calcularPrecioConDescuento(producto.precio_base, producto.descuento).toFixed(2) }}
                  </span>
                </template>
                <span v-else>-</span>
              </td>
              <td class="text-center">{{ producto.stock }}</td>
              <td>
                <button 
                  class="estado-toggle"
                  :class="producto.estado ? 'activo' : 'inactivo'"
                  @click="toggleEstado(producto)"
                >
                  {{ producto.estado ? 'Activo' : 'Inactivo' }}
                </button>
              </td>
              <td class="acciones">
                <button class="btn-action edit" @click="openEditModal(producto)" title="Editar">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" @click="deleteProducto(producto.id, producto.nombre)" title="Eliminar">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto' }}</h2>
            <button class="btn-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="saveProducto" class="modal-body">
            <div class="form-group">
              <label>Nombre del Producto *</label>
              <input v-model="productoForm.nombre" type="text" required placeholder="Ej: Sabana Premium 2 Plazas">
            </div>

            <div class="form-group">
              <label>Descripción</label>
              <textarea v-model="productoForm.descripcion" rows="3" placeholder="Descripción detallada del producto"></textarea>
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-image"></i>
                Imágenes del Producto
              </label>
              <div class="imagenes-container">
                <!-- Imagen Principal -->
                <div class="imagen-input">
                  <label>Imagen Principal *</label>
                  <input 
                    v-model="productoForm.imagen_principal" 
                    type="url" 
                    placeholder="https://ejemplo.com/imagen.jpg"
                    required
                  >
                  <div v-if="productoForm.imagen_principal" class="image-preview">
                    <img :src="productoForm.imagen_principal" alt="Vista previa" @error="imageError = true">
                  </div>
                </div>
                
                <!-- Imágenes Adicionales -->
                <div class="imagen-input" v-for="(url, index) in productoForm.imagenes" :key="index">
                  <label>Imagen Adicional {{ index + 1 }}</label>
                  <div class="image-input-group">
                    <input 
                      v-model="productoForm.imagenes[index]" 
                      type="url" 
                      placeholder="https://ejemplo.com/imagen.jpg"
                    >
                    <button type="button" class="btn-remove" @click="removeImage(index)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div v-if="url" class="image-preview">
                    <img :src="url" alt="Vista previa adicional">
                  </div>
                </div>
                
                <!-- Botón para agregar más imágenes -->
                <button 
                  type="button" 
                  class="btn-add-image" 
                  @click="addImage"
                  :disabled="productoForm.imagenes && productoForm.imagenes.length >= 3"
                  :class="{ 'disabled': productoForm.imagenes && productoForm.imagenes.length >= 3 }"
                >
                  <i class="fas fa-plus"></i>
                  Agregar Imagen ({{ productoForm.imagenes ? 3 - productoForm.imagenes.length : 3 }} disponibles)
                </button>
              </div>
              <small class="help-text">Ingresa las URLs completas de las imágenes del producto (máximo 3 imágenes adicionales)</small>
              <p v-if="imageError" class="error-text">
                <i class="fas fa-exclamation-triangle"></i>
                No se pudo cargar una o más imágenes. Verifica las URLs.
              </p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Precio Base *</label>
                <input v-model="productoForm.precio_base" type="number" step="0.01" required placeholder="0.00">
              </div>

              <div class="form-group">
                <label>Stock</label>
                <input v-model="productoForm.stock" type="number" min="0" placeholder="0">
              </div>
            </div>

              <div class="form-row">
              <div class="form-group">
                <label>Categoría *</label>
                <select v-model="productoForm.categoria" required @change="productoForm.subcategoria = ''">
                  <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="form-group" v-if="requiereTamaño">
                <label>Tamaño{{ requiereTamañoObligatorio ? ' *' : '' }}</label>
                <select v-model="productoForm.subcategoria" :required="requiereTamañoObligatorio">
                  <option value="">{{ requiereTamañoObligatorio ? 'Seleccione un tamaño' : 'Ninguno' }}</option>
                  <option v-for="subcat in subcategorias" :key="subcat" :value="subcat">{{ subcat }}</option>
                </select>
                <small v-if="!requiereTamañoObligatorio" class="help-text">
                  El tamaño es opcional para esta categoría
                </small>
              </div>
            </div>            <div class="form-group">
              <label>Descuento (%)</label>
              <input 
                v-model="productoForm.descuento" 
                type="number" 
                min="0" 
                max="100" 
                step="0.01"
                placeholder="0"
              >
              <small class="help-text">Ingrese el porcentaje de descuento (0-100)</small>
            </div>

            <div class="form-group">
              <label>Estado</label>
              <select v-model="productoForm.estado">
                <option :value="true">Activo</option>
                <option :value="false">Inactivo</option>
              </select>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-save"></i>
                {{ modalMode === 'create' ? 'Crear' : 'Guardar' }} Producto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<style scoped>

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
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

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

/* Filtros */
.filters-section {
  background: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  margin-bottom: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  box-shadow: var(--shadow-md);
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.search-box input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) var(--spacing-3xl);
  border: 2px solid var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  transition: all var(--transition-fast);
}

.search-box input:focus {
  outline: none;
  border-color: var(--secondary-color);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.filter-group label {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.filter-group select {
  padding: var(--spacing-md);
  border: 2px solid var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--secondary-color);
}

/* Tabla */
.productos-table {
  background: var(--bg-primary);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
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

.empty-state i {
  font-size: 4rem;
  color: var(--text-secondary);
  opacity: 0.5;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: var(--bg-secondary);
}

th {
  padding: var(--spacing-lg);
  text-align: left;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: var(--font-sm);
  text-transform: uppercase;
}

td {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--bg-secondary);
  color: var(--text-primary);
}

tbody tr:hover {
  background: var(--bg-secondary);
}

.producto-imagen-cell {
  padding: var(--spacing-sm) !important;
}

.producto-imagen-mini {
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.producto-imagen-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-fast);
}

tbody tr:hover .producto-imagen-mini img {
  transform: scale(1.1);
}

.no-imagen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  font-size: var(--font-lg);
}

.producto-nombre {
  font-weight: var(--font-semibold);
}

.precio {
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.descuento-cell {
  text-align: center;
}

.descuento-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
}

.precio-final {
  font-weight: var(--font-bold);
  color: var(--secondary-color);
}

.precio-con-descuento {
  position: relative;
  display: inline-block;
}

.descuento-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
}

.text-center {
  text-align: center;
}

.estado-toggle {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  border: none;
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.estado-toggle.activo {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.estado-toggle.inactivo {
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

.btn-action.edit {
  color: var(--secondary-color);
}

.btn-action.edit:hover {
  background: rgba(20, 184, 166, 0.1);
}

.btn-action.delete {
  color: #ef4444;
}

.btn-action.delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-2xl);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
}

.modal-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--bg-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.btn-close {
  background: transparent;
  border: none;
  font-size: var(--font-xl);
  cursor: pointer;
  color: var(--text-secondary);
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
}

.btn-close:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-xl);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  transition: all var(--transition-fast);
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--secondary-color);
}

.form-group textarea {
  resize: vertical;
}

.form-group label i {
  color: var(--secondary-color);
  margin-right: var(--spacing-xs);
}

.help-text {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--text-tertiary);
  font-style: italic;
}

.imagenes-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.imagen-input {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
}

.image-input-group {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-remove {
  padding: var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.2);
}

.btn-add-image {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color);
  color: var(--text-secondary);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.btn-add-image:hover {
  background: var(--bg-tertiary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.btn-add-image.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-tertiary);
}

.btn-add-image.disabled:hover {
  background: var(--bg-secondary);
  border-color: var(--border-color);
  color: var(--text-tertiary);
}

.image-preview {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.image-preview img {
  display: block;
  max-width: 100%;
  max-height: 150px;
  margin: 0 auto;
  object-fit: contain;
  border-radius: var(--border-radius-md);
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  display: block;
  margin: 0 auto;
  background: white;
}

.error-text {
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.error-text i {
  color: #ef4444;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  margin-top: var(--spacing-2xl);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filters-section {
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .productos-table {
    overflow-x: auto;
  }

  table {
    font-size: var(--font-sm);
  }

  th, td {
    padding: var(--spacing-sm);
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
