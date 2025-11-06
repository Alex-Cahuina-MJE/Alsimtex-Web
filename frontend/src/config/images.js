// Configuración para el manejo de imágenes
export const imageConfig = {
  // Dominios problemáticos conocidos con CORS
  problematicDomains: [
    // Medios y noticias
    '24horas.cl',
    'tvn.org',
    'prontus.tvn.org',
    
    // Retail peruano
    'falabella.com',
    'media.falabella.com',
    'assets.falabella.com',
    'falabellape.vtexassets.com',
    'sodimac.com',
    'ripley.com',
    'linio.com',
    'mercadolibre.com',
    'plazavea.com',
    'wong.pe',
    'tottus.com',
    'oechsle.pe',
    'hiraoka.com',
    'elektra.pe',
    'curacao.pe',
    
    // Google Images y servicios relacionados
    'gstatic.com',
    'googleusercontent.com',
    'encrypted-tbn0.gstatic.com',
    'encrypted-tbn1.gstatic.com',
    'encrypted-tbn2.gstatic.com',
    'encrypted-tbn3.gstatic.com',
    'images.google.com',
    
    // Otros servicios comunes con restricciones o lentitud
    'imgur.com',
    'i.imgur.com',
    'pinterest.com',
    'pinimg.com',
    'instagram.com',
    'cdninstagram.com',
    'facebook.com',
    'fbcdn.net',
    
    // Servicios de placeholder que pueden ser lentos
    'via.placeholder.com',
    'placeholder.com',
    'dummyimage.com',
    'placehold.it'
  ],

  // Dominios confiables que soportan CORS
  trustedDomains: [
    'picsum.photos',
    'unsplash.com'
  ],

  // Imagen de fallback por defecto
  defaultFallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==',

  // Imagen de error
  errorFallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2ZlZTJlMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNkYzI2MjYiPkVycm9yIGFsIGNhcmdhcjwvdGV4dD48L3N2Zz4=',

  // Timeout para carga de imágenes (milisegundos)
  loadTimeout: 10000,

  // Verificar si un dominio es problemático
  isProblematicDomain(url) {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Verificar dominios exactos o subdominios
      const isProblematic = this.problematicDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );
      
      // Verificaciones adicionales para patrones específicos
      if (!isProblematic) {
        // Google Images URLs con parámetros específicos
        if (hostname.includes('gstatic.com') && url.includes('images?q=tbn')) {
          return true;
        }
        
        // URLs de búsqueda de imágenes que suelen fallar
        if (url.includes('encrypted-tbn') || url.includes('images?q=')) {
          return true;
        }
        
        // URLs con parámetros de redimensionado que suelen tener CORS
        if (url.includes('w=') && url.includes('h=') && url.includes('fit=')) {
          return true;
        }
      }
      
      return isProblematic;
    } catch {
      // Si no es una URL válida, verificar si contiene algún dominio problemático
      return this.problematicDomains.some(domain => url.includes(domain));
    }
  },

  // Verificar si un dominio es confiable
  isTrustedDomain(url) {
    if (!url) return false;
    return this.trustedDomains.some(domain => url.includes(domain));
  },

  // Obtener URL de fallback apropiada
  getFallbackUrl(hasError = false) {
    return hasError ? this.errorFallback : this.defaultFallback;
  },

  // Validar si una URL de imagen es segura para cargar
  isSafeImageUrl(url) {
    if (!url) return false;
    
    // URLs locales siempre son seguras
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return true;
    }
    
    // URLs de dominios problemáticos no son seguras
    if (this.isProblematicDomain(url)) {
      return false;
    }
    
    // URLs de dominios confiables son seguras
    if (this.isTrustedDomain(url)) {
      return true;
    }
    
    // Por defecto, permitir otros dominios externos
    return true;
  }
};

export default imageConfig;