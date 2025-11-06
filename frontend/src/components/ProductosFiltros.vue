<script setup>
import { ref } from 'vue'

const props = defineProps({
  categorias: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['buscar', 'filtrar', 'ordenar'])

// Estado para categorías expandidas
const categoriasExpandidas = ref({})

// Organizar categorías en jerarquía
const categoriasOrganizadas = ref([
  {
    nombre: 'Dormitorio',
    icono: 'fa-bed',
    subcategorias: ['SABANAS', 'EDREDONES', 'FUNDAS', 'CORTINAS']
  },
  {
    nombre: 'Productos Terminados',
    icono: 'fa-box',
    subcategorias: []
  },
  {
    nombre: 'Telas',
    icono: 'fa-cut',
    subcategorias: ['ALGODÓN', 'POLIÉSTER', 'MICROFIBRA']
  }
])

const ordenarOpciones = [
  { valor: 'nombre-asc', texto: 'Nombre (A-Z)', icono: 'fa-sort-alpha-down' },
  { valor: 'nombre-desc', texto: 'Nombre (Z-A)', icono: 'fa-sort-alpha-up' },
  { valor: 'fecha-nuevo', texto: 'Más nuevos', icono: 'fa-clock' },
  { valor: 'fecha-antiguo', texto: 'Más antiguos', icono: 'fa-history' }
]

const categoriaSeleccionada = ref('')
const subcategoriaSeleccionada = ref('')
const ordenSeleccionado = ref('')

const toggleCategoria = (categoria) => {
  categoriasExpandidas.value[categoria] = !categoriasExpandidas.value[categoria]
}

const seleccionarCategoria = (categoria) => {
  categoriaSeleccionada.value = categoria
  subcategoriaSeleccionada.value = ''
  emit('filtrar', { tipo: 'categoria', valor: categoria })
}

const seleccionarSubcategoria = (subcategoria) => {
  subcategoriaSeleccionada.value = subcategoria
  emit('filtrar', { tipo: 'subcategoria', valor: subcategoria })
}

const limpiarFiltros = () => {
  categoriaSeleccionada.value = ''
  subcategoriaSeleccionada.value = ''
  ordenSeleccionado.value = ''
  emit('filtrar', { tipo: 'categoria', valor: '' })
  emit('ordenar', '')
}
</script>

<template>
  <aside class="filtros-sidebar">
    <!-- Búsqueda -->
    <div class="sidebar-section search-section">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          @input="e => emit('buscar', e.target.value)"
          class="search-input"
        >
      </div>
    </div>

    <!-- Filtros activos -->
    <div v-if="categoriaSeleccionada || subcategoriaSeleccionada" class="sidebar-section">
      <div class="active-filters">
        <div class="filter-header">
          <h4><i class="fas fa-filter"></i> Filtros Activos</h4>
          <button @click="limpiarFiltros" class="btn-clear">
            <i class="fas fa-times"></i> Limpiar
          </button>
        </div>
        <div class="filter-tags">
          <span v-if="categoriaSeleccionada" class="filter-tag">
            {{ categoriaSeleccionada }}
            <i class="fas fa-times" @click="seleccionarCategoria('')"></i>
          </span>
          <span v-if="subcategoriaSeleccionada" class="filter-tag">
            {{ subcategoriaSeleccionada }}
            <i class="fas fa-times" @click="seleccionarSubcategoria('')"></i>
          </span>
        </div>
      </div>
    </div>

    <!-- Categorías -->
    <div class="sidebar-section">
      <h3 class="section-title">
        <i class="fas fa-th-large"></i>
        Categorías
      </h3>
      
      <nav class="categories-nav">
        <div 
          v-for="cat in categoriasOrganizadas" 
          :key="cat.nombre"
          class="category-item"
        >
          <div 
            class="category-header"
            :class="{ active: categoriaSeleccionada === cat.nombre }"
            @click="cat.subcategorias.length > 0 ? toggleCategoria(cat.nombre) : seleccionarCategoria(cat.nombre)"
          >
            <div class="category-title">
              <i class="fas" :class="cat.icono"></i>
              <span>{{ cat.nombre }}</span>
            </div>
            <i 
              v-if="cat.subcategorias.length > 0"
              class="fas fa-chevron-down toggle-icon"
              :class="{ rotated: categoriasExpandidas[cat.nombre] }"
            ></i>
          </div>
          
          <transition name="expand">
            <ul v-if="categoriasExpandidas[cat.nombre]" class="subcategories-list">
              <li 
                v-for="sub in cat.subcategorias" 
                :key="sub"
                class="subcategory-item"
                :class="{ active: subcategoriaSeleccionada === sub }"
                @click="seleccionarSubcategoria(sub)"
              >
                <i class="fas fa-angle-right"></i>
                <span>{{ sub }}</span>
              </li>
            </ul>
          </transition>
        </div>
        
        <!-- Todas las categorías -->
        <div class="category-item">
          <div 
            class="category-header all-categories"
            :class="{ active: !categoriaSeleccionada }"
            @click="seleccionarCategoria('')"
          >
            <div class="category-title">
              <i class="fas fa-list"></i>
              <span>Todas las Categorías</span>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- Ordenar -->
    <div class="sidebar-section">
      <h3 class="section-title">
        <i class="fas fa-sort"></i>
        Ordenar por
      </h3>
      
      <div class="sort-options">
        <label 
          v-for="opcion in ordenarOpciones" 
          :key="opcion.valor"
          class="sort-option"
          :class="{ active: ordenSeleccionado === opcion.valor }"
        >
          <input 
            type="radio" 
            :value="opcion.valor"
            v-model="ordenSeleccionado"
            @change="emit('ordenar', opcion.valor)"
            class="sort-radio"
          >
          <span class="sort-label">
            <i class="fas" :class="opcion.icono"></i>
            {{ opcion.texto }}
          </span>
        </label>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Sidebar principal */
.filtros-sidebar {
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  position: sticky;
  top: var(--spacing-xl);
}

/* Secciones */
.sidebar-section {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-section:last-child {
  border-bottom: none;
}

/* Búsqueda */
.search-section {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(20, 184, 166, 0.05));
}

.search-box {
  position: relative;
}

.search-box i {
  position: absolute;
  left: var(--spacing-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
  font-size: var(--font-lg);
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) calc(var(--spacing-3xl));
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  transition: all var(--transition-normal);
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Filtros activos */
.active-filters {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.filter-header h4 {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.filter-header h4 i {
  color: var(--primary-color);
}

.btn-clear {
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: var(--font-xs);
  cursor: pointer;
  padding: var(--spacing-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.btn-clear:hover {
  color: var(--primary-dark);
  transform: scale(1.05);
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-medium);
}

.filter-tag i {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.filter-tag i:hover {
  opacity: 1;
}

/* Título de sección */
.section-title {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--primary-color);
}

.section-title i {
  color: var(--primary-color);
}

/* Navegación de categorías */
.categories-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.category-item {
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-md);
  border: 2px solid transparent;
}

.category-header:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
  transform: translateX(4px);
}

.category-header.active {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(20, 184, 166, 0.1));
  border-color: var(--primary-color);
  font-weight: var(--font-bold);
}

.category-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-base);
  color: var(--text-primary);
}

.category-title i {
  color: var(--primary-color);
  font-size: var(--font-lg);
  width: 24px;
  text-align: center;
}

.toggle-icon {
  color: var(--text-secondary);
  transition: transform var(--transition-normal);
  font-size: var(--font-sm);
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* Subcategorías */
.subcategories-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-sm) 0 var(--spacing-sm) var(--spacing-2xl);
}

.subcategory-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.subcategory-item:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
  transform: translateX(4px);
}

.subcategory-item.active {
  background: var(--primary-color);
  color: white;
  font-weight: var(--font-semibold);
}

.subcategory-item i {
  font-size: var(--font-xs);
}

/* Todas las categorías */
.all-categories {
  border-color: var(--border-color);
}

.all-categories:hover {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(20, 184, 166, 0.05));
}

/* Opciones de ordenamiento */
.sort-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.sort-option {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-md);
  border: 2px solid var(--border-color);
}

.sort-option:hover {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.sort-option.active {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(20, 184, 166, 0.1));
  border-color: var(--primary-color);
  font-weight: var(--font-semibold);
}

.sort-radio {
  margin-right: var(--spacing-md);
  accent-color: var(--primary-color);
  cursor: pointer;
}

.sort-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-sm);
  color: var(--text-primary);
}

.sort-label i {
  color: var(--primary-color);
  width: 20px;
  text-align: center;
}

/* Animación de expansión */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.expand-enter-to {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.expand-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 1024px) {
  .filtros-sidebar {
    position: static;
    margin-bottom: var(--spacing-xl);
  }
  
  .sidebar-section {
    padding: var(--spacing-lg);
  }
  
  .section-title {
    font-size: var(--font-base);
  }
}

@media (max-width: 768px) {
  .filtros-sidebar {
    border-radius: var(--border-radius-lg);
  }
  
  .sidebar-section {
    padding: var(--spacing-md);
  }
  
  .section-title {
    font-size: var(--font-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .search-input {
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) calc(var(--spacing-2xl) + var(--spacing-sm));
    font-size: var(--font-sm);
  }
  
  .search-box i {
    left: var(--spacing-sm);
    font-size: var(--font-base);
  }
  
  .category-header {
    padding: var(--spacing-sm);
  }
  
  .category-title {
    font-size: var(--font-sm);
    gap: var(--spacing-sm);
  }
  
  .category-title i {
    font-size: var(--font-base);
    width: 20px;
  }
  
  .subcategories-list {
    margin-left: var(--spacing-xl);
  }
  
  .subcategory-item {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
  
  .sort-option {
    padding: var(--spacing-sm);
  }
  
  .sort-label {
    font-size: var(--font-xs);
  }
  
  .filter-tag {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
  
  .filter-header h4 {
    font-size: var(--font-xs);
  }
  
  .btn-clear {
    font-size: 0.7rem;
    padding: 4px;
  }
}

@media (max-width: 480px) {
  .filtros-sidebar {
    box-shadow: var(--shadow-sm);
  }
  
  .sidebar-section {
    padding: var(--spacing-sm);
  }
  
  .section-title {
    font-size: 0.9rem;
    gap: var(--spacing-xs);
    padding-bottom: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }
  
  .search-section {
    padding: var(--spacing-md);
  }
  
  .search-input {
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) var(--spacing-2xl);
    font-size: 0.8rem;
  }
  
  .search-box i {
    font-size: 0.9rem;
  }
  
  .active-filters {
    padding: var(--spacing-sm);
  }
  
  .categories-nav {
    gap: 4px;
  }
  
  .category-header {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .category-title {
    font-size: 0.8rem;
    gap: var(--spacing-xs);
  }
  
  .category-title i {
    font-size: 0.9rem;
    width: 18px;
  }
  
  .toggle-icon {
    font-size: 0.7rem;
  }
  
  .subcategories-list {
    margin-left: var(--spacing-lg);
    margin-top: 4px;
  }
  
  .subcategory-item {
    padding: 6px var(--spacing-sm);
    font-size: 0.75rem;
  }
  
  .sort-options {
    gap: 4px;
  }
  
  .sort-option {
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .sort-radio {
    margin-right: var(--spacing-sm);
  }
  
  .sort-label {
    font-size: 0.75rem;
    gap: var(--spacing-xs);
  }
  
  .sort-label i {
    width: 16px;
    font-size: 0.8rem;
  }
  
  .filter-tags {
    gap: 4px;
  }
  
  .filter-tag {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
  
  .filter-header {
    margin-bottom: 6px;
  }
  
  .filter-header h4 {
    font-size: 0.7rem;
  }
  
  .btn-clear {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
}

/* Landscape móvil */
@media (max-width: 896px) and (orientation: landscape) {
  .filtros-sidebar {
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .sidebar-section {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .categories-nav {
    max-height: 30vh;
    overflow-y: auto;
  }
}
</style>