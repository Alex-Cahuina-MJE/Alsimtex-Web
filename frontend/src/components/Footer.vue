<script setup>
import { empresaConfig, getTelefonoDisplay, getEmailPrincipal, getDireccionCompleta } from '../config/empresa'
</script>

<template>
  <footer class="footer">
    <div class="footer-content container">
      <div class="footer-section">
        <h3>{{ empresaConfig.nombre }}</h3>
        <p>{{ empresaConfig.eslogan }}</p>
        <div class="social-links">
          <a 
            v-if="empresaConfig.redesSociales?.facebook" 
            :href="empresaConfig.redesSociales?.facebook" 
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fab fa-facebook-f"></i>
          </a>
          <a 
            v-if="empresaConfig.redesSociales?.instagram" 
            :href="empresaConfig.redesSociales?.instagram" 
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fab fa-instagram"></i>
          </a>
          <a 
            :href="empresaConfig.redesSociales?.whatsapp || `https://wa.me/51${empresaConfig.telefono?.numero || '948435269'}`" 
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fab fa-whatsapp"></i>
          </a>
          <a 
            v-if="empresaConfig.redesSociales?.tiktok" 
            :href="empresaConfig.redesSociales?.tiktok" 
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fab fa-tiktok"></i>
          </a>
          <a 
            v-if="empresaConfig.redesSociales?.youtube" 
            :href="empresaConfig.redesSociales?.youtube" 
            class="social-icon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="fab fa-youtube"></i>
          </a>
        </div>
      </div>

      <div class="footer-section">
        <h4>Enlaces Rápidos</h4>
        <ul>
          <li><router-link to="/">Inicio</router-link></li>
          <li><router-link to="/productos">Productos</router-link></li>
          <li><router-link to="/nosotros">Nosotros</router-link></li>
          <li><router-link to="/contacto">Contacto</router-link></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Contacto</h4>
        <ul class="contact-info">
          <li>
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ getDireccionCompleta() }}</span>
          </li>
          <li>
            <i class="fas fa-phone"></i>
            <span>{{ getTelefonoDisplay() }}</span>
          </li>
          <li>
            <i class="fas fa-envelope"></i>
            <span>{{ getEmailPrincipal() }}</span>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Horario de Atención</h4>
        <ul class="schedule">
          <li>
            <span>Lunes - Viernes:</span>
            <span>9:00 - 18:00</span>
          </li>
          <li>
            <span>Sábado:</span>
            <span>9:00 - 13:00</span>
          </li>
          <li>
            <span>Domingo:</span>
            <span>Cerrado</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <p>&copy; 2025 ALSIMTEX. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--bg-primary);
  padding-top: var(--spacing-4xl);
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-2xl);
  padding-bottom: var(--spacing-3xl);
}

.footer-section h3 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-lg);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.footer-section h4 {
  font-size: var(--font-lg);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-weight: var(--font-semibold);
}

.footer-section p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all var(--transition-fast);
}

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section ul li {
  margin-bottom: var(--spacing-md);
}

.footer-section ul li a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.footer-section ul li a:hover {
  color: var(--secondary-color);
  padding-left: var(--spacing-sm);
}

.contact-info li {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.contact-info li i {
  color: var(--secondary-color);
  font-size: var(--font-lg);
}

.schedule li {
  display: flex;
  justify-content: space-between;
  color: var(--text-secondary);
}

.footer-bottom {
  background: var(--bg-secondary);
  padding: var(--spacing-lg) 0;
  text-align: center;
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.footer-bottom p {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

@media (max-width: 768px) {
  .footer {
    padding-top: var(--spacing-2xl);
  }
  
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
    text-align: left;
  }
  
  .footer-section h3,
  .footer-section h4 {
    font-size: var(--font-base);
    margin-bottom: var(--spacing-sm);
  }
  
  .footer-section p,
  .footer-section li {
    font-size: var(--font-sm);
  }

  .social-links {
    justify-content: flex-start;
    gap: var(--spacing-sm);
  }
  
  .social-icon {
    width: 32px;
    height: 32px;
    font-size: var(--font-sm);
  }

  .contact-info li {
    justify-content: flex-start;
    gap: var(--spacing-xs);
  }
  
  .contact-info i {
    width: 14px;
  }

  .schedule li {
    flex-direction: row;
    justify-content: space-between;
    gap: var(--spacing-xs);
  }
}

/* Media query para móviles muy pequeños */
@media (max-width: 480px) {
  .footer {
    padding-top: var(--spacing-xl);
  }
  
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .footer-section {
    padding: 0 var(--spacing-xs);
  }
  
  .footer-section h3,
  .footer-section h4 {
    font-size: var(--font-sm);
    margin-bottom: var(--spacing-xs);
  }
  
  .footer-section p,
  .footer-section li {
    font-size: var(--font-xs);
    line-height: 1.4;
  }
  
  .social-links {
    gap: var(--spacing-xs);
  }
  
  .social-icon {
    width: 28px;
    height: 28px;
    font-size: var(--font-xs);
  }
  
  .contact-info i {
    width: 12px;
    font-size: var(--font-xs);
  }
  
  .schedule li {
    font-size: var(--font-xs);
  }
}

/* Para pantallas muy pequeñas, simplificar a 1 columna pero más compacto */
@media (max-width: 360px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .footer-section {
    padding: 0;
    margin-bottom: var(--spacing-sm);
  }
  
  .footer-section:last-child {
    margin-bottom: 0;
  }
}
</style>