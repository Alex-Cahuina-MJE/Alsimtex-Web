<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import logoImage from '../assets/images/logo/logo.png'
import Fondo1 from '../assets/images/backgrounds/Fondo1.jpeg'
import Fondo2 from '../assets/images/backgrounds/Fondo2.jpeg'
import Fondo3 from '../assets/images/backgrounds/Fondo3.jpeg'
import Fondo4 from '../assets/images/backgrounds/Fondo4.mp4'


const isVisible = ref(false)
const currentImageIndex = ref(0)
const autoPlayInterval = ref(null)
const parallaxOffset = ref(0)
const images = [
  Fondo1,
  Fondo2,
  Fondo3,
  Fondo4
]

const handleParallax = () => {
  const scrolled = window.pageYOffset
  parallaxOffset.value = scrolled * 0.5
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length
}

const prevImage = () => {
  currentImageIndex.value = currentImageIndex.value === 0 
    ? images.length - 1 
    : currentImageIndex.value - 1
}

const setImage = (index) => {
  currentImageIndex.value = index
  resetAutoPlay()
}

const startAutoPlay = () => {
  autoPlayInterval.value = setInterval(nextImage, 5000)
}

const resetAutoPlay = () => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
  }
  startAutoPlay()
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
  startAutoPlay()
  window.addEventListener('scroll', handleParallax)
})

onUnmounted(() => {
  if (autoPlayInterval.value) {
    clearInterval(autoPlayInterval.value)
  }
  window.removeEventListener('scroll', handleParallax)
})
</script>

<template>
<div class="home">
  <section class="hero" :class="{ 'is-visible': isVisible }">
    <div class="hero-background">
      <video
        class="background-video"
        :src="Fondo4"
        :style="{ transform: `translateY(${parallaxOffset}px) scale(1.1)` }"
        autoplay
        loop
        muted
        playsinline
        poster=""
      ></video>
      
      <!-- Partículas flotantes -->
      <div class="floating-particles">
        <div v-for="i in 20" :key="i" class="particle" :style="{ 
          '--delay': Math.random() * 5 + 's',
          '--duration': (Math.random() * 10 + 15) + 's',
          '--size': (Math.random() * 4 + 2) + 'px',
          '--x': Math.random() * 100 + '%',
          '--opacity': Math.random() * 0.6 + 0.2
        }"></div>
      </div>
      <div class="hero-overlay"></div>
    </div>
    <div class="hero-content">
      <div class="brand-logo">
        <img :src="logoImage" alt="ALSIMTEX Logo" class="logo-image" :class="{ 'is-visible': isVisible }">
      </div>
      <h1 :class="{ 'is-visible': isVisible }">
        <span class="text-gradient">Redefine</span> tu Descanso
      </h1>
      <p class="hero-subtitle" :class="{ 'is-visible': isVisible }">
        Donde el lujo encuentra el confort
      </p>
      <div class="hero-features">
        <div class="feature-tag" :style="{ animationDelay: '0.6s' }">
          <i class="fas fa-crown"></i> Premium
        </div>
        <div class="feature-tag" :style="{ animationDelay: '0.8s' }">
          <i class="fas fa-award"></i> Calidad Superior
        </div>
        <div class="feature-tag" :style="{ animationDelay: '1s' }">
          <i class="fas fa-heart"></i> Diseño Exclusivo
        </div>
        <div class="feature-tag" :style="{ animationDelay: '1.2s' }">
          <i class="fas fa-gem"></i> Elegancia
        </div>
        <div class="feature-tag" :style="{ animationDelay: '1.4s' }">
          <i class="fas fa-star"></i> Excelencia
        </div>
      </div>
      <div class="hero-buttons" :class="{ 'is-visible': isVisible }">
        <router-link to="/productos" class="btn btn-primary glass-effect">
          <i class="fas fa-shopping-bag"></i>
          Explorar Colección
          <span class="btn-shine"></span>
        </router-link>
        <router-link to="/contacto" class="btn btn-outline glass-effect">
          <i class="fas fa-envelope"></i>
          Contactar
        </router-link>
      </div>
    </div>
  </section>

  <section class="quick-actions container">
    <div class="actions-grid">
      <div class="action-card hover-lift">
        <i class="fas fa-shopping-cart"></i>
        <h3>Compra Rápida</h3>
        <p>Proceso de compra simplificado</p>
        <router-link to="/productos" class="action-btn">
          <span>Comprar ahora</span>
        </router-link>
      </div>
      <div class="action-card hover-lift">
        <i class="fas fa-headset"></i>
        <h3>Soporte 24/7</h3>
        <p>Estamos aquí para ayudarte</p>
        <router-link to="/contacto" class="action-btn">
          <span>Contactar</span>
        </router-link>
      </div>
      <div class="action-card hover-lift">
        <i class="fas fa-gift"></i>
        <h3>Ofertas Especiales</h3>
        <p>Descuentos exclusivos</p>
        <router-link to="/productos" class="action-btn">
          <span>Ver ofertas</span>
        </router-link>
      </div>
    </div>
  </section>
</div>
</template>

<style scoped>
.home {
  overflow-x: hidden;
  background: var(--bg-secondary);
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  overflow: hidden;
  background: transparent;
  padding: var(--spacing-4xl) 0;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%;
  z-index: 0;
  overflow: hidden;
  transform: translateZ(0);
}

.background-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
  transform: scale(1.1);
  transition: transform 0.1s ease-out;
  filter: brightness(0.9) saturate(1.1);
}

@keyframes slowZoom {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.25) 50%, rgba(0, 0, 0, 0.2) 100%);
  z-index: 1;
}

.hero-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.15;
}

/* Partículas flotantes elegantes */
.floating-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  background: radial-gradient(circle, rgba(255, 255, 255, var(--opacity)) 0%, transparent 70%);
  border-radius: 50%;
  left: var(--x);
  bottom: -10px;
  animation: floatUp var(--duration) var(--delay) infinite linear;
  filter: blur(0.5px);
}

@keyframes floatUp {
  0% {
    transform: translateY(0) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) translateX(50px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.hero.is-visible {
  opacity: 1;
}

.hero-content {
  max-width: 1200px;
  position: relative;
  z-index: 2;
  padding: var(--spacing-2xl);
  margin: 0 auto;
  animation: fadeInUp 1s ease-out;
}

.main-carousel {
  width: 100%;
  height: 400px;
  margin-bottom: 2rem;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.image-carousel {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.carousel-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  z-index: 2;
}

.carousel-button {
  background: rgba(255, 255, 255, 0.8);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-button:hover {
  background: white;
  transform: scale(1.1);
}

.carousel-indicators {
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.brand-logo {
  margin-bottom: var(--spacing-2xl);
  animation: fadeInDown 1s ease-out 0.2s backwards;
}

.logo-image {
  width: 300px;
  height: auto;
  transition: all var(--transition-slow);
  filter: drop-shadow(0 10px 30px rgba(255, 255, 255, 0.2));
  animation: float 3s ease-in-out infinite;
  background: transparent;
}

.logo-image:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 15px 40px rgba(255, 255, 255, 0.3));
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero h1 {
  font-size: clamp(2.5rem, 6vw, 5rem);
  margin-bottom: var(--spacing-xl);
  transform: translateY(30px);
  opacity: 0;
  transition: all var(--transition-slow);
  color: white;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(255,255,255,0.2);
  font-weight: var(--font-extrabold);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.hero h1.is-visible {
  transform: translateY(0);
  opacity: 1;
}

.hero h1 .text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #ffffff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% auto;
  animation: shimmer 3s linear infinite;
}

.hero-subtitle {
  font-size: clamp(1.2rem, 3vw, 2rem);
  margin-bottom: var(--spacing-2xl);
  transform: translateY(20px);
  opacity: 0;
  transition: all var(--transition-slow) 0.2s;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 15px rgba(0,0,0,0.2);
  font-weight: var(--font-medium);
  letter-spacing: 0.02em;
}

.hero-subtitle.is-visible {
  transform: translateY(0);
  opacity: 1;
}

.hero-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  justify-content: center;
  margin: var(--spacing-2xl) 0;
}

.feature-tag {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(var(--blur-md));
  -webkit-backdrop-filter: blur(var(--blur-md));
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-full);
  color: white;
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
  border: 2px solid rgba(255, 255, 255, 0.25);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.feature-tag:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.feature-tag i {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  animation: bounce 2s ease-in-out infinite;
}

.hero-buttons {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-2xl);
  transform: translateY(20px);
  opacity: 0;
  transition: all var(--transition-slow) 0.4s;
}

.hero-buttons.is-visible {
  transform: translateY(0);
  opacity: 1;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.95);
  color: var(--secondary-color);
  padding: var(--spacing-lg) var(--spacing-3xl);
  border: 2px solid rgba(255, 255, 255, 1);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-bold);
  font-size: var(--font-lg);
  letter-spacing: 0.5px;
  transition: all var(--transition-fast);
  backdrop-filter: blur(var(--blur-md));
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.btn-primary:hover {
  background: white;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  color: var(--secondary-dark);
}

.btn-outline {
  background: transparent;
  color: white;
  padding: var(--spacing-lg) var(--spacing-3xl);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-bold);
  font-size: var(--font-lg);
  letter-spacing: 0.5px;
  transition: all var(--transition-fast);
  backdrop-filter: blur(var(--blur-md));
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  border-color: white;
}

.btn-primary::before, .btn-outline::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover::before, .btn-outline:hover::before {
  width: 300px;
  height: 300px;
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-4xl) var(--spacing-2xl);
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: var(--font-bold);
}

.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}



@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scroll {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(10px);
    opacity: 0.5;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.4rem;
  }

  .feature-tag {
    font-size: 0.9rem;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}

.experiencia {
  padding: var(--spacing-4xl) 0;
  background: var(--bg-secondary);
}

.experiencia-content {
  text-align: center;
}

.experiencia-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-3xl);
}

.experiencia-item {
  text-align: center;
  padding: var(--spacing-2xl);
  background: white;
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.experiencia-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.experiencia-item:hover::before {
  transform: scaleX(1);
}

.experiencia-item:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
  border-color: rgba(20, 184, 166, 0.3);
}

.experiencia-item .numero {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-md);
  display: block;
  line-height: 1;
}

.experiencia-item p {
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  font-size: var(--font-lg);
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
}

.experiencia-item:hover .icon-wrapper {
  transform: rotate(-10deg) scale(1.1);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
}

.icon-wrapper i {
  font-size: 2rem;
  color: white;
}

.feature-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: var(--primary-color);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.feature-btn:hover {
  color: var(--secondary-color);
  transform: translateX(5px);
}

.quick-actions {
  padding: var(--spacing-4xl) 0;
  background: var(--bg-secondary);
  position: relative;
  overflow: hidden;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-2xl);
  position: relative;
  z-index: 1;
}

.action-card {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  text-align: center;
  transition: all var(--transition-normal);
  border: 1px solid rgba(20, 184, 166, 0.1);
  box-shadow: var(--shadow-md);
}

.action-card:hover {
  transform: translateY(-10px);
  background: white;
  border-color: rgba(20, 184, 166, 0.3);
  box-shadow: var(--shadow-2xl), var(--shadow-glow);
}

.action-card i {
  font-size: 3.5rem;
  margin-bottom: var(--spacing-lg);
  display: inline-block;
  transition: all var(--transition-normal);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.action-card:hover i {
  transform: scale(1.2) rotate(-10deg);
  animation: bounce 1s ease-in-out;
}

.action-card h3 {
  font-size: var(--font-2xl);
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.action-card p {
  font-size: var(--font-base);
  margin-bottom: var(--spacing-xl);
  color: var(--text-secondary);
  line-height: 1.6;
}

.action-btn {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) var(--spacing-2xl);
  border: 2px solid var(--secondary-color);
  background: var(--gradient-primary);
  color: white;
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-semibold);
  font-size: var(--font-base);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.action-btn:hover::before {
  width: 300px;
  height: 300px;
}

.action-btn:hover {
  transform: translateY(-4px) scale(1.05);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
  border-color: var(--secondary-dark);
}

.action-btn span {
  position: relative;
  z-index: 1;
}

.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-icon:hover {
  transform: scale(1.1);
  background: var(--secondary-color);
}

/* Scroll Indicator */
.scroll-indicator {
  position: absolute;
  bottom: var(--spacing-3xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  animation: fadeInUp 1.5s ease-out 1s backwards;
}

.mouse {
  width: 30px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.8);
  border-radius: var(--border-radius-full);
  position: relative;
  backdrop-filter: blur(var(--blur-sm));
}

.wheel {
  width: 4px;
  height: 10px;
  background: white;
  border-radius: var(--border-radius-full);
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  animation: scrollDown 2s ease-in-out infinite;
}

@keyframes scrollDown {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) translateY(15px);
    opacity: 0.3;
  }
}

.scroll-text {
  color: white;
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.9;
}

/* Responsive Design - Mobile First */
@media (max-width: 1024px) {
  .hero {
    min-height: 90vh;
    padding: var(--spacing-3xl) 0;
  }
  
  .hero-content {
    padding: var(--spacing-xl);
  }
  
  .logo-image {
    width: 250px;
  }
  
  .hero h1 {
    font-size: clamp(2.2rem, 5vw, 4rem);
  }
  
  .hero-subtitle {
    font-size: clamp(1.1rem, 2.5vw, 1.8rem);
  }
  
  .feature-tag {
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-sm);
  }
  
  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--spacing-xl);
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 100vh;
    padding: var(--spacing-2xl) 0;
  }
  
  .hero-background {
    background-attachment: scroll;
  }
  
  .hero-content {
    padding: var(--spacing-md);
  }
  
  .brand-logo {
    margin-bottom: var(--spacing-xl);
  }
  
  .logo-image {
    width: 200px;
  }

  .hero h1 {
    font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: var(--spacing-lg);
  }

  .hero-subtitle {
    font-size: clamp(1rem, 3vw, 1.4rem);
    margin-bottom: var(--spacing-xl);
  }

  .feature-tag {
    font-size: var(--font-sm);
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .hero-features {
    gap: var(--spacing-sm);
    margin: var(--spacing-xl) 0;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
  }
  
  .btn-primary,
  .btn-outline {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-xl);
    font-size: var(--font-base);
  }

  .section-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
  }

  .experiencia-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .experiencia-item {
    padding: var(--spacing-xl);
  }
  
  .icon-wrapper {
    width: 70px;
    height: 70px;
  }
  
  .experiencia-item .numero {
    font-size: clamp(2rem, 4vw, 3rem);
  }
  
  .scroll-indicator {
    bottom: var(--spacing-xl);
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .action-card {
    padding: var(--spacing-xl);
  }
  
  .action-card i {
    font-size: 3rem;
  }
  
  .action-card h3 {
    font-size: var(--font-xl);
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 100vh;
    padding: var(--spacing-xl) 0;
  }
  
  .hero-content {
    padding: var(--spacing-sm);
  }
  
  .brand-logo {
    margin-bottom: var(--spacing-lg);
  }
  
  .logo-image {
    width: 160px;
  }
  
  .hero h1 {
    font-size: 1.8rem;
    margin-bottom: var(--spacing-md);
  }
  
  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: var(--spacing-lg);
  }
  
  .feature-tag {
    font-size: var(--font-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  .feature-tag i {
    font-size: 1rem;
  }
  
  .hero-features {
    gap: var(--spacing-xs);
    margin: var(--spacing-lg) 0;
  }
  
  .btn-primary,
  .btn-outline {
    padding: var(--spacing-md);
    font-size: var(--font-sm);
  }
  
  .scroll-indicator {
    bottom: var(--spacing-lg);
    transform: translateX(-50%) scale(0.8);
  }
  
  .mouse {
    width: 24px;
    height: 40px;
    border-width: 2px;
  }
  
  .wheel {
    width: 3px;
    height: 8px;
    top: 8px;
  }
  
  .experiencia {
    padding: var(--spacing-2xl) 0;
  }
  
  .experiencia-grid {
    gap: var(--spacing-md);
  }
  
  .experiencia-item {
    padding: var(--spacing-lg);
  }
  
  .icon-wrapper {
    width: 60px;
    height: 60px;
  }
  
  .icon-wrapper i {
    font-size: 1.5rem;
  }
  
  .experiencia-item .numero {
    font-size: 2rem;
  }
  
  .experiencia-item p {
    font-size: var(--font-sm);
  }
  
  .quick-actions {
    padding: var(--spacing-2xl) 0;
  }
  
  .action-card {
    padding: var(--spacing-lg);
  }
  
  .action-card i {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-md);
  }
  
  .action-card h3 {
    font-size: var(--font-lg);
    margin-bottom: var(--spacing-sm);
  }
  
  .action-card p {
    font-size: var(--font-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .action-btn {
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: var(--font-sm);
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}

/* Landscape móvil */
@media (max-width: 896px) and (orientation: landscape) {
  .hero {
    min-height: auto;
    padding: var(--spacing-2xl) 0;
  }
  
  .logo-image {
    width: 150px;
  }
  
  .hero h1 {
    font-size: 2rem;
    margin-bottom: var(--spacing-md);
  }
  
  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: var(--spacing-md);
  }
  
  .hero-features {
    gap: var(--spacing-xs);
    margin: var(--spacing-md) 0;
  }
  
  .feature-tag {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-xs);
  }
  
  .hero-buttons {
    flex-direction: row;
    margin-top: var(--spacing-md);
  }
  
  .scroll-indicator {
    display: none;
  }
}

/* Muy pequeños (Galaxy Fold, etc) */
@media (max-width: 360px) {
  .logo-image {
    width: 140px;
  }
  
  .hero h1 {
    font-size: 1.5rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
  }
  
  .feature-tag {
    font-size: 0.7rem;
    padding: 4px 8px;
  }
  
  .btn-primary,
  .btn-outline {
    padding: var(--spacing-sm);
    font-size: 0.8rem;
  }
}
</style>