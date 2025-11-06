import { ref, reactive } from 'vue'
import { empresaConfig } from '../config/empresa'

// Estado global de la configuración
const configuracionEmpresa = reactive({
  ...empresaConfig
})

// Cargar configuración automáticamente al importar
const cargarConfiguracionInicial = () => {
  try {
    const configGuardada = localStorage.getItem('alsimtex_empresa_config')
    if (configGuardada) {
      const config = JSON.parse(configGuardada)
      Object.assign(configuracionEmpresa, config)
    }
  } catch (error) {
    console.warn('Error cargando configuración inicial:', error)
  }
}

// Ejecutar la carga inicial
cargarConfiguracionInicial()

// Listener para cambios en localStorage (para sincronizar entre pestañas)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'alsimtex_empresa_config') {
      cargarConfiguracionInicial()
    }
  })
}

// Estado de carga y guardado
const estadoConfiguracion = reactive({
  cargando: false,
  guardando: false,
  error: null,
  ultimaActualizacion: null
})

export function useEmpresaConfig() {
  
  // Función para cargar configuración desde localStorage o servidor
  const cargarConfiguracion = async () => {
    estadoConfiguracion.cargando = true
    estadoConfiguracion.error = null
    
    try {
      // Intentar cargar desde localStorage primero
      const configGuardada = localStorage.getItem('alsimtex_empresa_config')
      if (configGuardada) {
        const config = JSON.parse(configGuardada)
        Object.assign(configuracionEmpresa, config)
        estadoConfiguracion.ultimaActualizacion = new Date(localStorage.getItem('alsimtex_config_timestamp') || Date.now())
      }
      
      // En el futuro, aquí se haría una llamada al servidor
      // const response = await fetch('/api/configuracion-empresa')
      // const serverConfig = await response.json()
      // Object.assign(configuracionEmpresa, serverConfig)
      
    } catch (error) {
      estadoConfiguracion.error = 'Error al cargar la configuración'
      console.error('Error cargando configuración:', error)
    } finally {
      estadoConfiguracion.cargando = false
    }
  }

  // Función para guardar configuración
  const guardarConfiguracion = async (nuevaConfig) => {
    estadoConfiguracion.guardando = true
    estadoConfiguracion.error = null
    
    try {
      // Validar la configuración antes de guardar
      if (!validarConfiguracion(nuevaConfig)) {
        throw new Error('Configuración inválida')
      }

      // Guardar en localStorage
      localStorage.setItem('alsimtex_empresa_config', JSON.stringify(nuevaConfig))
      localStorage.setItem('alsimtex_config_timestamp', new Date().toISOString())
      
      // Actualizar el estado global
      Object.assign(configuracionEmpresa, nuevaConfig)
      estadoConfiguracion.ultimaActualizacion = new Date()
      
      // En el futuro, aquí se haría una llamada al servidor
      // await fetch('/api/configuracion-empresa', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(nuevaConfig)
      // })
      
      // Recargar la página para aplicar cambios en todos los componentes
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
      return { success: true, message: 'Configuración guardada correctamente' }
      
    } catch (error) {
      estadoConfiguracion.error = error.message || 'Error al guardar la configuración'
      console.error('Error guardando configuración:', error)
      return { success: false, error: estadoConfiguracion.error }
    } finally {
      estadoConfiguracion.guardando = false
    }
  }

  // Función para validar la configuración
  const validarConfiguracion = (config) => {
    try {
      // Validaciones básicas
      if (!config?.nombre || config.nombre.trim() === '') {
        throw new Error('El nombre de la empresa es requerido')
      }
      
      if (!config?.telefono?.numero || config.telefono.numero.trim() === '') {
        throw new Error('El teléfono es requerido')
      }
      
      // Validar formato de teléfono (solo números)
      if (!/^\d{9}$/.test(config.telefono.numero)) {
        throw new Error('El teléfono debe tener 9 dígitos')
      }
      
      if (!config?.emails?.principal || !isValidEmail(config.emails.principal)) {
        throw new Error('El email principal es requerido y debe ser válido')
      }
      
      // Validar RUC (debe tener 11 dígitos) - validación opcional
      if (config?.datosLegales?.ruc && !/^\d{11}$/.test(config.datosLegales.ruc)) {
        throw new Error('El RUC debe tener exactamente 11 dígitos')
      }
      
      return true
    } catch (error) {
      console.error('Error en validación:', error)
      throw error
    }
  }

  // Función auxiliar para validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Función para formatear números automáticamente
  const formatearTelefonos = (numero) => {
    if (!numero) return { numeroCompleto: '', whatsapp: '', display: '' }
    
    const numeroLimpio = numero.replace(/\D/g, '').slice(0, 9)
    return {
      numeroCompleto: `+51 ${formatearNumero(numeroLimpio)}`,
      whatsapp: `51${numeroLimpio}`,
      display: `+51 ${formatearNumero(numeroLimpio)}`
    }
  }

  const formatearNumero = (numero) => {
    if (!numero) return ''
    return numero.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
  }

  // Función para resetear a valores por defecto
  const resetearConfiguracion = () => {
    Object.assign(configuracionEmpresa, empresaConfig)
    localStorage.removeItem('alsimtex_empresa_config')
    localStorage.removeItem('alsimtex_config_timestamp')
  }

  // Función para obtener configuración actual
  const obtenerConfiguracion = () => {
    return { ...configuracionEmpresa }
  }

  // Funciones de utilidad para obtener valores específicos (con fallbacks seguros)
  const getTelefono = () => {
    try {
      return configuracionEmpresa?.telefono?.display || '+51 948 435 269'
    } catch (error) {
      console.warn('Error obteniendo teléfono:', error)
      return '+51 948 435 269'
    }
  }
  
  const getWhatsApp = () => {
    try {
      // Obtener el número actual y formatear para WhatsApp
      const numero = configuracionEmpresa?.telefono?.numero || '948435269'
      return `51${numero}`
    } catch (error) {
      console.warn('Error obteniendo WhatsApp:', error)
      return '51948435269'
    }
  }
  
  const getEmail = () => {
    try {
      return configuracionEmpresa?.emails?.principal || 'contacto@alsimtex.com'
    } catch (error) {
      console.warn('Error obteniendo email:', error)
      return 'contacto@alsimtex.com'
    }
  }
  
  const getDireccion = () => {
    try {
      return configuracionEmpresa?.direccion?.completa || 'Av. Argentina, Arequipa'
    } catch (error) {
      console.warn('Error obteniendo dirección:', error)
      return 'Av. Argentina, Arequipa'
    }
  }
  
  const getYapeNumber = () => {
    try {
      return configuracionEmpresa?.pagos?.yape?.numero || '948435269'
    } catch (error) {
      console.warn('Error obteniendo número Yape:', error)
      return '948435269'
    }
  }
  
  const getPlinNumber = () => {
    try {
      return configuracionEmpresa?.pagos?.plin?.numero || '948435269'
    } catch (error) {
      console.warn('Error obteniendo número Plin:', error)
      return '948435269'
    }
  }
  
  const getRuc = () => {
    try {
      return configuracionEmpresa?.datosLegales?.ruc || '20453859224'
    } catch (error) {
      console.warn('Error obteniendo RUC:', error)
      return '20453859224'
    }
  }

  // Auto-cargar configuración al inicializar
  if (typeof window !== 'undefined') {
    cargarConfiguracion()
  }

  return {
    // Estado
    configuracionEmpresa,
    estadoConfiguracion,
    
    // Métodos
    cargarConfiguracion,
    guardarConfiguracion,
    resetearConfiguracion,
    obtenerConfiguracion,
    formatearTelefonos,
    formatearNumero,
    
    // Getters
    getTelefono,
    getWhatsApp,
    getEmail,
    getDireccion,
    getYapeNumber,
    getPlinNumber,
    getRuc,
    
    // Función para asegurar estructura completa
    asegurarEstructura: () => {
      if (!configuracionEmpresa.telefono) {
        configuracionEmpresa.telefono = { numero: '948435269' }
      }
      if (!configuracionEmpresa.emails) {
        configuracionEmpresa.emails = { principal: 'contacto@alsimtex.com', info: 'info@alsimtex.com' }
      }
      if (!configuracionEmpresa.direccion) {
        configuracionEmpresa.direccion = { completa: 'Lima, Perú' }
      }
      if (!configuracionEmpresa.pagos) {
        configuracionEmpresa.pagos = {}
      }
      if (!configuracionEmpresa.pagos.yape) {
        configuracionEmpresa.pagos.yape = { numero: '948435269', titular: 'ALSIMTEX' }
      }
      if (!configuracionEmpresa.pagos.plin) {
        configuracionEmpresa.pagos.plin = { numero: '948435269', titular: 'ALSIMTEX' }
      }
      if (!configuracionEmpresa.datosLegales) {
        configuracionEmpresa.datosLegales = { ruc: '20453859224' }
      }
      if (!configuracionEmpresa.horarios) {
        configuracionEmpresa.horarios = {
          lunesViernes: 'Lunes a Viernes 8:00 AM - 6:00 PM',
          sabado: 'Sábado 9:00 AM - 1:00 PM',
          domingo: 'Cerrado'
        }
      }
      if (!configuracionEmpresa.redesSociales) {
        configuracionEmpresa.redesSociales = {
          facebook: '',
          instagram: '',
          whatsapp: '',
          tiktok: '',
          youtube: ''
        }
      }
      if (!configuracionEmpresa.web) {
        configuracionEmpresa.web = {
          url: 'www.alsimtex.com'
        }
      }
    }
  }
}