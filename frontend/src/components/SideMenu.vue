<template>
  <aside class="side-menu">
    <div class="side-menu-header">
      <h3>Categorías</h3>
      <p class="side-menu-subtitle">Explora nuestra colección</p>
    </div>
    <ul>
      <li 
        v-for="category in categoriesWithCount" 
        :key="category.key || 'all'" 
        @click="selectCategory(category.key)"
        :class="{ active: category.key === selectedCategory }"
        :title="category.description"
      >
        <div class="category-icon">
          <i class="fas" :class="category.icon"></i>
        </div>
        <div class="category-info">
          <span class="category-name">{{ category.name }}</span>
          <span class="category-count">{{ category.count }} productos</span>
        </div>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  selectedCategory: String,
  productos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['filter']);

// Categorías definidas con mapeo a las categorías de la base de datos
const categories = ref([
  { 
    key: null, 
    name: 'Todas las Categorías', 
    icon: 'fa-th-large', 
    description: 'Ver todos los productos disponibles',
    count: 0
  },
  { 
    key: 'SABANAS', 
    name: 'Sábanas', 
    icon: 'fa-bed', 
    description: 'Juegos de sábanas en diferentes tamaños y materiales',
    count: 0
  },
  { 
    key: 'EDREDRONES', 
    name: 'Edredones', 
    icon: 'fa-cloud', 
    description: 'Edredones cómodos y térmicos',
    count: 0
  },
  { 
    key: 'COBERTORES', 
    name: 'Cobertores', 
    icon: 'fa-square', 
    description: 'Cobertores suaves y abrigadores',
    count: 0
  },
  { 
    key: 'FRAZADAS', 
    name: 'Frazadas', 
    icon: 'fa-layer-group', 
    description: 'Frazadas de alta calidad',
    count: 0
  },
  { 
    key: 'DUVET', 
    name: 'Duvet', 
    icon: 'fa-feather-alt', 
    description: 'Duvets premium para máximo confort',
    count: 0
  },
  { 
    key: 'ALMOHADAS', 
    name: 'Almohadas', 
    icon: 'fa-moon', 
    description: 'Almohadas ergonómicas y cómodas',
    count: 0
  },
  { 
    key: 'PROTECORES', 
    name: 'Protectores', 
    icon: 'fa-shield-alt', 
    description: 'Protectores de colchón impermeables',
    count: 0
  },
  { 
    key: 'FUNDAS_DE_COLCHON', 
    name: 'Fundas de Colchón', 
    icon: 'fa-compress', 
    description: 'Fundas protectoras para colchones',
    count: 0
  },
  { 
    key: 'RESPALDOS', 
    name: 'Respaldos', 
    icon: 'fa-chair', 
    description: 'Respaldos decorativos para camas',
    count: 0
  }
]);

const selectCategory = (categoryKey) => {
  emit('filter', categoryKey);
};

// Computed para categorías con conteo actualizado
const categoriesWithCount = computed(() => {
  const productosActivos = props.productos.filter(p => p.estado === true);
  
  return categories.value.map(category => {
    let count = 0;
    
    if (category.key === null) {
      // Para "Todas las categorías", contar todos los productos activos
      count = productosActivos.length;
    } else {
      // Contar productos que pertenecen a esta categoría específica
      count = productosActivos.filter(p => p.categoria === category.key).length;
    }
    
    return {
      ...category,
      count
    };
  });
});
</script>

<style scoped>
.side-menu {
  width: 320px;
  padding: 2.5rem 2rem;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.9) 0%,
    rgba(248, 250, 252, 0.8) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--border-radius-3xl);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideInLeft 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: sticky;
  top: 100px;
  transition: all 0.3s ease;
}

.side-menu:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 25px 35px -5px rgba(0, 0, 0, 0.15),
    0 15px 15px -5px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.side-menu-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(20, 184, 166, 0.1);
}

h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.side-menu-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

li {
  display: flex;
  align-items: center;
  padding: 1.2rem;
  cursor: pointer;
  border-radius: var(--border-radius-xl);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

li::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s;
}

li:hover::before {
  left: 100%;
}

li:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateX(8px) scale(1.02);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(20, 184, 166, 0.3);
  border-color: rgba(20, 184, 166, 0.2);
  transform: translateX(5px);
  box-shadow: var(--shadow-md);
}

li.active {
  background: var(--gradient-primary);
  color: white;
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-lg);
  transform: translateX(5px) scale(1.02);
}

.category-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--border-radius-lg);
  margin-right: 1rem;
  color: var(--secondary-color);
  font-size: 1.2rem;
  transition: all var(--transition-normal);
}

li:hover .category-icon {
  background: var(--secondary-color);
  color: white;
  transform: scale(1.1);
}

li.active .category-icon {
  background: white;
  color: var(--secondary-color);
  transform: scale(1.1);
}

.category-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.category-name {
  font-size: 1rem;
  font-weight: var(--font-semibold);
  line-height: 1.2;
}

.category-count {
  font-size: 0.8rem;
  color: var(--text-tertiary);
  margin-top: 0.2rem;
  opacity: 0.8;
}

li.active .category-count {
  color: rgba(255, 255, 255, 0.9);
}

li:hover .category-count {
  color: var(--text-secondary);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .side-menu {
    width: 100%;
    margin-bottom: 2rem;
    position: static;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  li:hover, li.active {
    transform: translateY(-5px);
  }
}
</style>