<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia'
import logoImage from '../assets/images/logo/logo.png'
import ShoppingCartPro from './ShoppingCartPro.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { totalItems } = storeToRefs(cartStore)

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const showUserMenu = ref(false)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('click', handleClickOutside)
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  authStore.logout()
  showUserMenu.value = false
  router.push('/')
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleHomeClick = () => {
  closeMobileMenu()
  if (router.currentRoute.value.path === '/') {
    scrollToTop()
  }
}
</script>

<template>
  <nav :class="['navbar', { 'scrolled': isScrolled }]">
    <div class="container nav-container">
      <div class="nav-brand">
        <router-link to="/" class="brand-link" @click="closeMobileMenu">
          <div class="logo-container">
            <img :src="logoImage" alt="ALSIMTEX Logo" class="brand-logo">
          </div>
        </router-link>
      </div>
      
      <div :class="['nav-links', { 'mobile-open': isMobileMenuOpen }]">
        <router-link to="/" class="nav-link" @click="handleHomeClick">
          <div class="link-content">
            <i class="fas fa-home"></i>
            <span>Inicio</span>
          </div>
          <div class="link-indicator"></div>
        </router-link>
        <router-link to="/productos" class="nav-link" @click="closeMobileMenu">
          <div class="link-content">
            <i class="fas fa-shopping-bag"></i>
            <span>Productos</span>
          </div>
          <div class="link-indicator"></div>
        </router-link>
        <router-link to="/nosotros" class="nav-link" @click="closeMobileMenu">
          <div class="link-content">
            <i class="fas fa-users"></i>
            <span>Nosotros</span>
          </div>
          <div class="link-indicator"></div>
        </router-link>
        <router-link to="/contacto" class="nav-link" @click="closeMobileMenu">
          <div class="link-content">
            <i class="fas fa-envelope"></i>
            <span>Contáctanos</span>
          </div>
          <div class="link-indicator"></div>
        </router-link>
        <router-link 
          v-if="authStore.isAuthenticated() && !authStore.isAdmin()" 
          to="/mis-pedidos" 
          class="nav-link" 
          @click="closeMobileMenu"
        >
          <div class="link-content">
            <i class="fas fa-box"></i>
            <span>Mis Pedidos</span>
          </div>
          <div class="link-indicator"></div>
        </router-link>
      </div>
      
      <div class="nav-actions">
        <button class="nav-action-btn" title="Buscar">
          <i class="fas fa-search"></i>
          <span class="btn-ripple"></span>
        </button>
        <button class="nav-action-btn cart-btn" 
                title="Carrito" 
                @click="cartStore.toggleCart">
          <i class="fas fa-shopping-cart"></i>
          <span class="cart-count" v-if="totalItems > 0">{{ totalItems }}</span>
          <span class="btn-ripple"></span>
        </button>
        <div class="user-menu">
          <button class="nav-action-btn" title="Usuario" @click="toggleUserMenu">
            <i class="fas fa-user"></i>
            <span class="btn-ripple"></span>
          </button>
          <div v-if="showUserMenu" class="user-dropdown">
            <template v-if="authStore.isAuthenticated()">
              <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <span>{{ authStore.user.nombre }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <router-link 
                v-if="authStore.isAdmin()" 
                to="/admin" 
                class="dropdown-item admin-link" 
                @click="showUserMenu = false"
              >
                <i class="fas fa-cog"></i>
                Panel Admin
              </router-link>
              <router-link 
                v-if="authStore.isAdmin()" 
                to="/admin/editar-productos" 
                class="dropdown-item admin-link" 
                @click="showUserMenu = false"
              >
                <i class="fas fa-edit"></i>
                Editar Productos
              </router-link>
              <router-link 
                v-if="!authStore.isAdmin()" 
                to="/mis-pedidos" 
                class="dropdown-item" 
                @click="showUserMenu = false"
              >
                <i class="fas fa-box"></i>
                Mis Pedidos
              </router-link>
              <button class="dropdown-item" @click="handleLogout">
                <i class="fas fa-sign-out-alt"></i>
                Cerrar Sesión
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="dropdown-item" @click="showUserMenu = false">
                <i class="fas fa-sign-in-alt"></i>
                Iniciar Sesión
              </router-link>
              <router-link to="/register" class="dropdown-item" @click="showUserMenu = false">
                <i class="fas fa-user-plus"></i>
                Registrarse
              </router-link>
            </template>
          </div>
        </div>
      </div>

      <button class="mobile-menu-btn" @click="toggleMobileMenu" :class="{ 'active': isMobileMenuOpen }">
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>
    </div>

    <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
    <ShoppingCartPro />
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 85px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: var(--z-fixed);
  transition: all var(--transition-slow);
  animation: navbarFloat 6s ease-in-out infinite;
}

@keyframes navbarFloat {
  0%, 100% {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  }
}

.navbar.scrolled {
  height: 75px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  animation: none;
}

.nav-container {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-xl);
}

/* Brand Styles */
.nav-brand {
  flex-shrink: 0;
  z-index: 11;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-fast);
  position: relative;
  background: transparent;
}

.logo-container {
  height: 70px;
  display: flex;
  align-items: center;
  transition: all var(--transition-fast);
  background: transparent;
}

.brand-logo {
  height: 100%;
  width: auto;
  object-fit: contain;
  transition: all var(--transition-fast);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  background: transparent;
}

.brand-link:hover .logo-container {
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .logo-container {
    height: 60px;
  }
}

@media (max-width: 480px) {
  .logo-container {
    height: 50px;
  }
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  justify-content: center;
}

.nav-link {
  position: relative;
  text-decoration: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.link-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: rgba(255, 255, 255, 0.95);
  font-weight: var(--font-semibold);
  font-size: var(--font-base);
  transition: all var(--transition-fast);
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.navbar.scrolled .link-content {
  color: var(--text-primary);
  text-shadow: none;
}

.link-content i {
  font-size: 1.1rem;
  transition: transform var(--transition-fast);
}

.nav-link:hover .link-content {
  color: var(--secondary-color);
}

.nav-link:hover .link-content i {
  transform: translateY(-2px);
}

.link-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 60%;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-full);
  transition: transform var(--transition-fast);
}

.nav-link:hover .link-indicator {
  transform: translateX(-50%) scaleX(1);
}

.nav-link.router-link-active {
  background: rgba(20, 184, 166, 0.08);
}

.nav-link.router-link-active .link-content {
  color: var(--secondary-color);
  font-weight: var(--font-semibold);
}

.nav-link.router-link-active .link-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* Action Buttons */
.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.nav-action-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.2rem;
  padding: 0;
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.navbar.scrolled .nav-action-btn {
  background: rgba(255, 255, 255, 0.8);
  color: var(--text-primary);
  border-color: rgba(0, 0, 0, 0.1);
}

.nav-action-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-full);
  opacity: 0;
  transition: opacity var(--transition-fast);
  z-index: 0;
}

.nav-action-btn:hover::before {
  opacity: 0.15;
}

.nav-action-btn i {
  position: relative;
  z-index: 1;
  transition: all var(--transition-fast);
}

.nav-action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.navbar.scrolled .nav-action-btn:hover {
  background: var(--secondary-color);
  color: white;
  border-color: var(--secondary-color);
}

.nav-action-btn:hover i {
  transform: scale(1.1);
}

.nav-action-btn:active {
  transform: translateY(0) scale(0.95);
}

.cart-btn {
  position: relative;
}

.cart-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--gradient-secondary);
  color: white;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  box-shadow: var(--shadow-md);
  z-index: 2;
  border: 2px solid white;
}

.btn-ripple {
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius-full);
  pointer-events: none;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 11;
  padding: 0;
  gap: 6px;
}

.hamburger-line {
  width: 28px;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
  transform-origin: center;
}

.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
  transform: scaleX(0);
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

.mobile-overlay {
  display: none;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.9;
  }
}

/* User Menu Styles */
.user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-2xl);
  min-width: 200px;
  padding: var(--spacing-md);
  margin-top: var(--spacing-md);
  animation: fadeInDown 0.3s ease-out;
  border: 1px solid var(--border-color);
  z-index: 1000;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}

.user-info i {
  font-size: 1.5rem;
  color: var(--secondary-color);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--spacing-sm) 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  font-size: var(--font-base);
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--secondary-color);
}

.dropdown-item i {
  width: 20px;
  text-align: center;
}

.admin-link {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(20, 184, 166, 0.1));
  border: 1px solid rgba(147, 51, 234, 0.2);
  font-weight: var(--font-semibold);
}

.admin-link:hover {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(20, 184, 166, 0.2));
  border-color: rgba(147, 51, 234, 0.4);
}

.admin-link i {
  color: #9333ea;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-links {
    gap: var(--spacing-xs);
  }
  
  .nav-link {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .link-content {
    font-size: var(--font-sm);
  }
  
  .nav-actions {
    gap: var(--spacing-xs);
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 65px;
    padding: 0 var(--spacing-sm);
  }

  .navbar.scrolled {
    height: 60px;
  }
  
  .nav-container {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .mobile-menu-btn {
    display: flex;
    z-index: 1001;
  }
  
  .logo-container {
    height: 45px;
  }
  
  .nav-links {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    height: auto;
    max-height: min(400px, 70vh);
    background: white;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 0.5rem;
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.2s ease-out;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow-y: auto;
    z-index: 1000;
    display: flex;
  }

  .nav-links.mobile-open {
    transform: translateY(0);
    opacity: 1;
  }

  .nav-links.mobile-open {
    transform: translateX(0);
    opacity: 1;
  }

  .nav-link {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    margin-bottom: 0.25rem;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
    text-align: left;
    border: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    color: #374151;
  }
  
  .nav-link:hover,
  .nav-link.router-link-active {
    background: #f97316;
    color: white;
    border-color: #f97316;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(249, 115, 22, 0.1);
  }

  .nav-link:active {
    transform: translateY(0);
  }
  
  .nav-link.router-link-active {
    background: rgba(20, 184, 166, 0.1);
  }

  .link-content {
    font-size: 0.875rem;
    gap: 0.5rem;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .link-content i {
    font-size: 1rem;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #6b7280;
    transition: all 0.2s ease;
  }

  .nav-link:hover .link-content i,
  .nav-link.router-link-active .link-content i {
    background: rgba(255, 255, 255, 0.2);
    transform: none;
  }

  .link-indicator {
    display: none;
  }

  .nav-link:hover .link-indicator,
  .nav-link.router-link-active .link-indicator {
    transform: translateX(0);
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 56px 0 0 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 9;
    animation: fadeIn 0.2s ease-out;
  }

  .nav-link:hover,
  .nav-link.router-link-active {
    background: #fff8f3;
    color: #f97316;
  }

  .nav-link:hover .link-content i,
  .nav-link.router-link-active .link-content i {
    color: #f97316;
  }

  .nav-actions {
    gap: var(--spacing-xs);
  }

  .nav-action-btn {
    width: 40px;
    height: 40px;
    font-size: 1.1rem;
  }
  
  .cart-count {
    min-width: 18px;
    height: 18px;
    font-size: 0.7rem;
  }

  .logo-container {
    height: 60px;
  }
  
  .user-dropdown {
    right: 0;
    min-width: 180px;
  }
}

@media (max-width: 480px) {
  .navbar {
    height: 56px;
    padding: 0;
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  
  .navbar.scrolled {
    height: 56px;
    border-bottom: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .nav-container {
    padding: 0 1rem;
    gap: 0.5rem;
  }
  
  .logo-container {
    height: 40px;
  }
  
  .mobile-menu-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
  }

  .mobile-menu-btn:active {
    background: rgba(0,0,0,0.05);
  }
  
  .nav-links {
    padding: 4.5rem 1rem 1rem;
    gap: 0.5rem;
  }

  .nav-links.mobile-open {
    transform: translateX(0);
    opacity: 1;
  }
  
  .nav-link {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-base);
    margin-bottom: var(--spacing-sm);
  }
  
  .nav-actions {
    gap: 4px;
  }
  
  .nav-action-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
.cart-count {
  min-width: 16px;
  height: 16px;
  font-size: 0.65rem;
  top: -2px;
  right: -2px;
}

.nav-container {
  gap: var(--spacing-md);
  padding: 0 var(--spacing-sm);
}
  
  .nav-links {
    top: 60px;
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .nav-link {
    padding: var(--spacing-md);
  }
  
  .link-content {
    font-size: var(--font-base);
  }
  
  .link-content i {
    font-size: 1.2rem;
  }

  .logo-container {
    height: 50px;
  }

  .nav-action-btn {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }
  
  .cart-count {
    min-width: 16px;
    height: 16px;
    font-size: 0.65rem;
    top: -1px;
    right: -1px;
    border-width: 1.5px;
  }
  
  .mobile-menu-btn {
    width: 40px;
    height: 40px;
  }
  
  .hamburger-line {
    width: 24px;
    height: 2.5px;
  }
  
  .mobile-menu-btn.active .hamburger-line:nth-child(1) {
    transform: translateY(7.5px) rotate(45deg);
  }
  
  .mobile-menu-btn.active .hamburger-line:nth-child(3) {
    transform: translateY(-7.5px) rotate(-45deg);
  }
  
  .user-dropdown {
    min-width: 160px;
    padding: var(--spacing-sm);
  }
  
  .dropdown-item {
    padding: var(--spacing-sm);
    font-size: var(--font-sm);
  }
  
  .user-info {
    padding: var(--spacing-sm);
    font-size: var(--font-sm);
  }
  
  .user-info i {
    font-size: 1.2rem;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>