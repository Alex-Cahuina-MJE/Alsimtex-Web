<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useUsuariosStore } from '../../stores/usuariosStore'
import { useNotifications } from '../../composables/useNotifications'
import { useConfirm } from '../../composables/useConfirm'
import AdminLayout from '../../components/AdminLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const usuariosStore = useUsuariosStore()
const { addNotification } = useNotifications()
const { confirm } = useConfirm()

const loading = ref(true)
const searchQuery = ref('')
const selectedRol = ref('all')

// Modal y formulario
const showModal = ref(false)
const editingUsuario = ref(null)
const showPassword = ref(false)
const usuarioForm = ref({
  nombre: '',
  email: '',
  password: '',
  rol: 'user'
})

onMounted(async () => {
  if (!authStore.isAdmin()) {
    router.push('/')
    return
  }
  
  await loadUsuarios()
})

const loadUsuarios = async () => {
  loading.value = true
  try {
    await usuariosStore.fetchUsuarios()
  } catch (error) {
    console.error('Error cargando usuarios:', error)
    addNotification('Error al cargar usuarios: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const usuariosFiltrados = computed(() => {
  let filtered = usuariosStore.usuarios

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.nombre.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    )
  }

  if (selectedRol.value !== 'all') {
    filtered = filtered.filter(u => u.rol === selectedRol.value)
  }

  return filtered
})

const getRolClass = (rol) => {
  return rol === 'admin' ? 'rol-admin' : 'rol-cliente'
}

const openCreateModal = () => {
  editingUsuario.value = null
  usuarioForm.value = {
    nombre: '',
    email: '',
    password: '',
    rol: 'user'
  }
  showModal.value = true
}

const openEditModal = (usuario) => {
  editingUsuario.value = usuario
  usuarioForm.value = {
    nombre: usuario.nombre,
    email: usuario.email,
    password: '', // No mostrar password actual
    rol: usuario.rol
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUsuario.value = null
  showPassword.value = false
  usuarioForm.value = {
    nombre: '',
    email: '',
    password: '',
    rol: 'user'
  }
}

const saveUsuario = async () => {
  try {
    if (editingUsuario.value) {
      // Actualizar
      const dataToUpdate = {
        nombre: usuarioForm.value.nombre,
        email: usuarioForm.value.email,
        rol: usuarioForm.value.rol
      }
      // Solo agregar password si se ingresó uno nuevo
      if (usuarioForm.value.password) {
        dataToUpdate.password = usuarioForm.value.password
      }
      
      await usuariosStore.updateUsuario(editingUsuario.value.id, dataToUpdate)
      addNotification('Usuario actualizado exitosamente', 'success')
    } else {
      // Crear nuevo
      if (!usuarioForm.value.password) {
        addNotification('La contraseña es requerida para crear un usuario', 'warning')
        return
      }
      await usuariosStore.createUsuario(usuarioForm.value)
      addNotification('Usuario creado exitosamente', 'success')
    }
    
    closeModal()
    await loadUsuarios()
  } catch (error) {
    console.error('Error guardando usuario:', error)
    alert(error.message || 'Error al guardar usuario')
  }
}

const cambiarRol = async (usuario) => {
  if (usuario.id === authStore.user?.id) {
    addNotification('No puedes cambiar tu propio rol', 'warning')
    return
  }
  
  const nuevoRol = usuario.rol === 'admin' ? 'user' : 'admin'
  
  const confirmed = await confirm({
    title: 'Cambiar Rol de Usuario',
    message: `¿Estás seguro de cambiar el rol de ${usuario.nombre} a ${nuevoRol}?`,
    confirmText: 'Sí, cambiar rol',
    cancelText: 'Cancelar',
    type: 'info'
  })
  
  if (!confirmed) return
  
  try {
    await usuariosStore.cambiarRol(usuario.id, nuevoRol)
    addNotification(`Rol de ${usuario.nombre} cambiado a ${nuevoRol}`, 'success')
    await loadUsuarios()
  } catch (error) {
    console.error('Error cambiando rol:', error)
    addNotification('Error al cambiar rol: ' + error.message, 'error')
  }
}

const deleteUsuario = async (usuario) => {
  if (usuario.id === authStore.user?.id) {
    addNotification('No puedes eliminar tu propio usuario', 'warning')
    return
  }
  
  const confirmed = await confirm({
    title: 'Eliminar Usuario',
    message: `¿Estás seguro de eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
    confirmText: 'Sí, eliminar',
    cancelText: 'Cancelar',
    type: 'danger'
  })
  
  if (!confirmed) return
  
  try {
    await usuariosStore.deleteUsuario(usuario.id)
    addNotification(`Usuario ${usuario.nombre} eliminado exitosamente`, 'success')
    await loadUsuarios()
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    addNotification('Error al eliminar usuario: ' + error.message, 'error')
  }
}
</script>

<template>
  <AdminLayout>
    <div class="container">
      <div class="header">
        <div>
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="subtitle">Administra los usuarios del sistema</p>
        </div>
        <button class="btn-primary" @click="openCreateModal">
          <i class="fas fa-user-plus"></i>
          Nuevo Usuario
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filters-section">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar por nombre o email..."
          >
        </div>
        
        <div class="filter-group">
          <label>Rol:</label>
          <select v-model="selectedRol">
            <option value="all">Todos</option>
            <option value="admin">Administradores</option>
            <option value="user">Clientes</option>
          </select>
        </div>

        <div class="stats">
          <span>Total: {{ usuariosFiltrados.length }}</span>
        </div>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="usuarios-table">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>

        <div v-else-if="usuariosFiltrados.length === 0" class="empty-state">
          <i class="fas fa-users-slash"></i>
          <p>No se encontraron usuarios</p>
        </div>

        <table v-else>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
              <td>#{{ usuario.id }}</td>
              <td class="usuario-nombre">
                <i class="fas fa-user-circle"></i>
                {{ usuario.nombre }}
              </td>
              <td>{{ usuario.email }}</td>
              <td>
                <span class="rol-badge" :class="getRolClass(usuario.rol)">
                  {{ usuario.rol === 'admin' ? 'Administrador' : 'Cliente' }}
                </span>
              </td>
              <td>{{ new Date(usuario.created_at).toLocaleDateString('es-PE') }}</td>
              <td class="acciones">
                <button 
                  class="btn-action edit" 
                  @click="openEditModal(usuario)" 
                  title="Editar usuario"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="btn-action rol" 
                  @click="cambiarRol(usuario)" 
                  title="Cambiar rol"
                  v-if="usuario.id !== authStore.user?.id"
                >
                  <i class="fas fa-user-shield"></i>
                </button>
                <button 
                  class="btn-action delete" 
                  @click="deleteUsuario(usuario)" 
                  title="Eliminar usuario"
                  v-if="usuario.id !== authStore.user?.id"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal para Crear/Editar Usuario -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
            <button class="btn-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="saveUsuario" class="usuario-form">
            <div class="form-group">
              <label for="nombre">
                <i class="fas fa-user"></i>
                Nombre Completo *
              </label>
              <input 
                id="nombre"
                v-model="usuarioForm.nombre" 
                type="text" 
                required
                placeholder="Ej: Juan Pérez"
              >
            </div>

            <div class="form-group">
              <label for="email">
                <i class="fas fa-envelope"></i>
                Email *
              </label>
              <input 
                id="email"
                v-model="usuarioForm.email" 
                type="email" 
                required
                placeholder="ejemplo@correo.com"
              >
            </div>

            <div class="form-group">
              <label for="password">
                <i class="fas fa-lock"></i>
                Contraseña {{ editingUsuario ? '(dejar vacío para mantener)' : '*' }}
              </label>
              <div class="password-input-wrapper">
                <input 
                  id="password"
                  v-model="usuarioForm.password" 
                  :type="showPassword ? 'text' : 'password'"
                  :required="!editingUsuario"
                  placeholder="Mínimo 6 caracteres"
                  minlength="6"
                >
                <button 
                  type="button" 
                  class="toggle-password" 
                  @click="showPassword = !showPassword"
                  :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="rol">
                <i class="fas fa-user-tag"></i>
                Rol *
              </label>
              <select id="rol" v-model="usuarioForm.rol" required>
                <option value="user">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn-primary">
                <i class="fas fa-save"></i>
                {{ editingUsuario ? 'Actualizar' : 'Crear' }} Usuario
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
  margin-bottom: var(--spacing-3xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--bg-secondary);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-secondary:hover {
  background: var(--bg-primary);
  border-color: var(--secondary-color);
}

.filters-section {
  background: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  margin-bottom: var(--spacing-xl);
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  align-items: center;
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
}

.stats {
  margin-left: auto;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.usuarios-table {
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

@keyframes spin {
  to { transform: rotate(360deg); }
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

.usuario-nombre {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-semibold);
}

.usuario-nombre i {
  color: var(--secondary-color);
}

.rol-badge {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
}

.rol-admin {
  background: rgba(147, 51, 234, 0.1);
  color: #9333ea;
}

.rol-cliente {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
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
  color: var(--secondary-color);
}

.btn-action:hover {
  background: rgba(20, 184, 166, 0.1);
  transform: scale(1.1);
}

.btn-action.edit {
  color: #3b82f6;
}

.btn-action.edit:hover {
  background: rgba(59, 130, 246, 0.1);
}

.btn-action.rol {
  color: #9333ea;
}

.btn-action.rol:hover {
  background: rgba(147, 51, 234, 0.1);
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
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--border-radius-2xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 2px solid var(--bg-secondary);
}

.modal-header h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.btn-close {
  background: transparent;
  border: none;
  font-size: var(--font-2xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: all var(--transition-fast);
}

.btn-close:hover {
  color: var(--primary-color);
  transform: rotate(90deg);
}

.usuario-form {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-xl);
}

.form-group label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.form-group label i {
  color: var(--secondary-color);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
  padding-right: 45px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px 10px;
  font-size: 1.1rem;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: var(--secondary-color);
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
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--secondary-color);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 2px solid var(--bg-secondary);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    justify-content: center;
  }

  .usuarios-table {
    overflow-x: auto;
  }

  table {
    font-size: var(--font-sm);
  }

  th, td {
    padding: var(--spacing-sm);
  }
}
</style>
