<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ConfirmModal from './ConfirmModal.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isSidebarOpen = ref(true)
const showLogoutModal = ref(false)

const menuItems = [
  { 
    icon: 'fas fa-home', 
    label: 'Dashboard', 
    path: '/admin',
    exact: true
  },
  { 
    icon: 'fas fa-box', 
    label: 'Productos', 
    path: '/admin/productos' 
  },
  {
    icon: 'fas fa-th-large',
    label: 'Mis Productos',
    path: '/admin/mis-productos'
  },
  { 
    icon: 'fas fa-users', 
    label: 'Usuarios', 
    path: '/admin/usuarios' 
  },
  { 
    icon: 'fas fa-shopping-cart', 
    label: 'Pedidos', 
    path: '/admin/pedidos' 
  },
  { 
    icon: 'fas fa-cogs', 
    label: 'Configuración', 
    path: '/admin/configuracion' 
  }
]

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const isActive = (item) => {
  if (item.exact) {
    return route.path === item.path
  }
  return route.path.startsWith(item.path)
}

const goToHome = () => {
  router.push('/')
}

const handleLogout = () => {
  showLogoutModal.value = true
}

const confirmLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside :class="['admin-sidebar', { 'collapsed': !isSidebarOpen }]">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <i class="fas fa-cog"></i>
          <span v-if="isSidebarOpen" class="brand-text">Admin Panel</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { 'active': isActive(item) }]"
        >
          <i :class="item.icon"></i>
          <span v-if="isSidebarOpen" class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button class="nav-item" @click="goToHome" title="Ir al sitio">
          <i class="fas fa-globe"></i>
          <span v-if="isSidebarOpen" class="nav-label">Ir al Sitio</span>
        </button>
        <button class="nav-item logout-btn" @click="handleLogout" title="Cerrar sesión">
          <i class="fas fa-sign-out-alt"></i>
          <span v-if="isSidebarOpen" class="nav-label">Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="admin-main">
      <!-- Top Bar -->
      <header class="admin-header">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <i :class="isSidebarOpen ? 'fas fa-bars' : 'fas fa-bars'"></i>
        </button>

        <div class="header-actions">
          <button class="header-btn" title="Notificaciones">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </button>
          
          <div class="user-profile">
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=14b8a6&color=fff" 
              alt="User"
              class="user-avatar"
            >
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.nombre || 'Admin' }}</span>
              <span class="user-role">Administrador</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="admin-content">
        <slot></slot>
      </main>
    </div>

    <!-- Modal de confirmación de logout -->
    <ConfirmModal
      v-model:show="showLogoutModal"
      title="Cerrar Sesión"
      message="¿Está seguro que desea cerrar sesión? Tendrá que iniciar sesión nuevamente para acceder al panel de administración."
      confirm-text="Sí, cerrar sesión"
      cancel-text="Cancelar"
      type="danger"
      @confirm="confirmLogout"
    />
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* Sidebar */
.admin-sidebar {
  width: 260px;
  background: white;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.admin-sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-primary);
}

.sidebar-brand i {
  font-size: var(--font-2xl);
  color: var(--secondary-color);
  min-width: 30px;
}

.brand-text {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  white-space: nowrap;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: var(--font-base);
}

.nav-item i {
  font-size: var(--font-lg);
  min-width: 20px;
}

.nav-label {
  white-space: nowrap;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.05));
  color: var(--secondary-color);
  font-weight: var(--font-semibold);
}

.sidebar-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.logout-btn {
  color: #ef4444 !important;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #dc2626 !important;
}

/* Main Content */
.admin-main {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
}

.admin-sidebar.collapsed + .admin-main {
  margin-left: 80px;
}

/* Header */
.admin-header {
  background: white;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 90;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  font-size: var(--font-xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
}

.sidebar-toggle:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.header-btn {
  position: relative;
  background: transparent;
  border: none;
  font-size: var(--font-xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
}

.header-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.user-profile:hover {
  background: var(--bg-secondary);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--border-radius-full);
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--font-sm);
}

.user-role {
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

/* Content */
.admin-content {
  flex: 1;
  padding: var(--spacing-2xl);
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-sidebar {
    width: 80px;
  }

  .admin-main {
    margin-left: 80px;
  }

  .brand-text,
  .nav-label {
    display: none;
  }
}

@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.collapsed {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0;
  }

  .admin-content {
    padding: var(--spacing-lg);
  }

  .user-info {
    display: none;
  }
}
</style>
