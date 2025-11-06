<template>
  <AdminLayout>
    <div class="container">
      <div class="header">
        <div>
          <h1 class="page-title">Configuración de Empresa</h1>
          <p class="subtitle">Administra toda la información de la empresa desde aquí</p>
        </div>
        <button 
          @click="guardarConfiguracion" 
          class="btn btn-primary"
          :disabled="guardando"
        >
          <i class="fas fa-save"></i>
          {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

      <div class="config-sections">
        <!-- Información Básica -->
        <div class="config-card">
          <div class="card-header">
            <h3><i class="fas fa-building"></i> Información Básica</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>Nombre de la Empresa</label>
              <input 
                v-model="configuracion.nombre" 
                type="text" 
                class="form-control"
                placeholder="Ej: Alsimtex S.A.C."
              >
            </div>
            <div class="form-group">
              <label>Eslogan</label>
              <input 
                v-model="configuracion.eslogan" 
                type="text" 
                class="form-control"
                placeholder="Ej: Calidad y confort para tu hogar"
              >
            </div>
            <div class="form-group">
              <label>RUC</label>
              <input 
                :value="configuracion.datosLegales?.ruc || ''" 
                @input="updateRuc"
                type="text" 
                class="form-control"
                placeholder="Ej: 20123456789"
              >
            </div>
          </div>
        </div>

        <!-- Información de Contacto -->
        <div class="config-card">
          <div class="card-header">
            <h3><i class="fas fa-phone"></i> Información de Contacto</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>Teléfono Principal</label>
              <input 
                :value="configuracion.telefono?.numero || ''" 
                @input="updateTelefono"
                type="text" 
                class="form-control"
                placeholder="Ej: 948435269"
              >
              <small class="form-text">Solo números, sin espacios ni símbolos</small>
            </div>
            <div class="form-group">
              <label>Email Principal</label>
              <input 
                :value="configuracion.emails?.principal || ''" 
                @input="updateEmail"
                type="email" 
                class="form-control"
                placeholder="Ej: contacto@alsimtex.com"
              >
            </div>
            <div class="form-group">
              <label>Email Información</label>
              <input 
                :value="configuracion.emails?.info || ''" 
                @input="updateEmailInfo"
                type="email" 
                class="form-control"
                placeholder="Ej: info@alsimtex.com"
              >
            </div>
            <div class="form-group">
              <label>Dirección Completa</label>
              <input 
                :value="configuracion.direccion?.completa || ''" 
                @input="updateDireccion"
                type="text" 
                class="form-control"
                placeholder="Ej: Av. Argentina, Arequipa"
              >
            </div>
          </div>
        </div>

        <!-- Métodos de Pago -->
        <div class="config-card">
          <div class="card-header">
            <h3><i class="fas fa-credit-card"></i> Métodos de Pago</h3>
          </div>
          <div class="card-body">
            <div class="payment-section">
              <h4><i class="fas fa-mobile-alt"></i> Yape</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Número Yape</label>
                  <input 
                    :value="configuracion.pagos?.yape?.numero || ''" 
                    @input="updateYape"
                    type="text" 
                    class="form-control"
                    placeholder="Ej: 948435269"
                  >
                </div>
                <div class="form-group">
                  <label>Titular</label>
                  <input 
                    :value="configuracion.pagos?.yape?.titular || ''" 
                    @input="updateYapeTitular"
                    type="text" 
                    class="form-control"
                    placeholder="Ej: Alsimtex S.A.C."
                  >
                </div>
              </div>
            </div>

            <div class="payment-section">
              <h4><i class="fas fa-mobile-alt"></i> Plin</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Número Plin</label>
                  <input 
                    :value="configuracion.pagos?.plin?.numero || ''" 
                    @input="updatePlin"
                    type="text" 
                    class="form-control"
                    placeholder="Ej: 948435269"
                  >
                </div>
                <div class="form-group">
                  <label>Titular</label>
                  <input 
                    :value="configuracion.pagos?.plin?.titular || ''" 
                    @input="updatePlinTitular"
                    type="text" 
                    class="form-control"
                    placeholder="Ej: Alsimtex S.A.C."
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Horarios de Atención -->
        <div class="config-card">
          <div class="card-header">
            <h3><i class="fas fa-clock"></i> Horarios de Atención</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label>Lunes a Viernes</label>
              <input 
                :value="configuracion.horarios?.lunesViernes || ''" 
                @input="updateHorarioLunesViernes"
                type="text" 
                class="form-control"
                placeholder="Ej: 8:00 AM - 6:00 PM"
              >
            </div>
            <div class="form-group">
              <label>Sábado</label>
              <input 
                :value="configuracion.horarios?.sabado || ''" 
                @input="updateHorarioSabado"
                type="text" 
                class="form-control"
                placeholder="Ej: 9:00 AM - 1:00 PM"
              >
            </div>
            <div class="form-group">
              <label>Domingo</label>
              <input 
                :value="configuracion.horarios?.domingo || ''" 
                @input="updateHorarioDomingo"
                type="text" 
                class="form-control"
                placeholder="Ej: Cerrado"
              >
            </div>
          </div>
        </div>

        <!-- Redes Sociales y Web -->
        <div class="config-card">
          <div class="card-header">
            <h3><i class="fas fa-share-alt"></i> Redes Sociales y Presencia Digital</h3>
          </div>
          <div class="card-body">
            <div class="social-section">
              <h4><i class="fas fa-globe"></i> Sitio Web</h4>
              <div class="form-group">
                <label>URL Principal</label>
                <input 
                  :value="configuracion.web?.url || ''" 
                  @input="updateWebUrl"
                  type="text" 
                  class="form-control"
                  placeholder="Ej: www.alsimtex.com"
                >
                <small class="form-text">Solo el dominio, sin https://</small>
              </div>
            </div>

            <div class="social-section">
              <h4><i class="fab fa-facebook"></i> Facebook</h4>
              <div class="form-group">
                <label>Página de Facebook</label>
                <input 
                  :value="configuracion.redesSociales?.facebook || ''" 
                  @input="updateFacebook"
                  type="url" 
                  class="form-control"
                  placeholder="Ej: https://facebook.com/alsimtex"
                >
                <small class="form-text">URL completa de tu página de Facebook</small>
              </div>
            </div>

            <div class="social-section">
              <h4><i class="fab fa-instagram"></i> Instagram</h4>
              <div class="form-group">
                <label>Perfil de Instagram</label>
                <input 
                  :value="configuracion.redesSociales?.instagram || ''" 
                  @input="updateInstagram"
                  type="url" 
                  class="form-control"
                  placeholder="Ej: https://instagram.com/alsimtex"
                >
                <small class="form-text">URL completa de tu perfil de Instagram</small>
              </div>
            </div>

            <div class="social-section">
              <h4><i class="fab fa-whatsapp"></i> WhatsApp Business</h4>
              <div class="form-group">
                <label>WhatsApp Empresarial</label>
                <input 
                  :value="configuracion.telefono ? `https://wa.me/51${configuracion.telefono.numero}` : ''"
                  type="text" 
                  class="form-control"
                  readonly
                  placeholder="Se genera automáticamente desde el teléfono"
                >
                <small class="form-text">Se actualiza automáticamente cuando cambias el teléfono principal</small>
              </div>
            </div>

            <div class="social-section">
              <h4><i class="fab fa-tiktok"></i> Otras Redes (Opcional)</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>TikTok</label>
                  <input 
                    :value="configuracion.redesSociales?.tiktok || ''" 
                    @input="updateTiktok"
                    type="url" 
                    class="form-control"
                    placeholder="Ej: https://tiktok.com/@alsimtex"
                  >
                </div>
                <div class="form-group">
                  <label>YouTube</label>
                  <input 
                    :value="configuracion.redesSociales?.youtube || ''" 
                    @input="updateYoutube" 
                    type="url" 
                    class="form-control"
                    placeholder="Ej: https://youtube.com/@alsimtex"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Personalización de Tema -->
      <div class="config-card">
        <div class="card-header">
          <h3><i class="fas fa-paint-brush"></i> Personalización del Tema</h3>
        </div>
        <div class="card-body">
          <div class="theme-section">
            <h4>Colores Principales</h4>
            <div class="color-pickers">
              <div class="form-group">
                <label>Color Principal</label>
                <div class="color-picker-wrapper">
                  <input 
                    type="color" 
                    :value="configuracion.tema?.colorPrincipal || '#1a237e'"
                    @input="updateColorPrincipal"
                    @change="aplicarTema"
                    class="color-input"
                  >
                  <span class="color-value">{{ configuracion.tema?.colorPrincipal || '#1a237e' }}</span>
                </div>
              </div>
              <div class="form-group">
                <label>Color Secundario</label>
                <div class="color-picker-wrapper">
                  <input 
                    type="color" 
                    :value="configuracion.tema?.colorSecundario || '#14b8a6'"
                    @input="updateColorSecundario"
                    @change="aplicarTema"
                    class="color-input"
                  >
                  <span class="color-value">{{ configuracion.tema?.colorSecundario || '#14b8a6' }}</span>
                </div>
              </div>
            </div>
            <div class="theme-presets">
              <h4>Temas Predefinidos</h4>
              <div class="preset-buttons">
                <button 
                  class="preset-button"
                  v-for="(preset, name) in temasPreconfigurados"
                  :key="name"
                  @click="aplicarTemaPreconfigurado(preset)"
                  :style="{
                    backgroundColor: preset.colorPrincipal,
                    borderColor: preset.colorSecundario
                  }"
                >
                  {{ name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vista Previa -->
      <div class="config-card preview-card">
        <div class="card-header">
          <h3><i class="fas fa-eye"></i> Vista Previa</h3>
        </div>
        <div class="card-body">
          <div class="preview-section">
            <h4>Información que aparecerá en la web:</h4>
            <div class="preview-content">
              <div class="preview-grid">
                <div class="preview-column">
                  <h5>Datos Principales</h5>
                  <p><strong>Empresa:</strong> {{ configuracion.nombre }}</p>
                  <p><strong>RUC:</strong> {{ configuracion.datosLegales?.ruc || '20453859224' }}</p>
                  <p><strong>Teléfono:</strong> {{ formatearTelefono(configuracion.telefono?.numero) }}</p>
                  <p><strong>Email:</strong> {{ configuracion.emails?.principal || 'contacto@alsimtex.com' }}</p>
                  <p><strong>Dirección:</strong> {{ configuracion.direccion?.completa || 'Av. Argentina, Arequipa' }}</p>
                </div>
                
                <div class="preview-column">
                  <h5>Métodos de Pago</h5>
                  <p><strong>Yape:</strong> {{ formatearNumero(configuracion.pagos?.yape?.numero) }}</p>
                  <p><strong>Plin:</strong> {{ formatearNumero(configuracion.pagos?.plin?.numero) }}</p>
                  <p><strong>Horario:</strong> {{ configuracion.horarios?.lunesViernes || '8:00 AM - 6:00 PM' }}</p>
                </div>
                
                <div class="preview-column">
                  <h5>Presencia Digital</h5>
                  <p v-if="configuracion.web?.url"><strong>Web:</strong> {{ configuracion.web.url }}</p>
                  <p v-if="configuracion.redesSociales?.facebook"><strong>Facebook:</strong> ✓ Configurado</p>
                  <p v-if="configuracion.redesSociales?.instagram"><strong>Instagram:</strong> ✓ Configurado</p>
                  <p v-if="configuracion.redesSociales?.tiktok"><strong>TikTok:</strong> ✓ Configurado</p>
                  <p v-if="configuracion.redesSociales?.youtube"><strong>YouTube:</strong> ✓ Configurado</p>
                  <p><strong>WhatsApp:</strong> +51 {{ formatearNumero(configuracion.telefono?.numero || '948435269') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitulo }}</h3>
          <button @click="cerrarModal" class="btn-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>{{ modalMensaje }}</p>
        </div>
        <div class="modal-footer">
          <button @click="cerrarModal" class="btn btn-secondary">Cerrar</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AdminLayout from '../../components/AdminLayout.vue'
import { useEmpresaConfig } from '../../composables/useEmpresaConfig'

// Usar el composable de configuración de empresa
const {
  configuracionEmpresa,
  estadoConfiguracion,
  guardarConfiguracion: guardarConfig,
  formatearTelefonos,
  formatearNumero,
  asegurarEstructura
} = useEmpresaConfig()

// Estados locales
const configuracion = ref({
  tema: {
    colorPrincipal: '#1a237e',
    colorSecundario: '#14b8a6'
  }
})
const mostrarModal = ref(false)
const modalTitulo = ref('')
const modalMensaje = ref('')

// Computed para estados
const guardando = computed(() => estadoConfiguracion.guardando)
const cargando = computed(() => estadoConfiguracion.cargando)

// Cargar configuración inicial
onMounted(() => {
  asegurarEstructura()
  cargarConfiguracion()
})

const cargarConfiguracion = () => {
  try {
    // Clonar la configuración para evitar mutaciones directas
    configuracion.value = JSON.parse(JSON.stringify(configuracionEmpresa))
    
    // Asegurar que todos los objetos anidados existan
    if (!configuracion.value.datosLegales) {
      configuracion.value.datosLegales = {
        ruc: '20453859224',
        razonSocial: 'Alsimtex S.A.C.',
        tipoEmpresa: 'Sociedad Anónima Cerrada'
      }
    }
    
    if (!configuracion.value.telefono) {
      configuracion.value.telefono = {
        numero: '948435269',
        numeroCompleto: '+51 948 435 269',
        whatsapp: '51948435269',
        display: '+51 948 435 269'
      }
    }
    
    if (!configuracion.value.emails) {
      configuracion.value.emails = {
        principal: 'contacto@alsimtex.com',
        info: 'info@alsimtex.com',
        ventas: 'ventas@alsimtex.com'
      }
    }
    
    if (!configuracion.value.pagos) {
      configuracion.value.pagos = {
        yape: { numero: '948435269', numeroDisplay: '948 435 269', titular: 'Alsimtex S.A.C.' },
        plin: { numero: '948435269', numeroDisplay: '948 435 269', titular: 'Alsimtex S.A.C.' }
      }
    }
    
    if (!configuracion.value.redesSociales) {
      configuracion.value.redesSociales = {
        facebook: '',
        instagram: '',
        whatsapp: '',
        tiktok: '',
        youtube: ''
      }
    }
    
    if (!configuracion.value.tema) {
      configuracion.value.tema = {
        colorPrincipal: '#1a237e',
        colorSecundario: '#14b8a6'
      }
    }
    
  } catch (error) {
    console.error('Error cargando configuración:', error)
    // Si hay error, usar configuración por defecto
    configuracion.value = {
      nombre: 'Alsimtex S.A.C.',
      eslogan: 'Calidad y confort para tu hogar',
      telefono: {
        numero: '948435269',
        numeroCompleto: '+51 948 435 269',
        whatsapp: '51948435269',
        display: '+51 948 435 269'
      },
      emails: {
        principal: 'contacto@alsimtex.com',
        info: 'info@alsimtex.com',
        ventas: 'ventas@alsimtex.com'
      },
      direccion: {
        completa: 'Av. Argentina, Arequipa',
        ciudad: 'Arequipa',
        pais: 'Perú'
      },
      datosLegales: {
        ruc: '20453859224',
        razonSocial: 'Alsimtex S.A.C.',
        tipoEmpresa: 'Sociedad Anónima Cerrada'
      },
      pagos: {
        yape: { numero: '948435269', numeroDisplay: '948 435 269', titular: 'Alsimtex S.A.C.' },
        plin: { numero: '948435269', numeroDisplay: '948 435 269', titular: 'Alsimtex S.A.C.' }
      },
      redesSociales: {
        facebook: '',
        instagram: '',
        whatsapp: '',
        tiktok: '',
        youtube: ''
      },
      horarios: {
        lunesViernes: '8:00 AM - 6:00 PM',
        sabado: '9:00 AM - 1:00 PM',
        domingo: 'Cerrado'
      },
      web: {
        url: 'www.alsimtex.com'
      },
      tema: {
        colorPrincipal: '#1a237e',
        colorSecundario: '#14b8a6'
      }
    }
  }
}

// Temas preconfigurados
const temasPreconfigurados = {
  'Azul Clásico': {
    colorPrincipal: '#1a237e',
    colorSecundario: '#14b8a6'
  },
  'Verde Natural': {
    colorPrincipal: '#2e7d32',
    colorSecundario: '#66bb6a'
  },
  'Rojo Pasión': {
    colorPrincipal: '#c62828',
    colorSecundario: '#ef5350'
  },
  'Morado Elegante': {
    colorPrincipal: '#6a1b9a',
    colorSecundario: '#ab47bc'
  },
  'Naranja Vibrante': {
    colorPrincipal: '#e65100',
    colorSecundario: '#ff9800'
  }
}

// Función para aplicar tema
const aplicarTema = () => {
  if (!configuracion.value.tema) return
  
  const root = document.documentElement
  root.style.setProperty('--primary-color', configuracion.value.tema.colorPrincipal)
  root.style.setProperty('--secondary-color', configuracion.value.tema.colorSecundario)
}

// Función para aplicar tema preconfigurado
const aplicarTemaPreconfigurado = (preset) => {
  if (!configuracion.value.tema) {
    configuracion.value.tema = {}
  }
  configuracion.value.tema.colorPrincipal = preset.colorPrincipal
  configuracion.value.tema.colorSecundario = preset.colorSecundario
  aplicarTema()
}

// Funciones para formatear números automáticamente
const actualizarTelefonos = () => {
  if (!configuracion.value.telefono) return
  const numero = configuracion.value.telefono.numero
  if (!numero) return
  const telefFormateado = formatearTelefonos(numero)
  Object.assign(configuracion.value.telefono, telefFormateado)
}

const actualizarYape = () => {
  if (!configuracion.value.pagos?.yape) return
  const numero = configuracion.value.pagos.yape.numero
  if (!numero) return
  configuracion.value.pagos.yape.numeroDisplay = formatearNumero(numero)
}

const actualizarPlin = () => {
  if (!configuracion.value.pagos?.plin) return
  const numero = configuracion.value.pagos.plin.numero
  if (!numero) return
  configuracion.value.pagos.plin.numeroDisplay = formatearNumero(numero)
}

const updateRuc = (event) => {
  if (!configuracion.value.datosLegales) {
    configuracion.value.datosLegales = {}
  }
  configuracion.value.datosLegales.ruc = event.target.value
}

const updateTelefono = (event) => {
  if (!configuracion.value.telefono) {
    configuracion.value.telefono = {}
  }
  configuracion.value.telefono.numero = event.target.value
  // Llamar también al formateador
  actualizarTelefonos()
}

const updateYape = (event) => {
  if (!configuracion.value.pagos) {
    configuracion.value.pagos = {}
  }
  if (!configuracion.value.pagos.yape) {
    configuracion.value.pagos.yape = {}
  }
  configuracion.value.pagos.yape.numero = event.target.value
  actualizarYape()
}

const updatePlin = (event) => {
  if (!configuracion.value.pagos) {
    configuracion.value.pagos = {}
  }
  if (!configuracion.value.pagos.plin) {
    configuracion.value.pagos.plin = {}
  }
  configuracion.value.pagos.plin.numero = event.target.value
  actualizarPlin()
}

const updateEmail = (event) => {
  if (!configuracion.value.emails) {
    configuracion.value.emails = {}
  }
  configuracion.value.emails.principal = event.target.value
}

const updateEmailInfo = (event) => {
  if (!configuracion.value.emails) {
    configuracion.value.emails = {}
  }
  configuracion.value.emails.info = event.target.value
}

const updateDireccion = (event) => {
  if (!configuracion.value.direccion) {
    configuracion.value.direccion = {}
  }
  configuracion.value.direccion.completa = event.target.value
}

const updateYapeTitular = (event) => {
  if (!configuracion.value.pagos) {
    configuracion.value.pagos = {}
  }
  if (!configuracion.value.pagos.yape) {
    configuracion.value.pagos.yape = {}
  }
  configuracion.value.pagos.yape.titular = event.target.value
}

const updatePlinTitular = (event) => {
  if (!configuracion.value.pagos) {
    configuracion.value.pagos = {}
  }
  if (!configuracion.value.pagos.plin) {
    configuracion.value.pagos.plin = {}
  }
  configuracion.value.pagos.plin.titular = event.target.value
}

const updateHorarioLunesViernes = (event) => {
  if (!configuracion.value.horarios) {
    configuracion.value.horarios = {}
  }
  configuracion.value.horarios.lunesViernes = event.target.value
}

const updateHorarioSabado = (event) => {
  if (!configuracion.value.horarios) {
    configuracion.value.horarios = {}
  }
  configuracion.value.horarios.sabado = event.target.value
}

const updateHorarioDomingo = (event) => {
  if (!configuracion.value.horarios) {
    configuracion.value.horarios = {}
  }
  configuracion.value.horarios.domingo = event.target.value
}

const updateWebUrl = (event) => {
  if (!configuracion.value.web) {
    configuracion.value.web = {}
  }
  configuracion.value.web.url = event.target.value
}

const updateFacebook = (event) => {
  if (!configuracion.value.redesSociales) {
    configuracion.value.redesSociales = {}
  }
  configuracion.value.redesSociales.facebook = event.target.value
}

const updateInstagram = (event) => {
  if (!configuracion.value.redesSociales) {
    configuracion.value.redesSociales = {}
  }
  configuracion.value.redesSociales.instagram = event.target.value
}

const updateTiktok = (event) => {
  if (!configuracion.value.redesSociales) {
    configuracion.value.redesSociales = {}
  }
  configuracion.value.redesSociales.tiktok = event.target.value
}

const updateYoutube = (event) => {
  if (!configuracion.value.redesSociales) {
    configuracion.value.redesSociales = {}
  }
  configuracion.value.redesSociales.youtube = event.target.value
}

const updateColorPrincipal = (event) => {
  if (!configuracion.value.tema) {
    configuracion.value.tema = {}
  }
  configuracion.value.tema.colorPrincipal = event.target.value
}

const updateColorSecundario = (event) => {
  if (!configuracion.value.tema) {
    configuracion.value.tema = {}
  }
  configuracion.value.tema.colorSecundario = event.target.value
}

const formatearTelefono = (numero) => {
  try {
    if (!numero) return '+51 948 435 269'
    return `+51 ${formatearNumero(numero)}`
  } catch (error) {
    console.warn('Error formateando teléfono:', error)
    return '+51 948 435 269'
  }
}

const guardarConfiguracion = async () => {
  try {
    const resultado = await guardarConfig(configuracion.value)
    
    if (resultado.success) {
      modalTitulo.value = '¡Éxito!'
      modalMensaje.value = 'La configuración se ha guardado correctamente. Los cambios se aplicarán en toda la web. La página se recargará automáticamente.'
    } else {
      modalTitulo.value = 'Error'
      modalMensaje.value = resultado.error || 'Hubo un problema al guardar la configuración.'
    }
    mostrarModal.value = true
    
  } catch (error) {
    modalTitulo.value = 'Error'
    modalMensaje.value = 'Hubo un problema al guardar la configuración. Por favor, inténtalo de nuevo.'
    mostrarModal.value = true
  }
}

const cerrarModal = () => {
  mostrarModal.value = false
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-color);
}

.page-title {
  font-size: var(--font-3xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: var(--font-bold);
}

.subtitle {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-lg);
}

.config-sections {
  display: grid;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
}

.config-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  background: var(--gradient-primary);
  color: white;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.card-header h3 {
  margin: 0;
  font-size: var(--font-xl);
  font-weight: var(--font-semibold);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.card-body {
  padding: var(--spacing-xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  transition: all var(--transition-fast);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-text {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-top: var(--spacing-xs);
}

.payment-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.payment-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.payment-section h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.preview-card {
  border: 2px solid var(--secondary-color);
}

.preview-section h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.preview-content {
  background: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--secondary-color);
}

.preview-content p {
  margin: var(--spacing-sm) 0;
  color: var(--text-primary);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-lg);
}

.preview-column h5 {
  color: var(--secondary-color);
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-xs);
  border-bottom: 2px solid var(--secondary-color);
}

.social-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.social-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.social-section h4 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  text-decoration: none;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.btn-close {
  background: none;
  border: none;
  font-size: var(--font-2xl);
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-body p {
  color: var(--text-primary);
  margin: 0;
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .container {
    padding: var(--spacing-md);
  }
}
</style>