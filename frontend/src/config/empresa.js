// Función para obtener configuración guardada o usar valores por defecto
const getConfiguracionGuardada = () => {
  if (typeof window !== 'undefined') {
    try {
      const configGuardada = localStorage.getItem('alsimtex_empresa_config')
      if (configGuardada) {
        return JSON.parse(configGuardada)
      }
    } catch (error) {
      console.error('Error al cargar configuración guardada:', error)
    }
  }
  return null
}

// Configuración por defecto
const empresaConfigDefault = {
  // Información básica
  nombre: 'Alsimtex S.A.C.',
  eslogan: 'Calidad y confort para tu hogar',
  
  // Contacto
  telefono: {
    numero: '948435269',
    numeroCompleto: '+51 948 435 269',
    whatsapp: '51948435269', // Para URLs de WhatsApp (sin +)
    display: '+51 948 435 269' // Para mostrar en la interfaz
  },
  
  // Emails
  emails: {
    principal: 'contacto@alsimtex.com',
    info: 'info@alsimtex.com',
    ventas: 'ventas@alsimtex.com'
  },
  
  // Dirección
  direccion: {
    completa: 'Av. Argentina, Arequipa',
    ciudad: 'Arequipa',
    pais: 'Perú'
  },
  
  // Horarios de atención
  horarios: {
    lunesViernes: '8:00 AM - 6:00 PM',
    sabado: '9:00 AM - 1:00 PM',
    domingo: 'Cerrado',
    // Para mostrar en interfaces
    completo: {
      'Lunes - Viernes': '8:00 AM - 6:00 PM',
      'Sábado': '9:00 AM - 1:00 PM',
      'Domingo': 'Cerrado'
    }
  },
  
  // Métodos de pago
  pagos: {
    yape: {
      numero: '948435269',
      numeroDisplay: '948 435 269',
      titular: 'Alsimtex S.A.C.'
    },
    plin: {
      numero: '948435269',
      numeroDisplay: '948 435 269',
      titular: 'Alsimtex S.A.C.'
    },
    bancarios: {
      bcp: {
        cuentaCorriente: '194-123456789-0-12',
        cuentaInterbancaria: '002-194-123456789012-34',
        titular: 'Alsimtex S.A.C.'
      },
      // Agregar más bancos según necesidad
    }
  },
  
  // Redes sociales
  redesSociales: {
    facebook: 'https://facebook.com/alsimtex',
    instagram: 'https://instagram.com/alsimtex',
    whatsapp: 'https://wa.me/51948435269',
    tiktok: '',
    youtube: ''
  },
  
  // Sitio web
  web: {
    url: 'www.alsimtex.com',
    urlCompleta: 'https://www.alsimtex.com'
  },
  
  // RUC y datos fiscales
  datosLegales: {
    ruc: '20453859224',
    razonSocial: 'Alsimtex S.A.C.',
    tipoEmpresa: 'Sociedad Anónima Cerrada'
  }
};

// Funciones de utilidad para obtener información específica (con valores por defecto seguros)
export const getWhatsAppUrl = (mensaje = '') => {
  // FORZAR el número correcto - eliminar cualquier cache malo
  let numeroWhatsApp = '51948435269'; // número por defecto de ALSIMTEX
  
  try {
    const configGuardada = localStorage.getItem('alsimtex_empresa_config');
    console.log('🔍 getWhatsAppUrl - Config localStorage:', configGuardada);
    
    if (configGuardada) {
      const config = JSON.parse(configGuardada);
      console.log('📱 getWhatsAppUrl - Teléfono en config:', config.telefono);
      
      if (config.telefono?.numero) {
        numeroWhatsApp = `51${config.telefono.numero}`;
        console.log('✅ getWhatsAppUrl - Número final:', numeroWhatsApp);
      }
    }
  } catch (error) {
    console.warn('❌ Error obteniendo config para WhatsApp:', error);
  }
  
  // NUNCA permitir 51987654321 - LIMPIAR CACHE CORRUPTO
  if (numeroWhatsApp === '51987654321') {
    console.warn('🚫 Número 51987654321 detectado - LIMPIANDO CACHE CORRUPTO');
    
    // Limpiar localStorage corrupto
    try {
      localStorage.removeItem('alsimtex_empresa_config');
      console.log('🧹 Cache corrupto eliminado');
      
      // Forzar configuración correcta
      const configCorrecta = {
        ...empresaConfigDefault,
        telefono: {
          numero: '948435269',
          numeroCompleto: '+51 948 435 269',
          whatsapp: '51948435269',
          display: '+51 948 435 269'
        }
      };
      
      localStorage.setItem('alsimtex_empresa_config', JSON.stringify(configCorrecta));
      console.log('✅ Configuración correcta guardada en localStorage');
      
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
    }
    
    numeroWhatsApp = '51948435269';
  }
  
  const url = `https://wa.me/${numeroWhatsApp}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`;
  console.log('🔗 URL WhatsApp generada:', url);
  
  return url;
};

export const getTelefonoCompleto = () => {
  return empresaConfig?.telefono?.numeroCompleto || '+51 948 435 269';
};

export const getTelefonoDisplay = () => {
  return empresaConfig?.telefono?.display || '+51 948 435 269';
};

export const getNumeroWhatsApp = () => {
  return empresaConfig?.telefono?.whatsapp || '51948435269';
};

export const getEmailPrincipal = () => {
  return empresaConfig?.emails?.principal || 'contacto@alsimtex.com';
};

export const getDireccionCompleta = () => {
  return empresaConfig?.direccion?.completa || 'Av. Argentina, Arequipa';
};

export const getHorarios = () => {
  return empresaConfig?.horarios?.completo || {
    'Lunes - Viernes': '8:00 AM - 6:00 PM',
    'Sábado': '9:00 AM - 1:00 PM',
    'Domingo': 'Cerrado'
  };
};

export const getYapeNumber = () => {
  return empresaConfig?.pagos?.yape?.numero || '948435269';
};

export const getPlinNumber = () => {
  return empresaConfig?.pagos?.plin?.numero || '948435269';
};

export const getRuc = () => {
  return empresaConfig?.datosLegales?.ruc || '20453859224';
};

// Función para combinar configuración de forma segura
const combinarConfiguracion = (configDefault, configGuardada) => {
  if (!configGuardada) return configDefault
  
  return {
    ...configDefault,
    ...configGuardada,
    // Asegurar que objetos anidados estén completos
    telefono: { ...configDefault.telefono, ...(configGuardada.telefono || {}) },
    emails: { ...configDefault.emails, ...(configGuardada.emails || {}) },
    direccion: { ...configDefault.direccion, ...(configGuardada.direccion || {}) },
    horarios: { ...configDefault.horarios, ...(configGuardada.horarios || {}) },
    pagos: {
      ...configDefault.pagos,
      ...(configGuardada.pagos || {}),
      yape: { ...configDefault.pagos.yape, ...(configGuardada.pagos?.yape || {}) },
      plin: { ...configDefault.pagos.plin, ...(configGuardada.pagos?.plin || {}) },
      bancarios: { ...configDefault.pagos.bancarios, ...(configGuardada.pagos?.bancarios || {}) }
    },
    redesSociales: { ...configDefault.redesSociales, ...(configGuardada.redesSociales || {}) },
    web: { ...configDefault.web, ...(configGuardada.web || {}) },
    datosLegales: { ...configDefault.datosLegales, ...(configGuardada.datosLegales || {}) }
  }
}

// Función para limpiar completamente el cache y restaurar configuración correcta
export const limpiarCacheYRestaurar = () => {
  try {
    console.log('🧹 Limpiando todo el cache de empresa...');
    
    // Eliminar todas las claves relacionadas
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('alsimtex') || key.includes('empresa') || key.includes('whatsapp')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Eliminado: ${key}`);
      }
    });
    
    // Restaurar configuración correcta
    const configLimpia = {
      ...empresaConfigDefault,
      telefono: {
        numero: '948435269',
        numeroCompleto: '+51 948 435 269',
        whatsapp: '51948435269',
        display: '+51 948 435 269'
      }
    };
    
    localStorage.setItem('alsimtex_empresa_config', JSON.stringify(configLimpia));
    console.log('✅ Configuración limpia restaurada');
    
    // Forzar recarga de la página
    setTimeout(() => {
      window.location.reload();
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
    return false;
  }
};

// Combinar configuración guardada con valores por defecto
const configGuardada = getConfiguracionGuardada()
export const empresaConfig = combinarConfiguracion(empresaConfigDefault, configGuardada)

export default empresaConfig;