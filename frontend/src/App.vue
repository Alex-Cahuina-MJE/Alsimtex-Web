<template>
  <div id="app">
    <ErrorBoundary>
      <ErrorNotification />
      <NotificationBar />
      <GlobalConfirmModal />
      
      <header v-if="!isAdminRoute">
        <NavBar />
      </header>

      <main>
        <RouterView v-slot="{ Component }">
          <KeepAlive>
            <ErrorBoundary>
              <Transition name="fade" mode="out-in">
                <component :is="Component" />
              </Transition>
            </ErrorBoundary>
          </KeepAlive>
        </RouterView>
      </main>

      <Footer v-if="!isAdminRoute" />
    </ErrorBoundary>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import ErrorNotification from './components/ErrorNotification.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import NotificationBar from './components/NotificationBar.vue'
import GlobalConfirmModal from './components/GlobalConfirmModal.vue'

const route = useRoute()

const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

const reloadPage = () => {
  window.location.reload()
}
</script>

<style>
/* Asegúrate de que las variables CSS estén disponibles globalmente */
@import './assets/css/variables.css';
@import './assets/css/animations.css';
@import './assets/css/main.css';

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  text-align: center;
  padding: var(--spacing-xl);
}

.error-container {
  color: var(--color-error);
}

.error-container button {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-error);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.error-container button:hover {
  background-color: var(--color-error-dark);
}

.loader {
  width: 50px;
  height: 50px;
  border: 5px solid var(--color-primary-light);
  border-top: 5px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Transiciones de página */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Variables de color para notificaciones */
:root {
  --color-error: #dc3545;
  --color-warning: #ffc107;
  --color-success: #28a745;
  --color-error-bg: #fff5f5;
  --color-warning-bg: #fff8e6;
  --color-success-bg: #f0fff4;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 480px) {
  main {
    padding-top: max(env(safe-area-inset-top), 60px);
    padding-bottom: max(env(safe-area-inset-bottom), 16px);
  }
}

footer.footer {
  background: var(--gradient-hero);
  color: var(--text-light);
  margin-top: auto;
  padding-top: var(--spacing-4xl);
  position: relative;
  overflow: hidden;
}

footer.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent);
}

footer.footer::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
  pointer-events: none;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: var(--spacing-3xl);
  padding-bottom: var(--spacing-4xl);
  position: relative;
  z-index: 1;
  align-items: start;
}

.footer-section h3 {
  font-size: var(--font-2xl);
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-bold);
}

.footer-section h4 {
  font-size: var(--font-xl);
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-bold);
}

.footer-description {
  margin-bottom: var(--spacing-2xl);
  line-height: 1.8;
  opacity: 0.95;
  font-size: var(--font-base);
  color: rgba(255, 255, 255, 0.9);
}

.footer-social {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.social-link {
  width: 50px;
  height: 50px;
  border-radius: var(--border-radius-full);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  border: 2px solid rgba(255, 255, 255, 0.25);
  font-size: 1.4rem;
  position: relative;
  overflow: hidden;
}

.social-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: white;
  border-radius: var(--border-radius-full);
  transform: scale(0);
  transition: transform var(--transition-fast);
}

.social-link:hover::before {
  transform: scale(1);
}

.social-link i {
  position: relative;
  z-index: 1;
  transition: color var(--transition-fast);
}

.footer-section h3,
.footer-section h4 {
  color: white;
  font-weight: var(--font-bold);
  letter-spacing: 0.5px;
  margin-bottom: var(--spacing-xl);
  position: relative;
  display: inline-block;
}

.footer-section h3::after,
.footer-section h4::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background: white;
  border-radius: var(--border-radius-full);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.social-link:hover {
  background: white;
  transform: translateY(-5px) rotate(-5deg);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: white;
}

.social-link:hover i {
  color: var(--secondary-color);
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-md);
}

.footer-links a {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  opacity: 0.9;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-medium);
  letter-spacing: 0.3px;
  font-size: var(--font-base);
  padding: var(--spacing-xs) 0;
  position: relative;
}

.footer-links a::before {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 2px;
  background: white;
  transition: width var(--transition-fast);
}

.footer-links a:hover::before {
  width: 100%;
}

.footer-links a:hover {
  opacity: 1;
  transform: translateX(8px);
  color: white;
}

.footer-links a i {
  font-size: 0.9rem;
  transition: transform var(--transition-fast);
}

.footer-links a:hover i {
  transform: translateX(4px);
}

.footer-contact {
  list-style: none;
  padding: 0;
}

.footer-contact li {
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  opacity: 0.9;
  transition: all var(--transition-fast);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-contact li:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(8px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.footer-contact li i {
  color: white;
  font-size: 1.4rem;
  width: 30px;
  text-align: center;
  flex-shrink: 0;
}

.footer-bottom {
  position: relative;
  margin-top: var(--spacing-4xl);
  padding: var(--spacing-2xl) 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
}

.footer-bottom::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent
  );
}

.footer-bottom .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-xl);
  position: relative;
  z-index: 1;
}

.copyright {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-weight: var(--font-medium);
  letter-spacing: 0.5px;
  font-size: var(--font-lg);
  color: rgba(255, 255, 255, 0.95);
}

.copyright i {
  color: white;
  font-size: 1.2rem;
}

.payment-methods {
  display: flex;
  gap: var(--spacing-lg);
  font-size: 2.5rem;
}

.payment-methods i {
  transition: all var(--transition-fast);
  opacity: 0.8;
  color: white;
  cursor: pointer;
  position: relative;
}

.payment-methods i::before {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: var(--border-radius-md);
  background: white;
  opacity: 0;
  transition: opacity var(--transition-fast);
  z-index: -1;
}

.payment-methods i:hover::before {
  opacity: 0.15;
}

.payment-methods i:hover {
  opacity: 1;
  transform: translateY(-4px) scale(1.15);
  filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3));
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .footer-section h3,
  .footer-section h4 {
    justify-content: center;
  }

  .footer-social {
    justify-content: center;
  }

  .footer-links a {
    justify-content: center;
  }

  .footer-contact li {
    justify-content: center;
  }

  .footer-bottom .container {
    justify-content: center;
    text-align: center;
  }

  .payment-methods {
    width: 100%;
    justify-content: center;
  }
}
</style>
