<script setup>
import { getTelefonoDisplay, getWhatsAppUrl } from '../config/empresa'

const misionVision = {
  mision: 'Nuestra misión es proporcionar productos textiles de la más alta calidad para el hogar, garantizando el máximo confort y satisfacción de nuestros clientes a través de la innovación constante y el compromiso con la excelencia.',
  vision: 'Ser reconocidos como la empresa líder en el mercado de ropa de cama en Perú, destacando por nuestra calidad, innovación y servicio al cliente, expandiendo nuestra presencia a nivel nacional e internacional.'
}

const valores = [
  {
    titulo: 'Calidad',
    descripcion: 'Compromiso inquebrantable con la excelencia en cada producto que fabricamos'
  },
  {
    titulo: 'Innovación',
    descripcion: 'Búsqueda constante de nuevas tecnologías y diseños para mejorar nuestros productos'
  },
  {
    titulo: 'Servicio',
    descripcion: 'Atención personalizada y seguimiento continuo para garantizar la satisfacción total'
  },
  {
    titulo: 'Responsabilidad',
    descripcion: 'Compromiso con el medio ambiente y la sostenibilidad en nuestros procesos'
  }
]
</script>

<template>
  <div class="nosotros-page">
    <div class="container">
      <h1 class="page-title slide-in-bottom">Sobre Nosotros</h1>
      
      <section class="mision-vision fade-in">
        <div class="mv-container">
          <div class="mv-card">
            <h2>Nuestra Misión</h2>
            <p>{{ misionVision.mision }}</p>
          </div>
          <div class="mv-card">
            <h2>Nuestra Visión</h2>
            <p>{{ misionVision.vision }}</p>
          </div>
        </div>
      </section>

      <section class="valores">
        <h2 class="slide-in-bottom">Nuestros Valores</h2>
        <div class="valores-grid">
          <div v-for="(valor, index) in valores" 
               :key="index" 
               class="valor-card hover-lift"
               :style="{ animationDelay: index * 0.2 + 's' }">
            <h3>{{ valor.titulo }}</h3>
            <p>{{ valor.descripcion }}</p>
          </div>
        </div>
      </section>

      <section class="ubicacion">
        <div class="container">
          <div class="ubicacion-header">
            <h2 class="slide-in-bottom">Ubícanos</h2>
            <p class="ubicacion-subtitle">Encuentra nuestras instalaciones y visítanos</p>
          </div>
          
          <div class="ubicacion-container">
            <div class="ubicacion-info">
              <div class="info-card direccion-card">
                <div class="icon-container">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="info-content">
                  <h3>Dirección</h3>
                  <p class="info-main">Av. Argentina, Arequipa</p>
                  <p class="info-detail">Mariano Melgar, Perú</p>
                  <a href="https://goo.gl/maps/..." class="direccion-link" target="_blank">
                    <i class="fas fa-external-link-alt"></i>
                    Ver en Google Maps
                  </a>
                </div>
              </div>

              <div class="info-card telefono-card">
                <div class="icon-container">
                  <i class="fas fa-phone"></i>
                </div>
                <div class="info-content">
                  <h3>Teléfono</h3>
                  <p class="info-main">{{ getTelefonoDisplay() }}</p>
                  <p class="info-detail">Llamadas y WhatsApp</p>
                  <div class="contact-actions">
                    <a :href="`tel:${getTelefonoDisplay().replace(/\s/g, '')}`" class="contact-btn call-btn">
                      <i class="fas fa-phone"></i>
                      Llamar
                    </a>
                    <a :href="getWhatsAppUrl()" class="contact-btn whatsapp-btn" target="_blank">
                      <i class="fab fa-whatsapp"></i>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div class="info-card horario-card">
                <div class="icon-container">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="info-content">
                  <h3>Horario de Atención</h3>
                  <div class="horario-grid">
                    <div class="horario-item">
                      <span class="dia">Lunes - Viernes</span>
                      <span class="hora">9:00 - 18:00</span>
                    </div>
                    <div class="horario-item">
                      <span class="dia">Sábados</span>
                      <span class="hora">9:00 - 13:00</span>
                    </div>
                    <div class="horario-item domingo">
                      <span class="dia">Domingos</span>
                      <span class="hora">Cerrado</span>
                    </div>
                  </div>
                  <div class="estado-tienda">
                    <div class="estado-indicator abierto">
                      <span class="status-dot"></span>
                      <span>Abierto ahora</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mapa-container">
              <div class="mapa-header">
                <h3>Nuestra Ubicación</h3>
                <p>Encuéntranos fácilmente en el corazón de Arequipa</p>
              </div>
              <div class="mapa">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1188.587552190404!2d-71.49456213037274!3d-16.404426699020277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91424b769491300d%3A0xba9035c53d1fc453!2sAv.%20Argentina%201456%2C%20Mariano%20Melgar%2004006!5e1!3m2!1ses-419!2spe!4v1761234573155!5m2!1ses-419!2spe" 
                  width="100%" 
                  height="500" 
                  style="border:0;" 
                  allowfullscreen="" 
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.nosotros-page {
  padding: calc(80px + var(--spacing-3xl)) 0 var(--spacing-4xl);
  background: var(--bg-secondary);
  min-height: 100vh;
}

.page-title {
  text-align: center;
  margin-bottom: var(--spacing-4xl);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  animation: fadeInDown 0.8s ease-out;
}

section {
  margin-bottom: var(--spacing-4xl);
}

.mision-vision {
  animation: fadeInUp 1s ease-out;
}

.mv-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-3xl);
}

.mv-card {
  background: var(--bg-primary);
  padding: var(--spacing-3xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  text-align: left;
  transition: all var(--transition-normal);
  border: 1px solid rgba(20, 184, 166, 0.1);
  position: relative;
  overflow: hidden;
}

.mv-card::before {
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

.mv-card:hover::before {
  transform: scaleX(1);
}

.mv-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
  border-color: rgba(20, 184, 166, 0.3);
}

.mv-card h2 {
  font-size: var(--font-3xl);
  font-weight: var(--font-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--spacing-lg);
  text-align: left;
  letter-spacing: -0.01em;
}

.mv-card p {
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: var(--font-lg);
}

.historia {
  max-width: 900px;
  margin: 0 auto var(--spacing-4xl);
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--bg-primary);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
}

.valores {
  animation: fadeInUp 1s ease-out 0.3s backwards;
}

.valores h2 {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  font-size: var(--font-4xl);
  font-weight: var(--font-extrabold);
  color: var(--text-primary);
}

.valores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-2xl);
  margin-top: var(--spacing-3xl);
}

.valor-card {
  background: var(--bg-primary);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  text-align: center;
  animation: fadeInUp var(--transition-slow) forwards;
  opacity: 0;
  transition: all var(--transition-normal);
  border: 1px solid rgba(20, 184, 166, 0.1);
  position: relative;
  overflow: hidden;
}

.valor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
}

.valor-card:hover::before {
  transform: scaleX(1);
}

.valor-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
  border-color: rgba(20, 184, 166, 0.3);
}

.valor-card h3 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--secondary-color);
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.01em;
}

.valor-card p {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: var(--font-base);
}

.equipo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--spacing-2xl);
}

.equipo-card {
  background: var(--bg-primary);
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: all var(--transition-normal);
  border: 1px solid rgba(20, 184, 166, 0.1);
}

.equipo-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(20, 184, 166, 0.2);
}

.rol {
  color: var(--secondary-color);
  font-weight: var(--font-semibold);
  margin: var(--spacing-md) 0;
  font-size: var(--font-lg);
}

h2 {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  font-size: var(--font-4xl);
  font-weight: var(--font-extrabold);
  color: var(--text-primary);
}

/* Estilos de la sección Ubicación */
.ubicacion {
  padding: var(--spacing-4xl) 0 var(--spacing-5xl);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
}

.ubicacion::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314B8A6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
  z-index: 1;
}

.ubicacion .container {
  position: relative;
  z-index: 2;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.ubicacion-header {
  text-align: center;
  margin-bottom: var(--spacing-5xl);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.ubicacion-subtitle {
  color: var(--text-secondary);
  font-size: var(--font-xl);
  margin-top: var(--spacing-lg);
  line-height: 1.6;
}

.ubicacion-container {
  display: grid;
  grid-template-columns: 45% 55%;
  gap: var(--spacing-4xl);
  align-items: start;
  min-height: 600px;
  margin: 0;
}

.ubicacion-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xl);
  padding-right: var(--spacing-lg);
  padding-left: 0;
}

.info-card {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all var(--transition-normal);
  border: 1px solid rgba(20, 184, 166, 0.08);
  position: relative;
  overflow: hidden;
  min-height: 120px;
}

.info-card::before {
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

.info-card:hover::before {
  transform: scaleX(1);
}

.info-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  border-color: rgba(20, 184, 166, 0.2);
}

.direccion-card::before { background: linear-gradient(135deg, #ef4444, #dc2626); }
.telefono-card::before { background: linear-gradient(135deg, #22c55e, #16a34a); }
.horario-card::before { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.icon-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 6px 18px rgba(20, 184, 166, 0.25);
}

.direccion-card .icon-container { background: linear-gradient(135deg, #ef4444, #dc2626); }
.telefono-card .icon-container { background: linear-gradient(135deg, #22c55e, #16a34a); }
.horario-card .icon-container { background: linear-gradient(135deg, #3b82f6, #2563eb); }

.icon-container i {
  color: white;
  font-size: var(--font-lg);
}

.info-content h3 {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
}

.info-main {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
}

.info-detail {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-bottom: var(--spacing-md);
  line-height: 1.5;
}

.direccion-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: #ef4444;
  text-decoration: none;
  font-weight: var(--font-medium);
  font-size: var(--font-sm);
  transition: all var(--transition-fast);
}

.direccion-link:hover {
  color: #dc2626;
  transform: translateX(5px);
}

.contact-actions {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  text-decoration: none;
  font-weight: var(--font-semibold);
  font-size: var(--font-base);
  transition: all var(--transition-fast);
  border: 2px solid transparent;
  min-width: 140px;
  justify-content: center;
}

.call-btn {
  background: #22c55e;
  color: white;
}

.call-btn:hover {
  background: #16a34a;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
}

.whatsapp-btn {
  background: #25d366;
  color: white;
}

.whatsapp-btn:hover {
  background: #22c55e;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.3);
}

.horario-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.horario-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: #f8fafc;
  border-radius: var(--border-radius-xl);
  border-left: 5px solid #3b82f6;
  transition: all var(--transition-fast);
}

.horario-item:hover {
  background: #f1f5f9;
  transform: translateX(5px);
}

.horario-item.domingo {
  border-left-color: #ef4444;
  background: #fef2f2;
}

.dia {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--font-base);
}

.hora {
  font-weight: var(--font-bold);
  color: #3b82f6;
  font-size: var(--font-base);
}

.domingo .hora {
  color: #ef4444;
}

.estado-tienda {
  padding-top: var(--spacing-xl);
  border-top: 2px solid #e5e7eb;
}

.estado-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-weight: var(--font-semibold);
  font-size: var(--font-base);
}

.estado-indicator.abierto {
  color: #22c55e;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

.mapa-container {
  background: white;
  border-radius: var(--border-radius-3xl);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(20, 184, 166, 0.08);
  height: fit-content;
  margin-right: 0;
}

.mapa-header {
  padding: var(--spacing-3xl);
  background: var(--gradient-primary);
  color: white;
  text-align: center;
}

.mapa-header h3 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
}

.mapa-header p {
  opacity: 0.9;
  font-size: var(--font-lg);
  line-height: 1.5;
}

.mapa {
  position: relative;
  overflow: hidden;
  height: 600px;
}

.mapa iframe {
  filter: grayscale(0.2);
  transition: filter var(--transition-normal);
  height: 600px;
}

.mapa:hover iframe {
  filter: grayscale(0);
}

@media (max-width: 768px) {
  .mv-container {
    grid-template-columns: 1fr;
  }
  
  .valores-grid {
    grid-template-columns: 1fr;
  }

  .equipo-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: var(--font-4xl);
  }

  .ubicacion {
    padding: var(--spacing-3xl) var(--spacing-md);
  }

  .ubicacion .container {
    padding: 0 var(--spacing-md);
  }

  .ubicacion-container {
    margin: 0;
  }

  .ubicacion-header {
    margin-bottom: var(--spacing-3xl);
  }

  .ubicacion-subtitle {
    font-size: var(--font-lg);
  }

  .ubicacion-container {
    grid-template-columns: 1fr;
    gap: var(--spacing-3xl);
  }

  .ubicacion-info {
    order: 2;
    padding-right: 0;
    padding-left: 0;
    gap: var(--spacing-2xl);
  }

  .mapa-container {
    order: 1;
    margin-right: 0;
  }

  .info-card {
    padding: var(--spacing-2xl);
    min-height: auto;
  }

  .icon-container {
    width: 70px;
    height: 70px;
    margin-bottom: var(--spacing-xl);
  }

  .icon-container i {
    font-size: var(--font-xl);
  }

  .info-content h3 {
    font-size: var(--font-xl);
  }

  .contact-actions {
    flex-direction: column;
    gap: var(--spacing-md);
  }

  .contact-btn {
    justify-content: center;
    text-align: center;
    min-width: auto;
    width: 100%;
  }

  .horario-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
  }

  .mapa {
    height: 400px;
  }

  .mapa iframe {
    height: 400px;
  }

  .mapa-header {
    padding: var(--spacing-2xl);
  }
}

@media (max-width: 480px) {
  .ubicacion {
    padding: var(--spacing-2xl) var(--spacing-sm);
  }

  .ubicacion .container {
    padding: 0 var(--spacing-sm);
  }

  .ubicacion-container {
    margin: 0;
  }

  .info-card {
    padding: var(--spacing-xl);
  }

  .mapa-header {
    padding: var(--spacing-xl);
  }

  .mapa-header h3 {
    font-size: var(--font-xl);
  }

  .ubicacion-subtitle {
    font-size: var(--font-base);
  }

  .icon-container {
    width: 60px;
    height: 60px;
  }

  .icon-container i {
    font-size: var(--font-lg);
  }

  .info-content h3 {
    font-size: var(--font-lg);
  }

  .info-main {
    font-size: var(--font-lg);
  }

  .mapa {
    height: 350px;
  }

  .mapa iframe {
    height: 350px;
  }
}
</style>