<template>
  <table>
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
      <tr v-for="producto in productos" :key="producto.id">
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
            -{{ producto.descuento }}%
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
            @click="$emit('toggle-estado', producto)"
          >
            {{ producto.estado ? 'Activo' : 'Inactivo' }}
          </button>
        </td>
        <td class="acciones">
          <button class="btn-action edit" @click="$emit('editar', producto)" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-action delete" @click="$emit('eliminar', producto)" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  productos: {
    type: Array,
    required: true
  }
})

defineEmits(['toggle-estado', 'editar', 'eliminar'])

const calcularPrecioConDescuento = (precio, descuento) => {
  const precioNum = parseFloat(precio || 0);
  const descuentoNum = parseFloat(descuento || 0);
  return precioNum * (1 - descuentoNum/100);
}
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
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

.producto-imagen-cell {
  width: 80px;
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
}

.producto-imagen-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
</style>