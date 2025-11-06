<template>
  <div class="mis-productos-container">
    <div class="header">
      <div>
        <button @click="goBack" class="btn-back">
          <i class="fas fa-arrow-left"></i>
          Regresar
        </button>
        <h1>Mis Productos</h1>
        <p class="subtitle">Gestiona tu catálogo de productos</p>
      </div>
      <div class="stats">
        <div class="stat-card">
          <i class="fas fa-box"></i>
          <div>
            <div class="stat-number">{{ productos.length }}</div>
            <div class="stat-label">Total Productos</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <div>
            <div class="stat-number">{{ productos.filter(p => p.estado).length }}</div>
            <div class="stat-label">Activos</div>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-warehouse"></i>
          <div>
            <div class="stat-number">{{ productos.reduce((sum, p) => sum + (p.stock || 0), 0) }}</div>
            <div class="stat-label">Stock Total</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="productosStore.loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando productos...</p>
    </div>
    <div v-else-if="productosStore.error" class="error">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{{ productosStore.error }}</p>
    </div>
    <div v-else-if="productos.length === 0" class="empty-state">
      <i class="fas fa-box-open"></i>
      <h3>No tienes productos</h3>
      <p>Comienza agregando tu primer producto al catálogo</p>
    </div>
    <div v-else class="productos-grid">
      <div v-for="producto in productos" :key="producto.id_producto" class="producto-card">
        <div class="producto-header">
          <div class="producto-imagen">
            <img 
              :src="getImageUrl(producto.imagen_principal)" 
              :alt="producto.nombre"
              @error="handleImageError"
            >
            <div v-if="producto.descuento > 0" class="discount-badge">
              {{ producto.descuento }}%
            </div>
          </div>
          <div class="producto-status">
            <span :class="['status-badge', producto.estado ? 'active' : 'inactive']">
              {{ producto.estado ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
        </div>

        <div class="producto-info">
          <div class="categoria-badge">{{ producto.categoria }}</div>
          <h2>{{ producto.nombre }}</h2>
          <p class="descripcion">{{ producto.descripcion || 'Sin descripción' }}</p>

          <div class="precio-section">
            <div class="precio-principal">
              <template v-if="producto.descuento > 0">
                <span class="precio">{{ formatCurrency(producto.precio_base * (1 - producto.descuento/100)) }}</span>
                <span class="precio-original">{{ formatCurrency(producto.precio_base) }}</span>
              </template>
              <template v-else>
                <span class="precio">{{ formatCurrency(producto.precio_base) }}</span>
              </template>
            </div>
          </div>

          <div class="producto-meta">
            <div class="meta-item">
              <i class="fas fa-box"></i>
              <span>Stock: {{ producto.stock || 0 }}</span>
            </div>
            <div v-if="producto.subcategoria" class="meta-item">
              <i class="fas fa-ruler"></i>
              <span>{{ producto.subcategoria }}</span>
            </div>
          </div>

          <!----<div class="producto-acciones">
            <button @click="editarProducto(producto.id_producto)" class="btn-editar">
              <i class="fas fa-edit"></i>
              Editar
            </button>
          </div>----->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useProductosStore } from '@/stores/productosStore';
import { useRouter } from 'vue-router';
import { getAssetBaseUrl } from '@/config/api';

const productosStore = useProductosStore();
const router = useRouter();

onMounted(() => {
  productosStore.fetchProductos();
});

const productos = computed(() => productosStore.productos);

const getImageUrl = (imageName) => {
  if (!imageName) return '/images/placeholder.png'; // Placeholder por si no hay imagen
  
  // Si ya es una URL completa, devolverla
  if (imageName.startsWith('http')) {
    return imageName;
  }
  
  // Construir URL completa usando el asset base URL
  const assetBase = getAssetBaseUrl();
  return `${assetBase}/uploads/${imageName}`;
};

const formatCurrency = (value) => {
  const numericValue = parseFloat(value) || 0;
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

const editarProducto = (id) => {
  router.push({ name: 'AdminEditarProducto', params: { id } });
};

const handleImageError = (event) => {
  // Reemplazar imagen con error por un placeholder
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIxODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0ZDRkOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI4MCIgcj0iMjAiIGZpbGw9IiNhZGIzYmYiLz48cGF0aCBkPSJNODUgODBMMTE1IDExMEwxMTUtNTB6IiBmaWxsPSIjNjk3NTgzIi8+PHRleHQgeD0iMTAwIiB5PSIxNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9IjUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzQ4MCI+QUxTSU1URVg8L3RleHQ+PC9zdmc+';
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.mis-productos-container {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.btn-back {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-back:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-back i {
  font-size: 0.9rem;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
}

.stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 140px;
}

.stat-card i {
  font-size: 2rem;
  color: #14b8a6;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(20, 184, 166, 0.2);
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p, .error p {
  color: #718096;
  font-size: 1.1rem;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.error i {
  font-size: 3rem;
  color: #e53e3e;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  text-align: center;
}

.empty-state i {
  font-size: 4rem;
  color: #cbd5e0;
}

.empty-state h3 {
  color: #4a5568;
  font-size: 1.5rem;
  margin: 0;
}

.empty-state p {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.producto-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.producto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.producto-header {
  position: relative;
}

.producto-imagen {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.producto-card:hover .producto-imagen img {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #e53e3e;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 2;
}

.producto-status {
  position: absolute;
  top: 12px;
  right: 12px;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.status-badge.inactive {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.producto-info {
  padding: 1.5rem;
}

.categoria-badge {
  display: inline-block;
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.producto-info h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.descripcion {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}

.precio-section {
  margin-bottom: 1rem;
}

.precio-principal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.precio {
  font-size: 1.5rem;
  font-weight: bold;
  color: #14b8a6;
}

.precio-original {
  font-size: 1rem;
  color: #a0aec0;
  text-decoration: line-through;
}

.producto-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #718096;
}

.meta-item i {
  color: #14b8a6;
  width: 16px;
}

.producto-acciones {
  display: flex;
  justify-content: flex-end;
}

.btn-editar {
  background: #14b8a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-editar:hover {
  background: #0d9488;
  transform: translateY(-1px);
}

.btn-editar i {
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .mis-productos-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .stats {
    width: 100%;
    justify-content: space-between;
  }

  .stat-card {
    flex: 1;
    min-width: 0;
    padding: 1rem;
  }

  .productos-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .producto-card {
    margin: 0;
  }
}

@media (max-width: 480px) {
  .stats {
    flex-direction: column;
    gap: 0.75rem;
  }

  .stat-card {
    width: 100%;
  }
}
</style>
