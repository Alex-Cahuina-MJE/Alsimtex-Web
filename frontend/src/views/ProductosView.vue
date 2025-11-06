<script setup>

import Tela1 from '../assets/images/Telas/Tela1.jpg'
import Tela2 from '../assets/images/Telas/Tela2.jpg'
import Tela3 from '../assets/images/Telas/Tela3.jpg'
import Tela4 from '../assets/images/Telas/Tela4.jpg'
import Tela5 from '../assets/images/Telas/Tela5.jpg'

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import { useNotifications } from '../composables/useNotifications'
import ErrorBoundary from '../components/ErrorBoundary.vue'
import ImageCarousel from '../components/ImageCarousel.vue'
import LazyImage from '../components/LazyImage.vue'
import { useProductosStore } from '../stores/productosStore'
import SideMenu from '../components/SideMenu.vue'
import { getAssetBaseUrl } from '../config/api'
import { getNumeroWhatsApp } from '../config/empresa.js'
import Swal from 'sweetalert2'

const router = useRouter()
const cartStore = useCartStore()
const { addNotification } = useNotifications()


const mostrarDescuentos = ref(false)
const productoSeleccionado = ref(null)
const mostrarModal = ref(false)


const opcionesDinamicas = ref({
  productos: []
})
const mostrarModalDinamico = ref(false)
const mostrarListaPrevia = ref(false)
const productosPreCarrito = ref([])

// Carrusel de telas
const telas = [
  { id: 1, imagen: Tela1, nombre: 'Algodón Premium', descripcion: 'Suave y duradero' },
  { id: 2, imagen: Tela2, nombre: 'Seda Natural', descripcion: 'Elegancia y confort' },
  { id: 3, imagen: Tela3, nombre: 'Lino Italiano', descripcion: 'Frescura natural' },
  { id: 4, imagen: Tela4, nombre: 'Microfibra', descripcion: 'Alta resistencia' },
  { id: 5, imagen: Tela5, nombre: 'Bambú Orgánico', descripcion: 'Suave y ecológico' }
]

const telaActual = ref(0)
const autoPlayTelas = ref(null)

const tiposDeProducto = {
  sabana: {
    nombre: 'Juego de Sábanas',
    requiereTamano: true,
    tamanos: ['1 Plaza', '2 Plazas', 'Queen', 'King'],
    descuentosCantidad: [
      { min: 50, descuento: 15 },
      { min: 25, descuento: 10 },
      { min: 10, descuento: 5 }
    ]
  },
  funda: {
    nombre: 'Funda de Almohada',
    requiereTamano: false,
    tamanos: [],
    descuentosCantidad: [
      { min: 50, descuento: 15 },
      { min: 25, descuento: 10 },
      { min: 10, descuento: 5 }
    ]
  },
  edredon: {
    nombre: 'Edredón',
    requiereTamano: true,
    tamanos: ['1 Plaza', '2 Plazas', 'Queen', 'King'],
    descuentosCantidad: [
      { min: 50, descuento: 15 },
      { min: 25, descuento: 10 },
      { min: 10, descuento: 5 }
    ]
  }
}

// Función para calcular el descuento según la cantidad
const calcularDescuentoCantidad = (tipo, cantidad) => {
  const niveles = tiposDeProducto[tipo].descuentosCantidad
  const nivel = niveles.find(n => cantidad >= n.min)
  return nivel ? nivel.descuento : 0
}

// Función para calcular el precio de un item individual
const calcularPrecioItem = (item) => {
  // Encontrar el precio base del tipo de producto seleccionado
  const precioBase = item.producto.opciones.tipos.find(
    t => t.id === item.tipo
  )?.precio || 0
  
  // Encontrar el precio adicional por tamaño si aplica
  let precioTamano = 0
  if (tiposDeProducto[item.tipo].requiereTamano && item.tamano) {
    const tamanoObj = item.producto.opciones.tamanos.find(
      t => t.nombre === item.tamano
    )
    precioTamano = tamanoObj?.precio || 0
  }
  
  // Calcular el precio unitario
  const precioUnitario = precioBase + precioTamano
  
  // Calcular el precio total (sin descuento por cantidad, eso lo maneja el cartStore)
  return precioUnitario * item.cantidad
}

const mostrarDetallesDinamico = (producto) => {
  productoSeleccionado.value = producto
  // Generar una entrada para cada tipo disponible de ese producto
  opcionesDinamicas.value.productos = producto.opciones.tipos.map(tipo => ({
    id: producto.id + '-' + tipo.id,
    producto: producto,
    tipo: tipo.id,
    tamano: tiposDeProducto[tipo.id].requiereTamano ? tiposDeProducto[tipo.id].tamanos[0] : '',
    cantidad: 0,
    detalles: {
      notas: ''
    }
  }))
  mostrarModalDinamico.value = true
}

const eliminarProducto = (productoId) => {
  opcionesDinamicas.value.productos = opcionesDinamicas.value.productos.filter(
    p => p.id !== productoId
  )
}

const calcularTotal = () => {
  return opcionesDinamicas.value.productos.reduce((total, item) => {
    const precioBase = item.producto.opciones.tipos.find(
      t => t.id === item.tipo
    )?.precio || 0
    const precioTamano = tiposDeProducto[item.tipo].requiereTamano ? 20 : 0
    return total + (precioBase + precioTamano) * item.cantidad
  }, 0)
}

const calcularTotalListaPrevia = () => {
  return productosPreCarrito.value.reduce((total, item) => {
    return total + item.precioTotal
  }, 0)
}

const mostrarDetalles = (producto) => {
  productoSeleccionado.value = producto
  // Generar una entrada para cada tipo disponible de ese producto
  opcionesDinamicas.value.productos = producto.opciones.tipos.map(tipo => ({
    id: producto.id + '-' + tipo.id,
    producto: producto,
    tipo: tipo.id,
    tamano: tiposDeProducto[tipo.id].requiereTamano ? tiposDeProducto[tipo.id].tamanos[0] : '',
    cantidad: 0,
    detalles: {
      notas: ''
    }
  }))
  mostrarModal.value = true
}

const agregarAlCarrito = () => {
  // Solo agregar los tipos que tengan cantidad mayor a 0
  const seleccionados = opcionesDinamicas.value.productos.filter(item => item.cantidad > 0)
  if (seleccionados.length === 0) {
    Swal.fire({
      title: 'Selección requerida',
      text: 'Por favor, seleccione al menos un tipo y cantidad',
      icon: 'warning',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#fffbeb',
      color: '#92400e',
      iconColor: '#f59e0b'
    })
    return
  }
  seleccionados.forEach(item => {
    productosPreCarrito.value.push({
      id: Date.now() + Math.random(),
      producto: item.producto,
      tipo: item.tipo,
      tamano: item.tamano,
      cantidad: item.cantidad,
      detalles: { ...item.detalles },
      precioTotal: calcularPrecioItem(item)
    })
  })
  mostrarModal.value = false
  mostrarListaPrevia.value = true
  opcionesDinamicas.value.productos = []
}

const agregarAListaPrevia = () => {
  try {
    // Solo agregar los tipos que tengan cantidad mayor a 0
    const seleccionados = opcionesDinamicas.value.productos.filter(item => item.cantidad > 0)
    
    if (seleccionados.length === 0) {
      addNotification('Por favor, seleccione al menos un tipo y cantidad', 'warning')
      return
    }

    // Convertir los productos seleccionados al formato del carrito
    const productosParaCarrito = seleccionados.map(item => {
      const precioUnitario = calcularPrecioItem(item) / item.cantidad
      const precioOriginal = item.producto.descuento > 0 ? parseFloat(item.producto.precio_base || 0) : null
      
      return {
        producto: {
          id: item.producto.id,
          nombre: item.producto.nombre,
          imagen: getProductImage(item.producto),
          descripcion: item.producto.descripcion,
          precio: precioUnitario,
          stock: item.producto.stock
        },
        tipo: tiposDeProducto[item.tipo].nombre,
        tamano: item.tamano,
        cantidad: item.cantidad,
        precio: precioUnitario,
        precioOriginal: precioOriginal,
        detalles: item.detalles,
        precioTotal: calcularPrecioItem(item)
      }
    })

    // Agregar al carrito usando el store
    cartStore.addToCart(productosParaCarrito)
    
    // Notificar éxito
    if (productosParaCarrito.length === 1) {
      addNotification(`${productosParaCarrito[0].producto.nombre} agregado al carrito`, 'success')
    } else {
      addNotification(`${productosParaCarrito.length} productos agregados al carrito`, 'success')
    }
    
    // Cerrar el modal y limpiar
    mostrarModalDinamico.value = false
    opcionesDinamicas.value.productos = []
    productoEnEdicion.value = null
  } catch (error) {
    addNotification('Error al agregar los productos al carrito', 'error')
    console.error('Error en agregarAListaPrevia:', error)
  }
}

const productoEnEdicion = ref(null)

const editarProductoPreCarrito = (producto) => {
  productoEnEdicion.value = producto.id
  opcionesDinamicas.value.productos = [{
    id: producto.id,
    producto: producto.producto,
    tipo: producto.tipo,
    tamano: producto.tamano,
    cantidad: producto.cantidad,
    detalles: { ...producto.detalles }
  }]
  mostrarListaPrevia.value = false
  mostrarModalDinamico.value = true
}

const eliminarDeListaPrevia = (id) => {
  productosPreCarrito.value = productosPreCarrito.value.filter(item => item.id !== id)
}

const verDetalleProducto = (producto) => {
  router.push(`/producto/${producto.id}`)
}

const agregarAlCarritoDinamico = () => {
  if (productosPreCarrito.value.length === 0) {
    Swal.fire({
      title: 'Lista vacía',
      text: 'No hay productos en la lista para agregar al carrito',
      icon: 'info',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      background: '#eff6ff',
      color: '#1e40af',
      iconColor: '#3b82f6'
    })
    return
  }


  // Convertir los productos de la lista previa al formato del carrito
  const productosParaCarrito = productosPreCarrito.value.map(item => ({
    producto: {
      id: item.producto.id,
    }
    // ...otros campos...
  }))
}

// Funciones del carrusel de telas
const siguienteTela = () => {
  telaActual.value = (telaActual.value + 1) % telas.length
}

const anteriorTela = () => {
  telaActual.value = telaActual.value === 0 ? telas.length - 1 : telaActual.value - 1
}

const seleccionarTela = (index) => {
  telaActual.value = index
}

const iniciarAutoPlayTelas = () => {
  autoPlayTelas.value = setInterval(siguienteTela, 4000)
}

const detenerAutoPlayTelas = () => {
  if (autoPlayTelas.value) {
    clearInterval(autoPlayTelas.value)
  }
}

// Iniciar autoplay cuando se monte el componente
const productosStore = useProductosStore()
const selectedCategory = ref(null)
const showSimpleModal = ref(false)
const simpleProduct = ref(null)
const simpleQuantity = ref(1)
const searchQuery = ref('')
const searchResults = ref([])
const priceFilter = ref('')
const stockFilter = ref('')
const sortBy = ref('')
const categoryFilter = ref('')
const sidebarOpen = ref(false)

// Usar el loading del store en lugar de uno local
const loading = computed(() => productosStore.loading)

// Cache para imágenes para evitar recargas
const imageCache = new Map()
const imagesCache = new Map()

// Limpiar cache de imágenes cuando sea necesario
const clearImageCache = () => {
  imageCache.clear()
  imagesCache.clear()
}

// Limpiar cache cuando sea necesario - solo cuando cambie la categoría completamente
watch(selectedCategory, (newCategory, oldCategory) => {
  // Solo limpiar cache si realmente cambió la categoría (no al inicializar)
  if (oldCategory !== undefined && newCategory !== oldCategory) {
    // Limpiar solo el cache de imágenes que ya no se usan
    // En lugar de limpiar todo, podríamos ser más selectivos
    // clearImageCache()
  }
})

onMounted(async () => {
  try {
    // Cargar productos inicialmente
    await productosStore.fetchProductos({ estado: true })
  } catch (error) {
    console.error('Error cargando productos:', error)
  }
})

onUnmounted(() => {
  detenerAutoPlayTelas()
})

// Mapeo de categorías para filtros
const categoryMap = {
  // Productos para la cama
  SABANAS: {
    keys: ['SABANAS'],
    nombre: 'Sábanas',
    descripcion: 'Juegos de sábanas en diferentes tamaños y materiales',
    icono: 'fas fa-bed'
  },
  EDREDRONES: {
    keys: ['EDREDRONES'],
    nombre: 'Edredones',
    descripcion: 'Edredones cómodos y térmicos',
    icono: 'fas fa-cloud'
  },
  COBERTORES: {
    keys: ['COBERTORES'],
    nombre: 'Cobertores',
    descripcion: 'Cobertores suaves y abrigadores',
    icono: 'fas fa-square'
  },
  FRAZADAS: {
    keys: ['FRAZADAS'],
    nombre: 'Frazadas',
    descripcion: 'Frazadas de alta calidad',
    icono: 'fas fa-layer-group'
  },
  DUVET: {
    keys: ['DUVET'],
    nombre: 'Duvet',
    descripcion: 'Duvets premium para máximo confort',
    icono: 'fas fa-feather-alt'
  },
  
  // Protección y fundas
  PROTECORES: {
    keys: ['PROTECORES'],
    nombre: 'Protectores',
    descripcion: 'Protectores de colchón impermeables',
    icono: 'fas fa-shield-alt'
  },
  FUNDAS_DE_COLCHON: {
    keys: ['FUNDAS_DE_COLCHON'],
    nombre: 'Fundas de Colchón',
    descripcion: 'Fundas protectoras para colchones',
    icono: 'fas fa-compress'
  },
  
  // Accesorios
  ALMOHADAS: {
    keys: ['ALMOHADAS'],
    nombre: 'Almohadas',
    descripcion: 'Almohadas ergonómicas y cómodas',
    icono: 'fas fa-moon'
  },
  RESPALDOS: {
    keys: ['RESPALDOS'],
    nombre: 'Respaldos',
    descripcion: 'Respaldos decorativos para camas',
    icono: 'fas fa-chair'
  },
  
  // Servicios y otros
  SERVICIO: {
    keys: ['SERVICIO'],
    nombre: 'Servicios',
    descripcion: 'Servicios especializados',
    icono: 'fas fa-tools'
  },
  PRODUCTO: {
    keys: ['PRODUCTO'],
    nombre: 'Productos Especiales',
    descripcion: 'Productos únicos y personalizados',
    icono: 'fas fa-star'
  }
}

const filteredProducts = computed(() => {
  // Si hay búsqueda activa o filtros aplicados, usar searchResults
  if (searchQuery.value.trim() || priceFilter.value || stockFilter.value || sortBy.value || categoryFilter.value) {
    return searchResults.value.filter(p => p.estado === true);
  }
  
  // Obtener productos reales del store, solo los activos
  return productosStore.productos.filter(p => p.estado === true)
})

// Computed para obtener categorías únicas disponibles
const availableCategories = computed(() => {
  const productosActivos = productosStore.productos.filter(p => p.estado === true);
  const categorias = new Set();
  
  productosActivos.forEach(producto => {
    if (producto.categoria) {
      categorias.add(producto.categoria);
    }
    if (producto.subcategoria) {
      categorias.add(producto.subcategoria);
    }
  });
  
  return Array.from(categorias).sort();
})

const handleFilter = (category) => {
  selectedCategory.value = category
}



const getProductImage = (producto) => {
  if (!producto) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='
  
  const cacheKey = `image_${producto.id}_${producto.imagen_principal}`
  
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)
  }
  
  let imageUrl
  if (producto.imagen_principal) {
    // Si ya es una URL absoluta, devolverla tal cual
    if (producto.imagen_principal.startsWith('http')) {
      imageUrl = producto.imagen_principal;
    }
    // Si es una ruta relativa, construir la URL completa
    else {
      const assetBase = getAssetBaseUrl();
      imageUrl = `${assetBase}${producto.imagen_principal}`;
    }
  } else {
    // Imagen SVG optimizada inline para carga instantánea
    imageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmOWZhZmIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Q0ZDRkOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48Y2lyY2xlIGN4PSIxNjAiIGN5PSI5MCIgcj0iMjUiIGZpbGw9IiNhZGIzYmYiLz48cGF0aCBkPSJNMTQ1IDkwbDE1IDIwIDE1LTIweiIgZmlsbD0iIzY5NzU4MyIvPjx0ZXh0IHg9IjE2MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtd2VpZ2h0PSI1MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Yjc0ODAiPkFMU0lNVEVYPC90ZXh0Pjx0ZXh0IHg9IjE2MCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPlNpbiBpbWFnZW48L3RleHQ+PC9zdmc+';
  }
  
  imageCache.set(cacheKey, imageUrl)
  return imageUrl;
};

// Nueva función para obtener todas las imágenes de un producto
const getProductImages = (producto) => {
  if (!producto) return ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==']
  
  const cacheKey = `images_${producto.id}_${producto.imagen_principal}_${JSON.stringify(producto.imagenes)}`
  
  if (imagesCache.has(cacheKey)) {
    return imagesCache.get(cacheKey)
  }
  
  const images = [];
  
  // Agregar imagen principal si existe
  if (producto.imagen_principal) {
    if (producto.imagen_principal.startsWith('http')) {
      images.push(producto.imagen_principal);
    } else {
      const assetBase = getAssetBaseUrl();
      images.push(`${assetBase}${producto.imagen_principal}`);
    }
  }
  
  // Agregar imágenes del array si existen
  if (producto.imagenes && Array.isArray(producto.imagenes)) {
    producto.imagenes.forEach(img => {
      if (img && img.trim() !== '') {
        if (img.startsWith('http')) {
          images.push(img);
        } else {
          const assetBase = getAssetBaseUrl();
          images.push(`${assetBase}${img}`);
        }
      }
    });
  }
  
  // Si no hay imágenes, devolver imagen placeholder
  if (images.length === 0) {
    images.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==');
  }
  
  imagesCache.set(cacheKey, images)
  return images;
};

// Función de búsqueda profesional
const handleSearch = debounce(() => {
  applyFilters();
}, 300);

// Función debounce para optimizar búsquedas
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Aplicar todos los filtros
const applyFilters = () => {
  let results = [...productosStore.productos];
  
  // Filtro de búsqueda por texto
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    results = results.filter(producto => 
      producto.nombre.toLowerCase().includes(query) ||
      producto.categoria.toLowerCase().includes(query) ||
      (producto.subcategoria && producto.subcategoria.toLowerCase().includes(query)) ||
      (producto.descripcion && producto.descripcion.toLowerCase().includes(query))
    );
  }
  
  // Filtro por categoría
  if (categoryFilter.value) {
    results = results.filter(producto => 
      producto.categoria.toLowerCase() === categoryFilter.value.toLowerCase() ||
      (producto.subcategoria && producto.subcategoria.toLowerCase() === categoryFilter.value.toLowerCase())
    );
  }
  
  // Filtro por precio
  if (priceFilter.value) {
    results = results.filter(producto => {
      const precio = parseFloat(producto.precio_base || 0);
      switch (priceFilter.value) {
        case '0-50': return precio >= 0 && precio <= 50;
        case '50-100': return precio > 50 && precio <= 100;
        case '100-200': return precio > 100 && precio <= 200;
        case '200+': return precio > 200;
        default: return true;
      }
    });
  }
  
  // Filtro por stock
  if (stockFilter.value) {
    results = results.filter(producto => {
      const stock = producto.stock || 0;
      switch (stockFilter.value) {
        case 'available': return stock > 0;
        case 'low': return stock > 0 && stock < 10;
        case 'out': return stock === 0;
        default: return true;
      }
    });
  }
  
  // Ordenamiento
  if (sortBy.value) {
    results.sort((a, b) => {
      switch (sortBy.value) {
        case 'name-asc':
          return a.nombre.localeCompare(b.nombre);
        case 'name-desc':
          return b.nombre.localeCompare(a.nombre);
        case 'price-asc':
          return parseFloat(a.precio_base || 0) - parseFloat(b.precio_base || 0);
        case 'price-desc':
          return parseFloat(b.precio_base || 0) - parseFloat(a.precio_base || 0);
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default:
          return 0;
      }
    });
  }
  
  searchResults.value = results;
};

// Limpiar búsqueda
const clearSearch = () => {
  searchQuery.value = '';
  priceFilter.value = '';
  stockFilter.value = '';
  sortBy.value = '';
  categoryFilter.value = '';
  searchResults.value = [];
};

// Funciones para el sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const calculateDiscountedPrice = (producto) => {
  if (producto.descuento && producto.descuento > 0) {
    const discountedPrice = parseFloat(producto.precio_base || 0) * (1 - (producto.descuento || 0) / 100);
    return discountedPrice.toFixed(2);
  }
  return null;
};

const openSimpleModal = (producto) => {
  simpleProduct.value = producto
  simpleQuantity.value = 1
  showSimpleModal.value = true
}

const addToCartSimple = () => {
  try {
    const precioUnitario = simpleProduct.value.descuento > 0 
      ? calculateDiscountedPrice(simpleProduct.value)
      : parseFloat(simpleProduct.value.precio_base || 0)
    
    const productToAdd = {
      producto: {
        id: simpleProduct.value.id,
        nombre: simpleProduct.value.nombre,
        imagen: getProductImage(simpleProduct.value),
        descripcion: simpleProduct.value.descripcion,
        precio: precioUnitario,
        stock: simpleProduct.value.stock
      },
      tipo: simpleProduct.value.categoria,
      tamano: simpleProduct.value.subcategoria,
      cantidad: simpleQuantity.value,
      precio: precioUnitario,
      precioOriginal: simpleProduct.value.descuento > 0 ? parseFloat(simpleProduct.value.precio_base || 0) : null,
      precioTotal: precioUnitario * simpleQuantity.value,
      detalles: { notas: '' },
    }
    cartStore.addToCart([productToAdd])
    showSimpleModal.value = false
    addNotification(`${productToAdd.producto.nombre} agregado al carrito`, 'success')
  } catch (error) {
    addNotification('Error al agregar el producto al carrito', 'error')
    console.error('Error en addToCartSimple:', error)
  }
}

const contactarWhatsApp = (producto) => {
  // Formatear el precio para mostrar en el mensaje
  const precio = producto.descuento > 0 
    ? calculateDiscountedPrice(producto)
    : parseFloat(producto.precio_base || 0).toFixed(2);
  
  // Crear el mensaje para WhatsApp
  const productUrl = `${window.location.origin}/producto/${producto.id}`;
  const mensaje = `Estimados señores de Alsimtex,\n\nEstoy interesado/a en el siguiente producto de su catálogo:\n\n*Producto:* ${producto.nombre}\n*Categoría:* ${producto.categoria}${producto.subcategoria ? `\n*Tamaño:* ${producto.subcategoria}` : ''}\n*Precio:* S/ ${precio}\n\n*Enlace al producto:* ${productUrl}\n\nMe gustaría solicitar más información sobre su disponibilidad y características adicionales.\nAgradezco de antemano su atención.\n\nSaludos cordiales.`;

  // Usar la función centralizada para obtener el número
  const numeroWhatsApp = getNumeroWhatsApp();
  
  // Crear URL de WhatsApp
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
  
  // Abrir WhatsApp en una nueva ventana
  window.open(urlWhatsApp, '_blank');
}
</script>

<template>
  <div class="productos-page">
    <!-- Sección de Catálogo -->
    <section class="search-section">
      <div class="container">
        <div class="catalog-header">
          <div class="header-content">
            <h2 class="section-title">Catálogo de Productos</h2>
            <p class="section-subtitle">Explora nuestra colección completa y encuentra el producto ideal para tu hogar</p>
          </div>
          
          <!-- Botón para abrir el sidebar de búsqueda -->
          <button @click="toggleSidebar" class="search-toggle-btn">
            <i class="fas fa-search"></i>
            <span>Buscar y Filtrar</span>
            <i class="fas fa-sliders-h"></i>
          </button>
        </div>
        
        <!-- Mostrar información de búsqueda activa -->
        <div v-if="searchQuery || priceFilter || stockFilter || sortBy || categoryFilter" class="active-search-info">
          <div class="active-filters">
            <span v-if="searchQuery" class="filter-tag">
              <i class="fas fa-search"></i>
              "{{ searchQuery }}"
              <button @click="searchQuery = ''; applyFilters()" class="remove-filter">×</button>
            </span>
            <span v-if="categoryFilter" class="filter-tag">
              <i class="fas fa-tag"></i>
              {{ categoryFilter }}
              <button @click="categoryFilter = ''; applyFilters()" class="remove-filter">×</button>
            </span>
            <span v-if="priceFilter" class="filter-tag">
              <i class="fas fa-dollar-sign"></i>
              {{ priceFilter === '200+' ? 'S/ 200+' : 'S/ ' + priceFilter.replace('-', ' - S/ ') }}
              <button @click="priceFilter = ''; applyFilters()" class="remove-filter">×</button>
            </span>
            <span v-if="stockFilter" class="filter-tag">
              <i class="fas fa-boxes"></i>
              {{ stockFilter === 'available' ? 'Disponible' : stockFilter === 'low' ? 'Stock bajo' : 'Agotado' }}
              <button @click="stockFilter = ''; applyFilters()" class="remove-filter">×</button>
            </span>
            <span v-if="sortBy" class="filter-tag">
              <i class="fas fa-sort"></i>
              {{ 
                sortBy === 'name-asc' ? 'A-Z' : 
                sortBy === 'name-desc' ? 'Z-A' : 
                sortBy === 'price-asc' ? 'Precio ↑' : 
                sortBy === 'price-desc' ? 'Precio ↓' : 'Recientes'
              }}
              <button @click="sortBy = ''; applyFilters()" class="remove-filter">×</button>
            </span>
            <button @click="clearSearch" class="clear-all-filters">
              <i class="fas fa-times"></i>
              Limpiar todo
            </button>
          </div>
          <div class="results-count">
            {{ searchResults.length || filteredProducts.length }} producto(s) encontrado(s)
          </div>
        </div>

        <div class="search-layout">          
          <!-- Área principal de productos -->
          <div class="productos-content">

            <!-- Estado de carga -->
            <ErrorBoundary>
              <!-- Estado de carga -->
              <div v-if="loading" class="loading-state">
                <div class="spinner"></div>
                <p>Cargando productos...</p>
              </div>

              <!-- Grid de productos -->
              <div v-else class="productos-grid">
                <div v-for="producto in filteredProducts" :key="producto.id" class="producto-card">
                <div class="producto-imagen">
                  <!-- Si solo hay una imagen, usar LazyImage directamente -->
                  <LazyImage
                    v-if="getProductImages(producto).length === 1"
                    :src="getProductImages(producto)[0]"
                    :alt="producto.nombre"
                    placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjlmYWZiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZTVlN2ViIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXJnYW5kby4uLjwvdGV4dD48L3N2Zz4="
                    loading="lazy"
                    @click="verDetalleProducto(producto)"
                    class="producto-imagen-single"
                  />
                  
                  <!-- Si hay múltiples imágenes, usar ImageCarousel -->
                  <ImageCarousel
                    v-else
                    :images="getProductImages(producto)"
                    :alt="producto.nombre"
                    placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjlmYWZiIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZTVlN2ViIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXJnYW5kby4uLjwvdGV4dD48L3N2Zz4="
                    :autoplay="false"
                    :show-indicators="true"
                    :show-counter="false"
                    :show-thumbnails="false"
                    :infinite="true"
                    @click="verDetalleProducto(producto)"
                    class="producto-imagen-carousel"
                  />
                  <div v-if="producto.descuento && producto.descuento > 0" class="discount-badge">
                    -{{ producto.descuento }}%
                  </div>
                  <div class="producto-overlay">
                    <span class="categoria-tag">{{ producto.categoria }}</span>
                    <div class="ver-detalle">
                      <i class="fas fa-eye"></i>
                      Ver detalle
                    </div>
                  </div>
                </div>
                <div class="producto-info">
                  <h3 @click="verDetalleProducto(producto)" class="producto-titulo">{{ producto.nombre }}</h3>
                  <p>{{ producto.descripcion || 'Sin descripción' }}</p>
                  <div class="producto-precio">
                    <div v-if="calculateDiscountedPrice(producto)">
                      <span class="precio-valor">S/. {{ calculateDiscountedPrice(producto) }}</span>
                      <span class="precio-original">S/. {{ parseFloat(producto.precio_base).toFixed(2) }}</span>
                    </div>
                    <div v-else>
                      <span class="precio-label"></span>
                      <span class="precio-valor">S/. {{ parseFloat(producto.precio_base).toFixed(2) }}</span>
                    </div>
                  </div>
                  <div class="producto-meta">
                    <span v-if="producto.subcategoria" class="meta-item">
                      <i class="fas fa-ruler"></i>
                      {{ producto.subcategoria }}
                    </span>
                    <span v-if="producto.stock > 0" class="meta-item stock-disponible">
                      <i class="fas fa-check-circle"></i>
                      Disponible
                    </span>
                    <span v-else class="meta-item stock-agotado">
                      <i class="fas fa-times-circle"></i>
                      Agotado
                    </span>
                  </div>
                  <div class="producto-acciones">
                    <button class="button-primary" @click="openSimpleModal(producto)">
                      <i class="fas fa-shopping-cart"></i>
                      Agregar al Carrito
                    </button>
                    <button class="button-whatsapp" @click="contactarWhatsApp(producto)">
                      <i class="fab fa-whatsapp"></i>
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Sin resultados -->
              <div v-if="!loading && filteredProducts.length === 0" class="no-resultados">
                <i class="fas fa-search"></i>
                <p>No se encontraron productos con los filtros aplicados.</p>
                <button v-if="searchQuery || priceFilter || stockFilter || sortBy || categoryFilter" class="button-secondary" @click="clearSearch()">Limpiar filtros</button>
              </div>
            </div>
          </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de detalles del producto -->
    <div v-if="mostrarModalDinamico" class="modal-overlay" @click="mostrarModalDinamico = false">
      <div class="modal-content modal-dinamico" @click.stop>
        <button class="modal-close" @click="mostrarModalDinamico = false">×</button>
        
        <div class="producto-detalle-dinamico">
          <div class="producto-detalle-header">
            <h2>Lista de Productos Seleccionados</h2>
            <div class="descuentos-info">
              <p>Descuentos Disponibles</p>
              <button class="button-secondary" @click="mostrarDescuentos = !mostrarDescuentos">
                {{ mostrarDescuentos ? 'Ocultar detalles de descuentos' : 'Ver más' }}
              </button>
              <transition name="fade">
                <div v-if="mostrarDescuentos">
                  <h3>Descuentos por cantidad:</h3>
                  <ul class="descuentos-lista">
                    <li><i class="fas fa-percentage"></i> 15% de descuento en compras de 50+ unidades</li>
                    <li><i class="fas fa-percentage"></i> 10% de descuento en compras de 25-49 unidades</li>
                    <li><i class="fas fa-percentage"></i> 5% de descuento en compras de 10-24 unidades</li>
                  </ul>
                </div>
              </transition>
            </div>
            <p class="lista-previa-descripcion">
              Revisa y edita tus productos antes de agregarlos al carrito
            </p>
          </div>

          <div class="productos-lista">
            <div v-for="item in opcionesDinamicas.productos" 
                 :key="item.id" 
                 class="producto-item">
              <div class="producto-item-header">
                <img :src="item.producto.imagen" :alt="item.producto.nombre" class="producto-miniatura">
                <div class="producto-info-basica">
                  <h3>{{ item.producto.nombre }} - {{ tiposDeProducto[item.tipo].nombre }}</h3>
                  <p class="descripcion-corta">{{ item.producto.descripcion }}</p>
                </div>
              </div>

              <div class="opciones-dinamicas">
                <div class="opcion-grupo" v-if="tiposDeProducto[item.tipo]?.requiereTamano">
                  <label>Tamaño:</label>
                  <select v-model="item.tamano" class="select-personalizado">
                    <option v-for="tamano in tiposDeProducto[item.tipo].tamanos" 
                            :key="tamano" 
                            :value="tamano">
                      {{ tamano }}
                    </option>
                  </select>
                </div>

                <div class="opcion-grupo cantidad-grupo">
                  <label>Cantidad:</label>
                  <div class="cantidad-selector-dinamico">
                    <button class="cantidad-btn" 
                            @click="item.cantidad = Math.max(0, item.cantidad - 1)">
                      -
                    </button>
                    <input type="number" 
                           v-model="item.cantidad" 
                           min="1" 
                           class="cantidad-input">
                    <button class="cantidad-btn" 
                            @click="item.cantidad++">
                      +
                    </button>
                  </div>
                </div>

                <div class="opcion-grupo">
                  <label>Notas adicionales:</label>
                  <textarea v-model="item.detalles.notas" 
                          class="textarea-personalizado" 
                          placeholder="Especificaciones especiales o comentarios..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <div class="acciones-dinamicas">
            <div class="total-section">
              <span class="total-label">Total Estimado:</span>
              <span class="total-valor">S/{{ calcularTotal().toFixed(2) }}</span>
            </div>
            <button class="button-primary agregar-carrito" @click="agregarAListaPrevia">
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Lista Previa -->
    <div v-if="mostrarListaPrevia" class="modal-overlay" @click="mostrarListaPrevia = false">
      <div class="modal-content modal-lista-previa" @click.stop>
        <button class="modal-close" @click="mostrarListaPrevia = false">×</button>
        
        <div class="lista-previa-container">
          <div class="lista-previa-header">
            <h2>Lista de Productos Seleccionados</h2>
            <p class="lista-previa-descripcion">Revisa y edita tus productos antes de agregarlos al carrito</p>
          </div>

          <div v-if="productosPreCarrito.length === 0" class="lista-vacia">
            <i class="fas fa-shopping-basket"></i>
            <p>No hay productos en la lista</p>
          </div>

          <div v-else class="lista-previa-productos">
            <div v-for="item in productosPreCarrito" 
                 :key="item.id" 
                 class="lista-previa-item">
              <div class="item-content">
                <img :src="item.producto.imagen" :alt="item.producto.nombre" class="item-imagen">
                <div class="item-detalles">
                  <h3>{{ item.producto.nombre }}</h3>
                  <div class="item-specs">
                    <span class="spec-item">
                      <i class="fas fa-tag"></i>
                      {{ tiposDeProducto[item.tipo].nombre }}
                    </span>
                    <span v-if="tiposDeProducto[item.tipo].requiereTamano" class="spec-item">
                      <i class="fas fa-ruler"></i>
                      {{ item.tamano }}
                    </span>
                    <span class="spec-item">
                      <i class="fas fa-box"></i>
                      Cantidad: {{ item.cantidad }}
                    </span>
                  </div>
                  <p v-if="item.detalles.notas" class="item-notas">
                    <i class="fas fa-comment-alt"></i>
                    {{ item.detalles.notas }}
                  </p>
                  <div class="item-precio-container">
                    <div class="item-precio">
                      <span class="precio-label">Precio:</span>
                      <span class="precio-valor">S/{{ calcularPrecioItem(item).toFixed(2) }}</span>
                    </div>
                    <div class="descuentos-info">
                      <div class="descuentos-tabla">
                        <div class="descuento-header">Descuento aplicado:</div>
                        <div class="descuento-actual">
                          {{ calcularDescuentoCantidad(item.tipo, item.cantidad) }}% de descuento
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="item-acciones">
                <button class="btn-editar" @click="editarProductoPreCarrito(item)">
                  <i class="fas fa-edit"></i>
                  Editar
                </button>
                <button class="btn-eliminar" @click="eliminarDeListaPrevia(item.id)">
                  <i class="fas fa-trash-alt"></i>
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          <div class="lista-previa-footer">
            <div class="total-final">
              <span class="total-label">Total Final:</span>
              <span class="total-valor">S/{{ calcularTotalListaPrevia().toFixed(2) }}</span>
            </div>
            <div class="acciones-finales">
              <button class="button-secondary" @click="mostrarListaPrevia = false">
                Seguir Agregando
              </button>
              <button class="button-primary" 
                      @click="agregarAlCarritoDinamico"
                      :disabled="productosPreCarrito.length === 0">
                Confirmar y Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Carrusel de Telas -->
    <section class="telas-section">
      <div class="container">
        <h2 class="section-title slide-in-bottom">Nuestras Telas</h2>
        <p class="section-subtitle">Descubre la calidad y variedad de nuestros tejidos premium</p>
        
        <div class="telas-carousel">
          <div class="carousel-container">
            <div class="tela-slide" v-for="(tela, index) in telas" 
                 :key="tela.id"
                 :class="{ 'active': index === telaActual }">
              <div class="tela-image">
                <img :src="tela.imagen" :alt="tela.nombre">
                <div class="tela-overlay">
                  <h3>{{ tela.nombre }}</h3>
                  <p>{{ tela.descripcion }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <button class="carousel-btn prev-btn" @click="anteriorTela" @mouseenter="detenerAutoPlayTelas" @mouseleave="iniciarAutoPlayTelas">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="carousel-btn next-btn" @click="siguienteTela" @mouseenter="detenerAutoPlayTelas" @mouseleave="iniciarAutoPlayTelas">
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <div class="carousel-indicators">
            <button v-for="(tela, index) in telas" 
                    :key="tela.id"
                    :class="['indicator', { 'active': index === telaActual }]"
                    @click="seleccionarTela(index)">
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Simple para Productos -->
    <div v-if="showSimpleModal" class="modal-overlay" @click="showSimpleModal = false">
      <div class="modal-content modal-producto" @click.stop>
        <button class="modal-close" @click="showSimpleModal = false">×</button>
        <div class="producto-detalle-dinamico" v-if="simpleProduct">
          <!-- Imagen del producto -->
          <div class="producto-imagen-modal">
            <ImageCarousel 
              :images="getProductImages(simpleProduct)" 
              :alt="simpleProduct.nombre"
              placeholder="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=="
              :autoplay="false"
              :show-indicators="getProductImages(simpleProduct).length > 1"
              :show-counter="getProductImages(simpleProduct).length > 1"
              :show-thumbnails="getProductImages(simpleProduct).length > 3"
            />
          </div>

          <!-- Información del producto -->
          <div class="producto-info-modal">
            <h2>{{ simpleProduct.nombre }}</h2>
            <p class="producto-descripcion">{{ simpleProduct.descripcion || 'Sin descripción disponible' }}</p>
            
            <!-- Precio -->
            <div class="precio-detalle">
              <span class="precio-label">Precio:</span>
              <span class="precio-valor">S/. {{ parseFloat(simpleProduct.precio_base).toFixed(2) }}</span>
            </div>

            <!-- Detalles adicionales -->
            <div class="detalles-producto">
              <div class="detalle-item">
                <i class="fas fa-tag"></i>
                <span>{{ simpleProduct.categoria }}</span>
              </div>
              <div v-if="simpleProduct.subcategoria" class="detalle-item">
                <i class="fas fa-ruler"></i>
                <span>{{ simpleProduct.subcategoria }}</span>
              </div>
              <div class="detalle-item" :class="simpleProduct.stock > 0 ? 'stock-ok' : 'stock-bajo'">
                <i :class="simpleProduct.stock > 0 ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                <span>{{ simpleProduct.stock > 0 ? `${simpleProduct.stock} disponibles` : 'Agotado' }}</span>
              </div>
            </div>

            <!-- Selector de cantidad -->
            <div class="opcion-grupo cantidad-grupo">
              <label>Cantidad:</label>
              <div class="cantidad-selector-dinamico">
                <button class="cantidad-btn" @click="simpleQuantity = Math.max(1, simpleQuantity - 1)">-</button>
                <input type="number" v-model="simpleQuantity" min="1" :max="simpleProduct.stock" class="cantidad-input">
                <button class="cantidad-btn" @click="simpleQuantity++" :disabled="simpleQuantity >= simpleProduct.stock">+</button>
              </div>
            </div>

            <!-- Total -->
            <div class="total-section">
              <span class="total-label">Total:</span>
              <span class="total-valor">S/. {{ (parseFloat(simpleProduct.precio_base) * simpleQuantity).toFixed(2) }}</span>
            </div>

            <!-- Botones de acción -->
            <div class="modal-acciones">
              <button 
                class="button-primary agregar-carrito" 
                @click="addToCartSimple"
                :disabled="simpleProduct.stock === 0"
              >
                <i class="fas fa-shopping-cart"></i>
                {{ simpleProduct.stock > 0 ? 'Agregar al Carrito' : 'Producto Agotado' }}
              </button>
              <button 
                class="button-whatsapp agregar-carrito" 
                @click="contactarWhatsApp(simpleProduct)"
              >
                <i class="fab fa-whatsapp"></i>
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Sidebar de búsqueda lateral -->
    <div class="search-sidebar-overlay" :class="{ 'active': sidebarOpen }" @click="closeSidebar"></div>
    <div class="search-sidebar" :class="{ 'open': sidebarOpen }">
      <div class="sidebar-header">
        <h3>
          <i class="fas fa-search"></i>
          Buscar y Filtrar
        </h3>
        <button @click="closeSidebar" class="close-sidebar">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="sidebar-content">
        <!-- Búsqueda por texto -->
        <div class="search-group">
          <label class="search-label">
            <i class="fas fa-search"></i>
            Buscar productos
          </label>
          <div class="search-input-container">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Nombre, categoría, descripción..."
              class="sidebar-search-input"
              @input="handleSearch"
            >
            <button v-if="searchQuery" @click="searchQuery = ''; applyFilters()" class="clear-input">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Filtro de categoría -->
        <div class="search-group">
          <label class="search-label">
            <i class="fas fa-tag"></i>
            Categoría
          </label>
          <select v-model="categoryFilter" @change="applyFilters" class="sidebar-select">
            <option value="">Todas las categorías</option>
            <option v-for="categoria in availableCategories" :key="categoria" :value="categoria">
              {{ categoria }} ({{ productosStore.productos.filter(p => p.estado && (p.categoria === categoria || p.subcategoria === categoria)).length }})
            </option>
          </select>
        </div>

        <!-- Filtro de precio -->
        <div class="search-group">
          <label class="search-label">
            <i class="fas fa-dollar-sign"></i>
            Rango de precio
          </label>
          <select v-model="priceFilter" @change="applyFilters" class="sidebar-select">
            <option value="">Todos los precios</option>
            <option value="0-50">S/ 0 - S/ 50</option>
            <option value="50-100">S/ 50 - S/ 100</option>
            <option value="100-200">S/ 100 - S/ 200</option>
            <option value="200+">S/ 200 o más</option>
          </select>
        </div>

        <!-- Filtro de stock -->
        <div class="search-group">
          <label class="search-label">
            <i class="fas fa-boxes"></i>
            Disponibilidad
          </label>
          <select v-model="stockFilter" @change="applyFilters" class="sidebar-select">
            <option value="">Todos los productos</option>
            <option value="available">Disponible</option>
            <option value="low">Stock bajo (menos de 10)</option>
            <option value="out">Agotado</option>
          </select>
        </div>

        <!-- Ordenamiento -->
        <div class="search-group">
          <label class="search-label">
            <i class="fas fa-sort"></i>
            Ordenar por
          </label>
          <select v-model="sortBy" @change="applyFilters" class="sidebar-select">
            <option value="">Por defecto</option>
            <option value="name-asc">Nombre A-Z</option>
            <option value="name-desc">Nombre Z-A</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="newest">Más recientes</option>
          </select>
        </div>

        <!-- Botones de acción -->
        <div class="sidebar-actions">
          <button @click="clearSearch" class="clear-all-btn">
            <i class="fas fa-eraser"></i>
            Limpiar filtros
          </button>
          <button @click="closeSidebar" class="apply-filters-btn">
            <i class="fas fa-check"></i>
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.productos-page {
  padding: calc(80px + var(--spacing-3xl)) 0 var(--spacing-4xl);
  background: var(--bg-secondary);
  min-height: 100vh;
}

/* Buscador Profesional */
.search-container {
  background: white;
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-2xl);
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.search-wrapper {
  padding: var(--spacing-xl);
}

.search-input-container {
  position: relative;
  margin-bottom: var(--spacing-lg);
}

.search-icon {
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-size: var(--font-lg);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-4xl) var(--spacing-lg) var(--spacing-4xl);
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius-xl);
  font-size: var(--font-lg);
  background: #f8f9fa;
  transition: all var(--transition-fast);
  outline: none;
}

.search-input:focus {
  border-color: #14b8a6;
  background: white;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-search {
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-search:hover {
  background: #4b5563;
  transform: translateY(-50%) scale(1.1);
}

.search-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.filter-select {
  padding: var(--spacing-lg);
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  background: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
}

.filter-select:focus {
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.search-results-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: #f0fdf4;
  border-top: 1px solid #dcfce7;
}

.results-count {
  color: #166534;
  font-weight: var(--font-semibold);
  font-size: var(--font-sm);
}

.clear-all {
  background: #ef4444;
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-all:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Estilos para imagen individual del producto */
.producto-imagen-single {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
  filter: brightness(0.98);
  cursor: pointer;
}

.producto-card:hover .producto-imagen-single {
  transform: scale(1.05);
}

/* Estilos para el carrusel de imagen del producto */
.producto-imagen-carousel {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.producto-imagen-carousel :deep(.carousel-image) {
  filter: brightness(0.98);
  transition: transform var(--transition-slow);
}

.producto-card:hover .producto-imagen-carousel :deep(.carousel-image) {
  transform: scale(1.05);
}

/* Hacer los controles más visibles en las tarjetas de productos */
.producto-imagen-carousel :deep(.carousel-controls) {
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.producto-imagen-carousel:hover :deep(.carousel-controls) {
  opacity: 1;
}

.producto-imagen-carousel :deep(.carousel-indicators) {
  opacity: 0.8;
}

.producto-imagen-carousel:hover :deep(.carousel-indicators) {
  opacity: 1;
}

.page-title {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  animation: fadeInDown 0.8s ease-out;
}

.productos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: 0;
  animation: fadeInUp 1s ease-out;
}

.disenos-grid {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: var(--spacing-xl);
  padding: var(--spacing-md) 0;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  animation: fadeInUp 1s ease-out;
  height: 200px; /* Altura fija para la franja */
}

.disenos-grid::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.disenos-grid .diseno-card {
  flex: 0 0 280px;
  scroll-snap-align: start;
  height: 100%;
}

.disenos-grid .diseno-imagen {
  height: 100%;
}

.disenos-grid .diseno-imagen img {
  height: 100%;
  object-fit: cover;
}

.producto-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  overflow: hidden;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  position: relative;
}

.producto-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transition: transform var(--transition-normal);
  z-index: 2;
}

.producto-card:hover::before {
  transform: scaleX(1);
}

.producto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  border-color: #d1d5db;
}

.producto-imagen {
  position: relative;
  padding-top: 75%; /* Aspecto cuadrado como Falabella */
  overflow: hidden;
  background: #f8f9fa;
  cursor: pointer;
}

/* Estilos específicos para el carrusel en productos */
.producto-imagen .image-carousel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.producto-imagen .carousel-container {
  height: 100%;
}

.producto-imagen .carousel-image {
  height: 100%;
}

.producto-imagen img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
  filter: brightness(0.98);
}

.producto-card:hover .producto-imagen img {
  transform: scale(1.05);
}

.ver-detalle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  opacity: 0;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.producto-imagen:hover .ver-detalle {
  opacity: 1;
}

.producto-info {
  padding: var(--spacing-md);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Empuja el contenido hacia arriba y abajo */
  gap: var(--spacing-xs);
}

.producto-info h3 {
  margin: 0;
  font-size: var(--font-base);
  color: #111827;
  font-weight: var(--font-medium);
  letter-spacing: -0.01em;
  line-height: 1.4;
  transition: color var(--transition-fast);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-titulo {
  cursor: pointer;
}

.producto-titulo:hover {
  color: var(--secondary-color);
}

.producto-card:hover .producto-info h3 {
  color: var(--secondary-color);
}

.producto-info p {
  margin: 0;
  color: #6b7280;
  line-height: 1.4;
  font-size: var(--font-sm);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.producto-precio {
  display: flex;
  flex-wrap: wrap; /* Permite que los precios se ajusten si no hay espacio */
  align-items: baseline;
  gap: var(--spacing-sm);
  margin: var(--spacing-sm) 0;
}

.producto-precio > div { /* Aplica a los divs de v-if/v-else */
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
}

.precio-label {
  font-size: var(--font-xs);
  color: #6b7280;
  font-weight: var(--font-medium);
}

.precio-valor {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  color: #dc2626;
}

.producto-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin: var(--spacing-xs) 0;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px var(--spacing-xs);
  background: #f3f4f6;
  border-radius: var(--border-radius-sm);
  font-size: 10px;
  color: #6b7280;
}

.meta-item i {
  font-size: 0.9em;
}

.stock-disponible {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.stock-disponible i {
  color: #22c55e;
}

.stock-agotado {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stock-agotado i {
  color: #ef4444;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4xl);
  gap: var(--spacing-lg);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(20, 184, 166, 0.2);
  border-top-color: var(--secondary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.producto-detalles {
  margin-top: var(--spacing-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-sm);
  color: var(--text-tertiary);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(20, 184, 166, 0.1);
}

.producto-modelo {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.producto-categoria {
  margin-top: var(--spacing-md);
}

.categoria-badge {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--gradient-primary);
  color: white;
  border-radius: var(--border-radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.categoria-badge:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.producto-metadata {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  font-size: var(--font-sm);
  color: var(--text-tertiary);
  gap: var(--spacing-md);
}

.codigo, .unidad {
  font-weight: var(--font-medium);
}

.producto-acciones {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  flex-direction: column;
}

.button-primary {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: #f97316;
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  width: 100%;
  font-weight: var(--font-medium);
  font-size: var(--font-xs);
  box-shadow: none;
  position: relative;
  overflow: hidden;
}

.button-primary::before {
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

.button-primary:hover::before {
  width: 300px;
  height: 300px;
}

.button-primary:hover {
  background: #ea580c;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.button-whatsapp {
  width: 100%;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: #25d366;
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-medium);
  font-size: var(--font-xs);
  box-shadow: none;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.button-whatsapp::before {
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

.button-whatsapp:hover::before {
  width: 300px;
  height: 300px;
}

.button-whatsapp:hover {
  background: #1da851;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transform: translateY(-1px);
}

.button-whatsapp:active {
  transform: translateY(0);
}

.button-primary:active {
  transform: translateY(0);
}

.no-resultados {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-size: 1.1rem;
}

.error-message {
  text-align: center;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 600px;
  background-color: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  color: #d32f2f;
}

.error-message p {
  margin: 0.5rem 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius-2xl);
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideInBottom 0.5s ease-out;
  box-shadow: var(--shadow-2xl);
}

.modal-producto {
  max-width: 800px;
}

.producto-imagen-modal {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  background: #f8f9fa;
}

/* Estilos para el carrusel en el modal */
.producto-imagen-modal .image-carousel {
  height: 100%;
}

.producto-imagen-modal .carousel-container {
  height: 100%;
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
}

.producto-imagen-modal .carousel-image {
  height: 100%;
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
}

.producto-imagen-modal img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.producto-info-modal {
  padding: var(--spacing-2xl);
}

.producto-info-modal h2 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md);
}

.producto-descripcion {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-xl);
}

.precio-detalle {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-xl);
}

.precio-detalle .precio-label {
  font-size: var(--font-base);
  color: var(--text-secondary);
}

.precio-detalle .precio-valor {
  font-size: var(--font-3xl);
  font-weight: var(--font-extrabold);
  color: var(--secondary-color);
}

.detalles-producto {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.detalle-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.detalle-item i {
  color: var(--secondary-color);
}

.detalle-item.stock-ok {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.detalle-item.stock-ok i {
  color: #22c55e;
}

.detalle-item.stock-bajo {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.detalle-item.stock-bajo i {
  color: #ef4444;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  margin: var(--spacing-xl) 0;
}

.total-label {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.total-valor {
  font-size: var(--font-2xl);
  font-weight: var(--font-extrabold);
  color: var(--secondary-color);
}

.agregar-carrito {
  width: 100%;
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-lg);
}

.agregar-carrito:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--bg-secondary);
  color: var(--text-tertiary);
}

.modal-acciones {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  z-index: 2;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}

.producto-detalle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl);
}

.producto-detalle-imagen {
  position: relative;
  padding-top: 100%;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.producto-detalle-imagen img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.producto-detalle-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.producto-detalle-info h2 {
  font-size: var(--font-2xl);
  color: var(--text-primary);
  margin: 0;
}

.descripcion {
  color: var(--text-secondary);
  font-size: var(--font-lg);
  line-height: 1.6;
  margin: 0;
}

.opciones-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.opcion-grupo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.opcion-grupo label {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-size: var(--font-lg);
}

.opciones-botones {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.opcion-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 2px solid var(--secondary-color);
  border-radius: var(--border-radius-lg);
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: var(--font-medium);
}

.opcion-btn:hover {
  background: var(--secondary-color);
  color: white;
}

.opcion-btn.active {
  background: var(--secondary-color);
  color: white;
  font-weight: var(--font-bold);
}

.cantidad-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--bg-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  width: fit-content;
}

.cantidad-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: white;
  border-radius: var(--border-radius-lg);
  font-size: var(--font-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.cantidad-btn:hover {
  background: var(--secondary-color);
  color: white;
  transform: scale(1.1);
}

.cantidad-valor {
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  min-width: 40px;
  text-align: center;
}

.precio-total {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.precio-label {
  font-size: var(--font-lg);
  color: var(--text-primary);
  font-weight: var(--font-semibold);
}

.precio-valor {
  font-size: var(--font-2xl);
  color: var(--secondary-color);
  font-weight: var(--font-extrabold);
}

.agregar-carrito {
  margin-top: var(--spacing-xl);
}

/* Animaciones */
.slide-in-bottom {
  animation: slideInBottom 0.5s ease-out;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes slideInBottom {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
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

/* Estilos para el modal dinámico */
.modal-dinamico {
  max-width: 800px;
  width: 95%;
}

.producto-detalle-dinamico {
  padding: var(--spacing-2xl);
}

.producto-detalle-header {
  margin-bottom: var(--spacing-2xl);
  text-align: center;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: var(--spacing-lg);
}

.productos-lista {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: var(--spacing-md);
}

.producto-item {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.producto-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.producto-item-header {
  display: flex;
  align-items: start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
}

.producto-miniatura {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.producto-info-basica {
  flex: 1;
}

.producto-info-basica h3 {
  margin: 0;
  font-size: var(--font-lg);
  color: var(--text-primary);
}

.descripcion-corta {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin: var(--spacing-sm) 0 0;
}

.btn-eliminar {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
}

.btn-eliminar:hover {
  color: var(--danger-color);
  background: var(--danger-bg);
}

.opciones-dinamicas {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.select-personalizado {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: white;
  font-size: var(--font-base);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.select-personalizado:hover, .select-personalizado:focus {
  border-color: var(--secondary-color);
  outline: none;
  box-shadow: var(--shadow-sm);
}

.cantidad-selector-dinamico {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--bg-secondary);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
}

.cantidad-input {
  width: 80px;
  text-align: center;
  padding: var(--spacing-sm);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  font-weight: var(--font-bold);
}

.textarea-personalizado {
  width: 100%;
  min-height: 100px;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  color: var(--text-primary);
  resize: vertical;
  transition: all var(--transition-fast);
}

.textarea-personalizado:hover, .textarea-personalizado:focus {
  border-color: var(--secondary-color);
  outline: none;
  box-shadow: var(--shadow-sm);
}

.acciones-dinamicas {
  margin-top: var(--spacing-2xl);
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

/* Estilos para la Lista Previa */
.modal-lista-previa {
  max-width: 900px;
}

.lista-previa-container {
  padding: var(--spacing-2xl);
}

.lista-previa-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--border-color);
}

.descuentos-info {
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
}

.descuentos-info h3 {
  color: var(--secondary-color);
  font-size: var(--font-lg);
  margin: 0 0 var(--spacing-md);
}

.descuentos-lista {
  list-style: none;
  padding: 0;
  margin: 0;
}

.descuentos-lista li {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) 0;
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.descuentos-lista i {
  color: var(--secondary-color);
  font-size: 1.2em;
}

.lista-previa-descripcion {
  color: var(--text-secondary);
  margin-top: var(--spacing-md);
}

.item-precio-container {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.descuentos-info {
  margin-top: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
}

.descuentos-tabla {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.descuento-header {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-sm);
}

.descuento-rango {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-sm);
  transition: all var(--transition-fast);
}

.descuento-rango.rango-activo {
  background: var(--secondary-color);
  color: white;
  font-weight: var(--font-semibold);
}

.rango-cantidad {
  color: inherit;
}

.rango-descuento {
  font-weight: var(--font-bold);
  color: inherit;
}

.lista-vacia {
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-2xl);
  color: var(--text-tertiary);
}

.lista-vacia i {
  font-size: 3rem;
  margin-bottom: var(--spacing-lg);
}

.lista-previa-productos {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: var(--spacing-md);
}

.lista-previa-item {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.lista-previa-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.item-content {
  display: flex;
  gap: var(--spacing-xl);
}

.item-imagen {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.item-detalles {
  flex: 1;
}

.item-detalles h3 {
  margin: 0 0 var(--spacing-md);
  color: var(--text-primary);
  font-size: var(--font-xl);
}

.discount-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  background: var(--danger-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  z-index: 1;
}

.producto-precio {
  display: flex;
  flex-direction: column;
}

.precio-original {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
  text-decoration: line-through;
  margin-left: var(--spacing-sm);
}

.item-specs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.spec-item {
  background: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-sm);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.spec-item i {
  color: var(--secondary-color);
}

.item-notas {
  color: var(--text-tertiary);
  font-size: var(--font-sm);
  margin: var(--spacing-md) 0;
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-lg);
  border-left: 3px solid var(--secondary-color);
}

.item-precio {
  margin-top: var(--spacing-md);
  font-weight: var(--font-semibold);
}

.precio-valor {
  color: var(--secondary-color);
  font-size: var(--font-lg);
  margin-left: var(--spacing-sm);
}

.item-acciones {
  display: flex;
  gap: var(--spacing-md);
}

.btn-editar,
.btn-eliminar {
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--border-radius-lg);
  border: none;
  font-size: var(--font-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all var(--transition-fast);
}

.btn-editar {
  background: var(--primary-color);
  color: white;
}

.btn-editar:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.btn-eliminar {
  background: var(--danger-bg);
  color: var(--danger-color);
}

.btn-eliminar:hover {
  background: var(--danger-color);
  color: white;
  transform: translateY(-2px);
}

.lista-previa-footer {
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-2xl);
  border-top: 2px solid var(--border-color);
}

.total-final {
  text-align: right;
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-xl);
}

.acciones-finales {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.button-secondary {
  padding: var(--spacing-md) var(--spacing-2xl);
  border: 2px solid var(--secondary-color);
  background: transparent;
  color: var(--secondary-color);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.button-secondary:hover {
  background: var(--secondary-color);
  color: white;
  transform: translateY(-2px);
}

/* Nuevos estilos para la sección de búsqueda y filtros */
.disenos-section {
  padding: var(--spacing-4xl) 0;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  position: relative;
  overflow: hidden;
}

.disenos-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314B8A6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.search-section {
  padding: var(--spacing-2xl) 0;
  background: #f8f9fa;
  border-top: 1px solid #e5e7eb;
}



.section-title {
  text-align: center;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.section-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-3xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.diseno-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.diseno-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--shadow-2xl);
}

.diseno-imagen {
  position: relative;
  padding-top: 75%;
  overflow: hidden;
}

.diseno-imagen img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.diseno-card:hover .diseno-imagen img {
  transform: scale(1.1);
}

.diseno-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.diseno-card:hover .diseno-overlay {
  opacity: 1;
}

.overlay-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-xl);
  color: white;
  transform: translateY(20px);
  transition: transform var(--transition-normal);
}

.diseno-card:hover .overlay-content {
  transform: translateY(0);
}

.overlay-content h3 {
  font-size: var(--font-xl);
  margin-bottom: var(--spacing-sm);
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.overlay-content p {
  font-size: var(--font-base);
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.search-layout {
  display: block;
  width: 100%;
}

.productos-content {
  flex: 1;
}

.filter-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--secondary-color), #0d9488);
  color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  animation: slideInDown 0.5s ease-out;
}

.filter-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-weight: var(--font-semibold);
}

.filter-info i {
  font-size: var(--font-lg);
}

.filter-count {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.clear-filter-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  font-size: var(--font-base);
}

.clear-filter-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-subtitle {
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-3xl);
  animation: fadeIn 0.8s ease-out 0.2s backwards;
}

.categoria-tag {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  color: var(--secondary-color);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-md);
  opacity: 0;
  transform: translateY(-10px);
  transition: all var(--transition-normal);
}

.producto-card:hover .categoria-tag {
  opacity: 1;
  transform: translateY(0);
}

.producto-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.producto-card:hover .producto-overlay {
  opacity: 1;
}

.no-resultados {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-4xl) var(--spacing-2xl);
  background: white;
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
}

.no-resultados i {
  font-size: 3rem;
  color: var(--text-tertiary);
  margin-bottom: var(--spacing-xl);
}

.no-resultados p {
  color: var(--text-secondary);
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-xl);
}

/* Responsive */
@media (max-width: 1024px) {
  .search-layout {
    grid-template-columns: 1fr;
  }
  
  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .productos-page {
    padding: calc(70px + var(--spacing-xl)) var(--spacing-xs) var(--spacing-2xl);
  }
  
  .productos-page .container {
    padding: 0 var(--spacing-sm);
  }
  
  .search-section {
    padding: var(--spacing-md) 0;
  }

  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }
  
  .producto-card {
    max-width: none;
    min-height: auto;
  }
  
  .producto-imagen {
    padding-top: 85%; /* Reducir altura de imágenes */
  }
  
  .producto-info {
    padding: var(--spacing-xs);
  }
  
  .producto-info h3 {
    font-size: var(--font-sm);
    line-height: 1.2;
    margin-bottom: 4px;
  }
  
  .producto-info p {
    font-size: var(--font-xs);
    line-height: 1.3;
    margin-bottom: var(--spacing-xs);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .search-section {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .filtros-container {
    padding: 0 var(--spacing-md);
    justify-content: flex-start;
    overflow-x: auto;
    flex-wrap: nowrap;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .filtros-container::-webkit-scrollbar {
    display: none;
  }

  .filtro-btn {
    flex-shrink: 0;
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-xs);
  }

  .filter-indicator {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .filter-info {
    justify-content: center;
  }

  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  .producto-detalle {
    grid-template-columns: 1fr;
  }

  .producto-detalle-imagen {
    padding-top: 75%;
  }

  .opcion-btn {
    flex: 1;
    text-align: center;
  }

  .cantidad-selector {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .productos-page {
    padding: calc(60px + var(--spacing-md)) 0 var(--spacing-lg);
  }
  
  .productos-page .container {
    padding: 0 var(--spacing-xs);
  }
  
  .search-section {
    padding: var(--spacing-sm) 0;
  }
  
  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px; /* Gap muy pequeño */
  }

  .page-title {
    font-size: var(--font-xl);
    margin-bottom: var(--spacing-sm);
  }

  .page-subtitle {
    font-size: var(--font-sm);
    margin-bottom: var(--spacing-md);
  }
  
  .producto-card {
    min-height: auto;
    border-radius: 8px;
  }
  
  .producto-imagen {
    padding-top: 75%; /* Imágenes más compactas */
    border-radius: 8px 8px 0 0;
  }
  
  .producto-info {
    padding: 8px;
  }
  
  .producto-info h3 {
    font-size: 12px;
    line-height: 1.2;
    margin-bottom: 2px;
    font-weight: 600;
  }
  
  .producto-info p {
    font-size: 10px;
    line-height: 1.2;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .producto-precio {
    font-size: 13px;
    font-weight: 700;
  }
  
  .precio-label {
    font-size: 9px;
  }
  
  .categoria-tag {
    font-size: 8px;
    padding: 2px 4px;
  }
}

/* Media query para teléfonos muy pequeños */
@media (max-width: 360px) {
  .productos-page {
    padding: calc(60px + var(--spacing-sm)) 0 var(--spacing-md);
  }
  
  .productos-page .container {
    padding: 0 4px;
  }
  
  .search-section {
    padding: var(--spacing-xs) 0;
  }
  
  .productos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 4px; /* Gap mínimo */
  }
  
  .producto-card {
    max-width: none;
    margin: 0;
    min-height: auto;
    border-radius: 6px;
  }
  
  .producto-imagen {
    padding-top: 70%; /* Imágenes más bajas */
    border-radius: 6px 6px 0 0;
  }
  
  .producto-info {
    padding: 6px;
  }
  
  .producto-info h3 {
    font-size: 11px;
    line-height: 1.1;
    margin-bottom: 1px;
    font-weight: 600;
  }
  
  .producto-info p {
    font-size: 9px;
    line-height: 1.1;
    margin-bottom: 2px;
    display: none; /* Ocultar descripción en pantallas muy pequeñas */
  }
  
  .producto-precio {
    font-size: 12px;
    margin-bottom: 2px;
    font-weight: 700;
  }
  
  .precio-label {
    font-size: 8px;
  }
  
  .categoria-tag {
    font-size: 7px;
    padding: 1px 3px;
  }
}

/* Carrusel de Telas */
.telas-section {
  padding: var(--spacing-4xl) 0;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(20, 184, 166, 0.05) 100%);
  position: relative;
  overflow: hidden;
}

.telas-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314B8A6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.section-title {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: var(--font-extrabold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.02em;
  animation: fadeInDown 0.8s ease-out;
}

.section-subtitle {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  font-size: var(--font-lg);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

.telas-carousel {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  border-radius: var(--border-radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  background: white;
}

.carousel-container {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.tela-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(0.95);
  transition: all var(--transition-slow);
  pointer-events: none;
}

.tela-slide.active {
  opacity: 1;
  transform: scale(1);
  pointer-events: all;
  z-index: 1;
}

.tela-image {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.tela-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.tela-slide.active .tela-image img {
  transform: scale(1.05);
}

.tela-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: var(--spacing-2xl) var(--spacing-xl);
  color: white;
  transform: translateY(100%);
  transition: transform var(--transition-normal);
}

.tela-slide.active .tela-overlay {
  transform: translateY(0);
}

.tela-overlay h3 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.tela-overlay p {
  font-size: var(--font-base);
  opacity: 0.9;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: var(--secondary-color);
  font-size: var(--font-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 2;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-lg);
}

.carousel-btn:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
  box-shadow: var(--shadow-xl);
  color: var(--secondary-dark);
}

.prev-btn {
  left: var(--spacing-lg);
}

.next-btn {
  right: var(--spacing-lg);
}

.carousel-indicators {
  position: absolute;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--spacing-sm);
  z-index: 2;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: scale(1.2);
}

.indicator.active {
  background: white;
  border-color: white;
  transform: scale(1.3);
}

/* Responsive para el carrusel */
@media (max-width: 768px) {
  .telas-carousel {
    max-width: 100%;
    margin: 0 var(--spacing-lg);
  }
  
  .carousel-container {
    height: 300px;
  }
  
  .tela-overlay {
    padding: var(--spacing-xl);
  }
  
  .tela-overlay h3 {
    font-size: var(--font-xl);
  }
  
  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: var(--font-base);
  }
  
  .prev-btn {
    left: var(--spacing-md);
  }
  
  .next-btn {
    right: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .telas-section {
    padding: var(--spacing-2xl) 0;
  }
  
  .carousel-container {
    height: 250px;
  }
  
  .tela-overlay {
    padding: var(--spacing-lg);
  }
  
  .tela-overlay h3 {
    font-size: var(--font-lg);
  }
  
  .carousel-btn {
    display: none; /* Ocultar botones en móviles, usar solo indicadores */
  }
}
.productos-layout {
  display: flex;
  gap: var(--spacing-2xl);
}

.productos-main {
  flex: 1;
}

/* ========================================
   RESPONSIVE DESIGN - MOBILE FIRST
   ======================================== */

/* Tablets y laptops pequeñas */
@media (max-width: 1200px) {
  .search-layout {
    gap: var(--spacing-xl);
  }
  
  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--spacing-xl);
  }
}

/* Tablets */
@media (max-width: 1024px) {
  .productos-page {
    padding: calc(70px + var(--spacing-2xl)) 0 var(--spacing-3xl);
  }
  
  .page-title {
    font-size: clamp(2rem, 4vw, 3rem);
    margin-bottom: var(--spacing-2xl);
  }
  
  .disenos-section {
    padding: var(--spacing-2xl) 0;
  }
  
  .disenos-grid {
    height: 180px;
  }
  
  .disenos-grid .diseno-card {
    flex: 0 0 240px;
  }
  
  .search-layout {
    flex-direction: column;
  }
  
  .productos-content {
    width: 100%;
  }
  
  .productos-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .modal-content {
    width: 95%;
    max-height: 85vh;
  }
}

/* Móviles grandes */
@media (max-width: 768px) {
  .productos-page {
    padding: calc(65px + var(--spacing-xl)) 0 var(--spacing-2xl);
  }
  
  .container {
    padding: 0 var(--spacing-md);
  }
  
  .page-title {
    font-size: clamp(1.8rem, 5vw, 2.5rem);
    margin-bottom: var(--spacing-xl);
  }
  
  .page-subtitle,
  .section-subtitle {
    font-size: var(--font-sm);
    margin-bottom: var(--spacing-lg);
  }
  
  .disenos-grid {
    height: 150px;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) 0;
  }
  
  .disenos-grid .diseno-card {
    flex: 0 0 200px;
  }
  
  .productos-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .producto-card {
    max-width: 100%;
  }
  
  .producto-info {
    padding: var(--spacing-lg);
  }
  
  .producto-info h3 {
    font-size: var(--font-lg);
  }
  
  .button-primary {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-sm);
  }
  
  /* Modal responsive */
  .modal-content {
    width: 95%;
    max-height: 90vh;
    border-radius: var(--border-radius-xl);
  }
  
  .modal-close {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
  }
  
  .producto-detalle-dinamico {
    padding: var(--spacing-lg);
  }
  
  .producto-detalle-header h2 {
    font-size: var(--font-xl);
  }
  
  .productos-lista {
    max-height: 50vh;
  }
  
  .producto-item {
    padding: var(--spacing-md);
  }
  
  .producto-item-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .producto-miniatura {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .opciones-dinamicas {
    gap: var(--spacing-md);
  }
  
  .cantidad-selector-dinamico {
    width: 100%;
    justify-content: center;
  }
  
  .cantidad-btn {
    width: 50px;
    height: 50px;
    font-size: var(--font-xl);
  }
  
  .cantidad-input {
    width: 100px;
    font-size: var(--font-lg);
  }
  
  .acciones-dinamicas {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .total-section {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
  
  .agregar-carrito {
    width: 100%;
    padding: var(--spacing-lg);
    font-size: var(--font-base);
  }
  
  /* Modal producto simple */
  .producto-imagen-modal {
    max-height: 300px;
  }
  
  .producto-info-modal {
    padding: var(--spacing-lg);
  }
  
  .producto-info-modal h2 {
    font-size: var(--font-xl);
  }
  
  .precio-detalle .precio-valor {
    font-size: var(--font-2xl);
  }
  
  .detalles-producto {
    gap: var(--spacing-sm);
  }
  
  .detalle-item {
    font-size: var(--font-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
  
  /* Telas Carousel */
  .telas-section {
    padding: var(--spacing-2xl) 0;
  }
  
  .section-title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: var(--spacing-xl);
  }
  
  .carousel-btn {
    width: 40px;
    height: 40px;
    font-size: var(--font-base);
  }
  
  /* Lista previa */
  .lista-previa-container {
    padding: var(--spacing-lg);
  }
  
  .lista-previa-productos {
    max-height: 55vh;
  }
  
  .lista-previa-item {
    padding: var(--spacing-md);
  }
  
  .item-content {
    flex-direction: column;
  }
  
  .item-imagen {
    width: 100%;
    height: 200px;
  }
  
  .item-specs {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .item-acciones {
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .btn-editar,
  .btn-eliminar {
    width: 100%;
    justify-content: center;
  }
  
  .lista-previa-footer {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .acciones-finales {
    flex-direction: column;
    width: 100%;
    gap: var(--spacing-sm);
  }
  
  .acciones-finales button {
    width: 100%;
  }
}

/* Móviles pequeños */
@media (max-width: 480px) {
  .productos-page {
    padding: calc(60px + var(--spacing-md)) 0 var(--spacing-xl);
  }
  
  .container {
    padding: 0 var(--spacing-sm);
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: var(--spacing-md);
  }
  
  .disenos-grid {
    height: 120px;
    gap: var(--spacing-sm);
  }
  
  .disenos-grid .diseno-card {
    flex: 0 0 160px;
  }
  
  .producto-info {
    padding: var(--spacing-md);
  }
  
  .producto-info h3 {
    font-size: var(--font-base);
  }
  
  .producto-precio {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .precio-valor {
    font-size: var(--font-lg);
  }
  
  .producto-meta {
    gap: var(--spacing-xs);
  }
  
  .meta-item {
    font-size: 0.7rem;
    padding: var(--spacing-xs);
  }
  
  .button-primary {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-xs);
  }
  
  .modal-content {
    width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .producto-detalle-dinamico,
  .lista-previa-container,
  .producto-info-modal {
    padding: var(--spacing-md);
  }
  
  .producto-miniatura {
    height: 150px;
  }
  
  .cantidad-btn {
    width: 40px;
    height: 40px;
    font-size: var(--font-lg);
  }
  
  .cantidad-input {
    width: 80px;
    font-size: var(--font-base);
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .carousel-btn {
    width: 36px;
    height: 36px;
    font-size: var(--font-sm);
  }
  
  .carousel-indicators {
    gap: var(--spacing-xs);
  }
  
  .indicator {
    width: 8px;
    height: 8px;
  }
  
  .loading-state {
    padding: var(--spacing-2xl);
  }
  
  .spinner {
    width: 40px;
    height: 40px;
  }
  
  .no-resultados {
    padding: var(--spacing-xl);
    font-size: var(--font-sm);
  }
  
  /* Buscador responsive */
  .search-wrapper {
    padding: var(--spacing-lg);
  }
  
  .search-input {
    padding: var(--spacing-md) var(--spacing-3xl) var(--spacing-md) var(--spacing-3xl);
    font-size: var(--font-base);
  }
  
  .search-filters {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .filter-select {
    padding: var(--spacing-md);
  }
  
  .search-results-info {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
}

/* Landscape móvil */
@media (max-width: 896px) and (orientation: landscape) {
  .modal-content {
    max-height: 95vh;
  }
  
  .productos-lista,
  .lista-previa-productos {
    max-height: 40vh;
  }
}

/* ===== ESTILOS DEL SIDEBAR LATERAL ===== */

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.header-content {
  flex: 1;
}

.search-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--font-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
  white-space: nowrap;
}

.search-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
}

.search-toggle-btn:active {
  transform: translateY(0);
}

/* Información de filtros activos */
.active-search-info {
  background: rgba(20, 184, 166, 0.05);
  border: 1px solid rgba(20, 184, 166, 0.2);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--secondary-color);
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.filter-tag i {
  font-size: 0.8em;
}

.remove-filter {
  background: none;
  border: none;
  color: white;
  margin-left: var(--spacing-xs);
  cursor: pointer;
  font-size: 1.2em;
  line-height: 1;
  opacity: 0.8;
  transition: opacity var(--transition-fast);
}

.remove-filter:hover {
  opacity: 1;
}

.clear-all-filters {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-all-filters:hover {
  background: rgba(239, 68, 68, 0.2);
}

.results-count {
  font-weight: var(--font-medium);
  color: var(--color-text-muted);
  font-size: var(--font-sm);
}

/* Overlay del sidebar */
.search-sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
}

.search-sidebar-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* Sidebar principal */
.search-sidebar {
  position: fixed;
  top: 0;
  right: -400px;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
  z-index: 999;
  transition: right var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.search-sidebar.open {
  right: 0;
}

/* Header del sidebar */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sidebar-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
}

.close-sidebar {
  background: none;
  border: none;
  color: white;
  font-size: var(--font-lg);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-md);
  transition: background var(--transition-fast);
}

.close-sidebar:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Contenido del sidebar */
.sidebar-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.search-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.search-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-medium);
  color: var(--color-text);
  font-size: var(--font-md);
}

.search-label i {
  color: var(--secondary-color);
  width: 20px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.sidebar-search-input {
  width: 100%;
  padding: var(--spacing-md);
  padding-right: 40px;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-md);
  transition: all var(--transition-fast);
  background: var(--color-bg-light);
}

.sidebar-search-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  background: white;
}

.clear-input {
  position: absolute;
  right: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
}

.clear-input:hover {
  color: var(--color-text);
  background: var(--color-bg-light);
}

.sidebar-select {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-md);
  background: var(--color-bg-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sidebar-select:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
  background: white;
}

.sidebar-select:hover {
  border-color: var(--color-border-hover);
}

/* Botones de acción del sidebar */
.sidebar-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: auto;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
}

.clear-all-btn {
  flex: 1;
  padding: var(--spacing-md);
  border: 2px solid #dc2626;
  background: white;
  color: #dc2626;
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.clear-all-btn:hover {
  background: #dc2626;
  color: white;
}

.apply-filters-btn {
  flex: 1;
  padding: var(--spacing-md);
  border: none;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
}

.apply-filters-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
}

/* Responsive para el sidebar */
@media (max-width: 768px) {
  .catalog-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .search-toggle-btn {
    align-self: center;
    width: fit-content;
  }
  
  .search-sidebar {
    width: 100vw;
    right: -100vw;
  }
  
  .active-filters {
    justify-content: center;
  }
  
  .filter-tag {
    font-size: var(--font-xs);
  }
  
  .sidebar-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .search-toggle-btn span {
    display: none;
  }
  
  .search-toggle-btn {
    padding: var(--spacing-sm);
    min-width: auto;
  }
}

</style>
