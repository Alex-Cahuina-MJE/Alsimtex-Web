<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cartStore'
import Swal from 'sweetalert2'
import { useAuthStore } from '../stores/authStore'
import { storeToRefs } from 'pinia'
import { getApiBase } from '../config/api'
import { empresaConfig } from '../config/empresa'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const { items, total, totalItems } = storeToRefs(cartStore)

// Estado del formulario
const paso = ref(1) // 1: Datos del cliente, 2: Tipo de entrega, 3: Dirección (si es envío), 4: Confirmación
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Tipo de entrega
const tipoEntrega = ref('envio') // 'envio' o 'recojo'

// Datos del cliente
const datosCliente = ref({
  nombre: authStore.user?.nombre || '',
  email: authStore.user?.email || '',
  telefono: '',
  documento: '',
  numeroOperacion: ''
})

// Método de pago seleccionado en la sección de cuentas
const metodoPagoSeleccionado = ref('')

// Archivo de comprobante de pago
const documentoPago = ref(null)
const previewUrl = ref('')

// Dirección de envío
const direccionEnvio = ref({
  direccion: '',
  ciudad: '',
  provincia: '',
  codigoPostal: '',
  referencia: ''
})

// Método de pago
const metodoPago = ref('yape') // yape, plin, transferencia, contraentrega, tarjeta

// Datos de tarjeta
const datosTarjeta = ref({
  numero: '',
  titular: '',
  expiracion: '',
  cvv: ''
})

// Mostrar/ocultar CVV
const showCVV = ref(false)

// Validaciones
const datosClienteValidos = computed(() => {
  return datosCliente.value.nombre.trim() !== '' &&
         datosCliente.value.email.trim() !== '' &&
         datosCliente.value.telefono.trim() !== '' &&
         datosCliente.value.documento.trim() !== ''
})

const direccionValida = computed(() => {
  // Si es recojo en tienda, no necesita validar dirección
  if (tipoEntrega.value === 'recojo') return true
  
  return direccionEnvio.value.direccion.trim() !== '' &&
         direccionEnvio.value.ciudad.trim() !== '' &&
         direccionEnvio.value.provincia.trim() !== ''
})

// Validación de pago obligatoria
const pagoValido = computed(() => {
  return metodoPagoSeleccionado.value !== '' && documentoPago.value !== null
})

// Función para calcular el progreso visual
const getProgressWidth = () => {
  const totalSteps = tipoEntrega.value === 'envio' ? 4 : 3
  const currentProgress = (paso.value - 1) / (totalSteps - 1) * 100
  return `${Math.min(100, Math.max(0, currentProgress))}%`
}

// Calcular costos
const subtotal = computed(() => cartStore.subtotalSinDescuento)
const descuento = computed(() => cartStore.descuentoTotal)
const costoEnvio = computed(() => {
  // Sin costo si es recojo en tienda
  if (tipoEntrega.value === 'recojo') return 0
  
  // Envío gratis para compras mayores a S/500
  return total.value >= 500 ? 0 : 30
})
const totalFinal = computed(() => total.value + costoEnvio.value)

const formatPrice = (price) => {
  return `S/${price.toFixed(2)}`
}

// Navegación entre pasos
const siguientePaso = () => {
  if (paso.value === 1 && !datosClienteValidos.value) {
    error.value = 'Por favor completa todos los datos del cliente'
    return
  }
  
  // Paso 2: Tipo de entrega - siempre es válido porque tiene valor por defecto
  
  if (paso.value === 3 && tipoEntrega.value === 'envio' && !direccionValida.value) {
    error.value = 'Por favor completa la dirección de envío'
    return
  }
  
  // Validación de pago obligatoria en el paso de confirmación
  if (paso.value === 3 && tipoEntrega.value === 'recojo' && !pagoValido.value) {
    error.value = 'Por favor selecciona un método de pago y adjunta el comprobante'
    return
  }
  
  if (paso.value === 4 && !pagoValido.value) {
    error.value = 'Por favor selecciona un método de pago y adjunta el comprobante'
    return
  }
  
  error.value = ''
  
  // Si elegimos recojo, saltar el paso de dirección (paso 3)
  if (paso.value === 2 && tipoEntrega.value === 'recojo') {
    paso.value = 4 // Ir directamente a confirmación
  } else {
    paso.value++
  }
}

const pasoAnterior = () => {
  error.value = ''
  
  // Si estamos en confirmación y es recojo, volver al paso 2
  if (paso.value === 4 && tipoEntrega.value === 'recojo') {
    paso.value = 2
  } else {
    paso.value--
  }
}

// Funciones para formatear datos de tarjeta
const formatearNumeroTarjeta = (event) => {
  let valor = event.target.value.replace(/\s/g, '').replace(/\D/g, '')
  if (valor.length > 16) valor = valor.substring(0, 16)
  datosTarjeta.value.numero = valor.replace(/(.{4})/g, '$1 ').trim()
}

const formatearExpiracion = (event) => {
  let valor = event.target.value.replace(/\D/g, '')
  if (valor.length >= 2) {
    valor = valor.substring(0, 2) + '/' + valor.substring(2, 4)
  }
  datosTarjeta.value.expiracion = valor
}

const soloNumeros = (event, campo) => {
  datosTarjeta.value[campo] = event.target.value.replace(/\D/g, '')
}

// Manejar subida de archivo
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  
  if (!file) {
    documentoPago.value = null
    previewUrl.value = ''
    return
  }

  // Validar tipo de archivo - más restrictivo para prevenir fraudes
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf']
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  const isValidType = allowedTypes.includes(file.type)
  const isValidExtension = allowedExtensions.includes(fileExtension)
  
  if (!isValidType || !isValidExtension) {
    Swal.fire({
      title: 'Tipo de archivo no válido',
      text: 'Solo se permiten archivos: JPG, JPEG, PNG, WEBP, PDF. Verifica que el archivo no esté corrupto.',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    event.target.value = ''
    return
  }

  // Validar tamaño de archivo - reducir a 3MB para prevenir archivos manipulados
  const maxSize = 3 * 1024 * 1024 // 3MB
  if (file.size > maxSize) {
    Swal.fire({
      title: 'Archivo demasiado grande',
      text: 'El archivo no puede ser mayor a 3MB. Por favor, comprime la imagen o usa un archivo más pequeño.',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    event.target.value = ''
    return
  }

  // Validar tamaño mínimo para prevenir archivos vacíos o corruptos
  const minSize = 1024 // 1KB mínimo
  if (file.size < minSize) {
    Swal.fire({
      title: 'Archivo demasiado pequeño',
      text: 'El archivo parece estar corrupto o vacío. Por favor, verifica el archivo.',
      icon: 'error',
      confirmButtonText: 'Entendido'
    })
    event.target.value = ''
    return
  }

  // Para imágenes, validar dimensiones mínimas
  if (file.type.startsWith('image/')) {
    const img = new Image()
    img.onload = () => {
      // Validar que la imagen tenga dimensiones mínimas (al menos 100x100 pixeles)
      if (img.width < 100 || img.height < 100) {
        Swal.fire({
          title: 'Imagen de baja calidad',
          text: 'La imagen es demasiado pequeña. Por favor, usa una imagen más clara y de mejor resolución.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        })
        event.target.value = ''
        return
      }
      
      // Validar que no sea una imagen completamente negra/blanca (básica detección de fraude)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = Math.min(img.width, 100) // Sample pequeño para análisis
      canvas.height = Math.min(img.height, 100)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      
      // Contar píxeles únicos (básica detección de imágenes manipuladas)
      const uniqueColors = new Set()
      for (let i = 0; i < data.length; i += 4) {
        const color = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2]
        uniqueColors.add(color)
        if (uniqueColors.size > 1000) break // Suficiente variación de colores
      }
      
      if (uniqueColors.size < 10) {
        Swal.fire({
          title: 'Imagen sospechosa',
          text: 'La imagen parece no tener suficiente contenido. Por favor, usa una foto clara del comprobante.',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        })
        event.target.value = ''
        return
      }
      
      // Si pasa todas las validaciones, asignar el archivo
      documentoPago.value = file
      previewUrl.value = URL.createObjectURL(file)
    }
    
    img.onerror = () => {
      Swal.fire({
        title: 'Imagen corrupta',
        text: 'El archivo de imagen parece estar corrupto. Por favor, verifica el archivo.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      })
      event.target.value = ''
    }
    
    img.src = URL.createObjectURL(file)
  } else {
    // Para PDFs, asignar directamente
    documentoPago.value = file
    previewUrl.value = ''
  }
}

const copiarTexto = (texto) => {
  navigator.clipboard.writeText(texto).then(() => {
    Swal.fire({
      title: '¡Copiado!',
      text: 'Información copiada al portapapeles',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    })
  })
}

// Función para quitar archivo
const removeFile = () => {
  documentoPago.value = null
  previewUrl.value = ''
  // Limpiar el input file
  const fileInput = document.getElementById('documentoPago')
  if (fileInput) {
    fileInput.value = ''
  }
}

// Procesar pedido
const procesarPedido = async () => {
  loading.value = true
  error.value = ''

  try {
    // Validaciones de pago OBLIGATORIAS
    if (!metodoPagoSeleccionado.value || metodoPagoSeleccionado.value === '') {
      throw new Error('Por favor selecciona un método de pago')
    }
    
    if (!documentoPago.value) {
      throw new Error('Por favor adjunta el comprobante de pago')
    }

    // Validación de pago DESHABILITADA - Solo se procesan pedidos
    /*
    if (metodoPago.value === 'tarjeta') {
      if (!datosTarjeta.value.numero || !datosTarjeta.value.titular || 
          !datosTarjeta.value.expiracion || !datosTarjeta.value.cvv) {
        throw new Error('Por favor completa todos los datos de la tarjeta')
      }
      // Validar formato básico
      const numeroLimpio = datosTarjeta.value.numero.replace(/\s/g, '')
      if (numeroLimpio.length < 15 || numeroLimpio.length > 16) {
        throw new Error('Número de tarjeta inválido')
      }
      if (datosTarjeta.value.cvv.length < 3 || datosTarjeta.value.cvv.length > 4) {
        throw new Error('CVV inválido')
      }
    }
    */

    // Validación de número de operación DESHABILITADA - No hay pagos online
    // if (['yape', 'plin', 'transferencia'].includes(metodoPago.value)) {
    //   if (!datosCliente.value.numeroOperacion || datosCliente.value.numeroOperacion.trim() === '') {
    //     throw new Error('Por favor ingresa el número de operación')
    //   }
    // }

    // Preparar datos del pedido - SIMPLIFICADO SIN MÉTODOS DE PAGO
    const pedidoData = {
      usuario_id: authStore.user?.id || null,
      datos_cliente: {
        ...datosCliente.value
        // Eliminadas validaciones de pago - solo datos del cliente
      },
      tipo_entrega: tipoEntrega.value || 'envio',
      direccion_envio: tipoEntrega.value === 'envio' ? direccionEnvio.value : {},
      metodo_pago: metodoPagoSeleccionado.value, // Método de pago seleccionado
      metodo_pago_detalle: metodoPagoSeleccionado.value, // Para compatibilidad
      items: items.value.map(item => {
        const unit = item.cantidad > 0 ? (item.precioTotal / item.cantidad) : 0
        return {
          producto_id: Number(item.producto.id) || 0,
          cantidad: Number(item.cantidad) || 0,
          precio_unitario: Number(unit.toFixed(2)) || 0,
          tipo: item.tipo || '',
          tamano: item.tamano || '',
          notas: item.detalles?.notas || '',
          precio_total: Number(item.precioTotal.toFixed(2)) || 0,
          descuento_aplicado: Number(cartStore.obtenerDescuentoItem(item.cartItemId)?.porcentaje) || 0
        }
      }),
      subtotal: Number(subtotal.value) || 0,
      descuento: Number(descuento.value) || 0,
      costo_envio: Number(costoEnvio.value) || 0,
      total: Number(totalFinal.value) || 0,
      estado: 'pendiente'
    }

    // Crear FormData para enviar archivo junto con datos
    const formData = new FormData()
    
    // Agregar datos del pedido
    Object.keys(pedidoData).forEach(key => {
      if (key === 'items' || key === 'datos_cliente' || key === 'direccion_envio') {
        formData.append(key, JSON.stringify(pedidoData[key]))
      } else {
        // Enviar null como string "null" para que el backend lo maneje correctamente
        formData.append(key, pedidoData[key] === null ? '' : pedidoData[key])
      }
    })

    // Agregar archivo si existe
    if (documentoPago.value) {
      formData.append('documentoPago', documentoPago.value)
    }

    // Enviar pedido al backend
    const response = await fetch(`${getApiBase()}/pedidos`, {
      method: 'POST',
      headers: {
        ...(authStore.token && { 'Authorization': `Bearer ${authStore.token}` })
        // No incluir 'Content-Type' para que el navegador configure multipart/form-data automáticamente
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al procesar el pedido')
    }

    // Pedido exitoso
    success.value = true
    
    // Limpiar datos sensibles
    datosTarjeta.value = { numero: '', titular: '', expiracion: '', cvv: '' }
    
    // Limpiar carrito
    cartStore.clearCart()
    
    // Redirigir después de 3 segundos
    setTimeout(() => {
      router.push('/')
    }, 3000)

  } catch (err) {
    console.error('Error al procesar pedido:', err)
    error.value = err.message || 'Error al procesar el pedido. Por favor intenta nuevamente.'
  } finally {
    loading.value = false
  }
}

// Si el carrito está vacío, redirigir
if (items.value.length === 0 && !success.value) {
  router.push('/productos')
}
</script>

<template>
  <div class="checkout-container">
    <!-- Mensaje de éxito -->
    <div v-if="success" class="success-message">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h2>¡Pedido realizado con éxito!</h2>
      <p>Hemos recibido tu pedido correctamente.</p>
      <p class="redirect-text">Serás redirigido en unos segundos...</p>
    </div>

    <!-- Formulario de checkout -->
    <div v-else class="checkout-content">
      <!-- Indicador de pasos modernizado -->
      <div class="steps-indicator-modern">
        <div class="steps-progress-track">
          <div class="steps-progress-fill" :style="{ width: getProgressWidth() }"></div>
        </div>
        
        <div class="steps-container">
          <div class="step-modern" :class="{ active: paso === 1, completed: paso > 1 }">
            <div class="step-circle">
              <div class="step-inner">
                <i v-if="paso > 1" class="fas fa-check"></i>
                <span v-else>1</span>
              </div>
              <div class="step-ripple"></div>
            </div>
            <div class="step-content">
              <div class="step-title">Datos Personales</div>
              <div class="step-subtitle">Información de contacto</div>
            </div>
          </div>
          
          <div class="step-modern" :class="{ active: paso === 2, completed: paso > 2 }">
            <div class="step-circle">
              <div class="step-inner">
                <i v-if="paso > 2" class="fas fa-check"></i>
                <span v-else>2</span>
              </div>
              <div class="step-ripple"></div>
            </div>
            <div class="step-content">
              <div class="step-title">Tipo de Entrega</div>
              <div class="step-subtitle">Envío o recojo</div>
            </div>
          </div>
          
          <div v-if="tipoEntrega === 'envio'" class="step-modern" :class="{ active: paso === 3, completed: paso > 3 }">
            <div class="step-circle">
              <div class="step-inner">
                <i v-if="paso > 3" class="fas fa-check"></i>
                <span v-else>3</span>
              </div>
              <div class="step-ripple"></div>
            </div>
            <div class="step-content">
              <div class="step-title">Dirección</div>
              <div class="step-subtitle">Datos de envío</div>
            </div>
          </div>
          
          <div class="step-modern" :class="{ active: paso === 4 || (paso === 3 && tipoEntrega === 'recojo') }">
            <div class="step-circle">
              <div class="step-inner">
                <span>{{ tipoEntrega === 'envio' ? '4' : '3' }}</span>
              </div>
              <div class="step-ripple"></div>
            </div>
            <div class="step-content">
              <div class="step-title">Confirmación</div>
              <div class="step-subtitle">Revisar y pagar</div>
            </div>
          </div>
        </div>
      </div>

      <div class="checkout-grid">
        <!-- Formulario -->
        <div class="checkout-form">
          <!-- Error global -->
          <div v-if="error" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
          </div>

          <!-- Paso 1: Datos del Cliente -->
          <div v-show="paso === 1" class="form-section">
            <h2>Datos del Cliente</h2>
            <div class="form-group">
              <label for="nombre">Nombre Completo *</label>
              <input 
                type="text" 
                id="nombre" 
                v-model="datosCliente.nombre"
                placeholder="Tu nombre completo"
                required
              >
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                v-model="datosCliente.email"
                placeholder="tu@email.com"
                required
              >
            </div>
            <div class="form-group">
              <label for="telefono">Teléfono *</label>
              <input 
                type="tel" 
                id="telefono" 
                v-model="datosCliente.telefono"
                placeholder="999 999 999"
                required
              >
            </div>
            <div class="form-group">
              <label for="documento">DNI / RUC *</label>
              <input 
                type="text" 
                id="documento" 
                v-model="datosCliente.documento"
                placeholder="12345678"
                required
              >
            <!-- INICIO: Información de Cuentas de Pago -->
            <div class="payment-info-box">
              <div class="payment-info-header">
                <i class="fas fa-wallet"></i>
                <h3>Nuestras Cuentas</h3>
                <p>Selecciona tu método de pago preferido y adjunta el comprobante.</p>
              </div>
              
              <!-- Selector de métodos de pago -->
              <div class="payment-methods-selector">
                <div 
                  class="payment-method-option" 
                  :class="{ active: metodoPagoSeleccionado === 'yape' }"
                  @click="metodoPagoSeleccionado = metodoPagoSeleccionado === 'yape' ? '' : 'yape'"
                >
                  <div class="method-logo">
                    <img src="/images/yape.png" alt="Yape" />
                  </div>
                  <span class="method-name">Yape</span>
                  <i class="fas fa-chevron-down arrow-icon" :class="{ rotated: metodoPagoSeleccionado === 'yape' }"></i>
                </div>

                <div 
                  class="payment-method-option" 
                  :class="{ active: metodoPagoSeleccionado === 'plin' }"
                  @click="metodoPagoSeleccionado = metodoPagoSeleccionado === 'plin' ? '' : 'plin'"
                >
                  <div class="method-logo">
                    <img src="/images/plin.png" alt="Plin" />
                  </div>
                  <span class="method-name">Plin</span>
                  <i class="fas fa-chevron-down arrow-icon" :class="{ rotated: metodoPagoSeleccionado === 'plin' }"></i>
                </div>

                <div 
                  class="payment-method-option" 
                  :class="{ active: metodoPagoSeleccionado === 'bcp' }"
                  @click="metodoPagoSeleccionado = metodoPagoSeleccionado === 'bcp' ? '' : 'bcp'"
                >
                  <div class="method-logo">
                    <img src="/images/bcp.png" alt="BCP" />
                  </div>
                  <span class="method-name">BCP</span>
                  <i class="fas fa-chevron-down arrow-icon" :class="{ rotated: metodoPagoSeleccionado === 'bcp' }"></i>
                </div>
              </div>

              <!-- Información detallada del método seleccionado -->
              <transition name="fade-slide">
                <div v-if="metodoPagoSeleccionado" class="payment-details-container">
                  
                  <!-- Detalles de Yape -->
                  <div v-if="metodoPagoSeleccionado === 'yape'" class="payment-detail-card yape-detail">
                    <div class="detail-header">
                      <img src="/images/yape.png" alt="Yape" class="detail-logo"/>
                      <div>
                        <h4>Pagar con Yape</h4>
                        <p>Escanea el código QR o usa el número</p>
                      </div>
                    </div>
                    
                    <div class="detail-content">
                      <div class="qr-section">
                        <div class="qr-container-large">
                          <img src="/images/qr-yape.jpg" alt="QR Yape" class="qr-image-large"/>
                          <span class="qr-label">Escanea para pagar</span>
                        </div>
                      </div>
                      
                      <div class="payment-info">
                        <div class="info-item">
                          <span class="info-label">A nombre de:</span>
                          <span class="info-value">Alsimtex S.A.C.</span>
                        </div>
                        <div class="info-item highlight">
                          <span class="info-label">Número Yape:</span>
                          <div class="info-value-group">
                            <span class="info-value">{{ empresaConfig.pagos?.yape?.numeroDisplay || '948 435 269' }}</span>
                            <button type="button" class="btn-copy-modern" @click="copiarTexto(empresaConfig.pagos?.yape?.numero || '948435269')" title="Copiar número">
                              <i class="fas fa-copy"></i>
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Detalles de Plin -->
                  <div v-if="metodoPagoSeleccionado === 'plin'" class="payment-detail-card plin-detail">
                    <div class="detail-header">
                      <img src="/images/plin.png" alt="Plin" class="detail-logo"/>
                      <div>
                        <h4>Pagar con Plin</h4>
                        <p>Escanea el código QR o usa el número</p>
                      </div>
                    </div>
                    
                    <div class="detail-content">
                      <div class="qr-section">
                        <div class="qr-container-large">
                          <img src="/images/plin-qr.png" alt="QR Plin" class="qr-image-large"/>
                          <span class="qr-label">Escanea para pagar</span>
                        </div>
                      </div>
                      
                      <div class="payment-info">
                        <div class="info-item">
                          <span class="info-label">A nombre de:</span>
                          <span class="info-value">Alsimtex S.A.C.</span>
                        </div>
                        <div class="info-item highlight">
                          <span class="info-label">Número Plin:</span>
                          <div class="info-value-group">
                            <span class="info-value">{{ empresaConfig.pagos?.plin?.numeroDisplay || '948 435 269' }}</span>
                            <button type="button" class="btn-copy-modern" @click="copiarTexto(empresaConfig.pagos?.plin?.numero || '948435269')" title="Copiar número">
                              <i class="fas fa-copy"></i>
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Detalles de BCP -->
                  <div v-if="metodoPagoSeleccionado === 'bcp'" class="payment-detail-card bcp-detail">
                    <div class="detail-header">
                      <img src="/images/bcp.png" alt="BCP" class="detail-logo"/>
                      <div>
                        <h4>Transferencia Bancaria BCP</h4>
                        <p>Realiza la transferencia a nuestra cuenta</p>
                      </div>
                    </div>
                    
                    <div class="detail-content">
                      <div class="bank-info-grid">
                        <div class="info-item">
                          <span class="info-label">Banco:</span>
                          <span class="info-value">Banco de Crédito del Perú</span>
                        </div>
                        <div class="info-item">
                          <span class="info-label">Titular:</span>
                          <span class="info-value">Alsimtex S.A.C.</span>
                        </div>
                        <div class="info-item highlight">
                          <span class="info-label">Cuenta Corriente:</span>
                          <div class="info-value-group">
                            <span class="info-value">193-2456789-0-12</span>
                            <button type="button" class="btn-copy-modern" @click="copiarTexto('193-2456789-0-12')" title="Copiar cuenta">
                              <i class="fas fa-copy"></i>
                              Copiar
                            </button>
                          </div>
                        </div>
                        <div class="info-item highlight">
                          <span class="info-label">CCI:</span>
                          <div class="info-value-group">
                            <span class="info-value">002-193-002456789012-15</span>
                            <button type="button" class="btn-copy-modern" @click="copiarTexto('002-193-002456789012-15')" title="Copiar CCI">
                              <i class="fas fa-copy"></i>
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </transition>
            </div>
            <!-- FIN: Información de Cuentas de Pago -->

              <!-- Sección de adjuntar documento -->
              <div class="form-group document-upload-section">
                <label class="document-upload-label required">
                  <i class="fas fa-receipt"></i>
                  ADJUNTE COMPROBANTE DE PAGO *
                  <span class="required-indicator">(Obligatorio)</span>
                </label>
                <p class="document-help-text">
                  Sube una foto del voucher, captura de pantalla del pago o documento PDF. 
                  Archivos permitidos: JPG, PNG, WEBP, PDF (máximo 3MB)
                  <br><strong>Este comprobante será verificado antes de procesar tu pedido para evitar fraudes.</strong>
                </p>
                
                <div class="file-upload-container">
                  <div class="file-input-wrapper" :class="{ 'has-file': documentoPago }">
                    <input 
                      type="file" 
                      id="documentoPago" 
                      @change="handleFileUpload"
                      accept="image/*,.pdf"
                      class="file-input"
                    >
                    <label for="documentoPago" class="file-input-label">
                      <div class="upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                      </div>
                      <div class="upload-text">
                        <span class="upload-title" v-if="!documentoPago">
                          Haz clic para seleccionar archivo
                        </span>
                        <span class="upload-title" v-else>
                          {{ documentoPago.name }}
                        </span>
                        <span class="upload-subtitle">
                          o arrastra tu archivo aquí
                        </span>
                      </div>
                    </label>
                  </div>
                  
                  <!-- Vista previa de imagen -->
                  <div v-if="previewUrl" class="file-preview">
                    <div class="preview-header">
                      <span>Vista previa:</span>
                      <button type="button" @click="removeFile" class="btn-remove-file">
                        <i class="fas fa-times"></i>
                        Quitar archivo
                      </button>
                    </div>
                    <img :src="previewUrl" alt="Vista previa del comprobante" class="preview-image">
                  </div>
                  
                  <!-- Info de archivo PDF -->
                  <div v-else-if="documentoPago && documentoPago.type === 'application/pdf'" class="file-info">
                    <div class="file-info-content">
                      <i class="fas fa-file-pdf pdf-icon"></i>
                      <div class="file-details">
                        <span class="file-name">{{ documentoPago.name }}</span>
                        <span class="file-size">{{ (documentoPago.size / 1024 / 1024).toFixed(2) }} MB</span>
                      </div>
                      <button type="button" @click="removeFile" class="btn-remove-file">
                        <i class="fas fa-times"></i>
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="router.push('/productos')"
              >
                <i class="fas fa-arrow-left"></i>
                Volver a Productos
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="siguientePaso"
              >
                Continuar
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Paso 2: Tipo de Entrega -->
          <div v-show="paso === 2" class="form-section">
            <h2>Tipo de Entrega</h2>
            <p class="section-description">Elige cómo deseas recibir tu pedido</p>
            
            <div class="entrega-options">
              <label class="entrega-option" :class="{ selected: tipoEntrega === 'envio' }">
                <input 
                  type="radio" 
                  name="tipoEntrega" 
                  value="envio" 
                  v-model="tipoEntrega"
                >
                <div class="option-content">
                  <div class="option-icon">
                    <i class="fas fa-truck"></i>
                  </div>
                  <div class="option-details">
                    <h3>Envío a Domicilio</h3>
                    <p>Recibe tu pedido en la dirección que indiques</p>
                    <div class="option-info">
                      <span class="info-badge">
                        <i class="fas fa-clock"></i>
                        Entrega en 3-5 días
                      </span>
                      <span class="info-badge" v-if="total >= 500">
                        <i class="fas fa-gift"></i>
                        Envío GRATIS
                      </span>
                      <span class="info-badge" v-else>
                        <i class="fas fa-dollar-sign"></i>
                        Costo: S/30.00
                      </span>
                    </div>
                  </div>
                  <div class="option-check">
                    <i class="fas fa-check-circle"></i>
                  </div>
                </div>
              </label>

              <label class="entrega-option" :class="{ selected: tipoEntrega === 'recojo' }">
                <input 
                  type="radio" 
                  name="tipoEntrega" 
                  value="recojo" 
                  v-model="tipoEntrega"
                >
                <div class="option-content">
                  <div class="option-icon">
                    <i class="fas fa-store"></i>
                  </div>
                  <div class="option-details">
                    <h3>Recojo en Tienda</h3>
                    <p>Retira tu pedido en nuestra tienda física</p>
                    <div class="option-info">
                      <span class="info-badge">
                        <i class="fas fa-clock"></i>
                        Disponible en 24 horas
                      </span>
                      <span class="info-badge success">
                        <i class="fas fa-check"></i>
                        Sin costo adicional
                      </span>
                    </div>
                    <div class="tienda-info" v-if="tipoEntrega === 'recojo'">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>Av. Argentina, Arequipa - Perú</span>
                    </div>
                  </div>
                  <div class="option-check">
                    <i class="fas fa-check-circle"></i>
                  </div>
                </div>
              </label>
            </div>

            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="pasoAnterior"
              >
                <i class="fas fa-arrow-left"></i>
                Anterior
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="siguientePaso"
              >
                Continuar
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Paso 3: Dirección de Envío (solo si es envío) -->
          <div v-show="paso === 3 && tipoEntrega === 'envio'" class="form-section">
            <h2>Dirección de Envío</h2>
            <div class="form-group">
              <label for="direccion">Dirección *</label>
              <input 
                type="text" 
                id="direccion" 
                v-model="direccionEnvio.direccion"
                placeholder="Calle, número, interior"
                required
              >
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="ciudad">Ciudad *</label>
                <input 
                  type="text" 
                  id="ciudad" 
                  v-model="direccionEnvio.ciudad"
                  placeholder="Lima"
                  required
                >
              </div>
              <div class="form-group">
                <label for="provincia">Provincia / Distrito *</label>
                <input 
                  type="text" 
                  id="provincia" 
                  v-model="direccionEnvio.provincia"
                  placeholder="Lima"
                  required
                >
              </div>
            </div>
            <div class="form-group">
              <label for="codigoPostal">Código Postal</label>
              <input 
                type="text" 
                id="codigoPostal" 
                v-model="direccionEnvio.codigoPostal"
                placeholder="15001"
              >
            </div>
            <div class="form-group">
              <label for="referencia">Referencias</label>
              <textarea 
                id="referencia" 
                v-model="direccionEnvio.referencia"
                placeholder="Puntos de referencia para la entrega"
                rows="3"
              ></textarea>
            </div>
            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="pasoAnterior"
              >
                <i class="fas fa-arrow-left"></i>
                Atrás
              </button>
              <button 
                type="button" 
                class="btn btn-primary"
                @click="siguientePaso"
              >
                Continuar
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Paso 4: Confirmación (o paso 3 si es recojo) -->
          <div v-show="paso === 4 || (paso === 3 && tipoEntrega === 'recojo')" class="form-section">
            <div class="section-header">
              <div class="header-icon">
                <i class="fas fa-check-circle"></i>
              </div>
              <div class="header-content">
                <h2>Confirmar Pedido</h2>
                <p class="section-subtitle">Revisa tu pedido y selecciona el método de pago</p>
              </div>
            </div>
            
            <!-- Método de pago -->
            <div class="payment-methods-section" style="display: none;">
              <div class="payment-header">
                <i class="fas fa-credit-card"></i>
                <div>
                  <h3>Método de Pago</h3>
                  <p class="payment-description">Selecciona tu método de pago preferido</p>
                </div>
              </div>
              
              <div class="payment-icons-grid">
                <!-- Yape -->
                <div class="payment-icon-card" :class="{ selected: metodoPago === 'yape' }" @click="metodoPago = 'yape'" title="Pagar con Yape">
                  <div class="icon-wrapper yape">
                    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="120" height="120" rx="24" fill="#722F85"/>
                      <circle cx="60" cy="50" r="25" fill="white" opacity="0.2"/>
                      <path d="M60 30C50 30 42 38 42 48C42 58 50 66 60 66C70 66 78 58 78 48C78 38 70 30 60 30ZM63 58H57V52H63V58ZM63 47H57V35H63V47Z" fill="white"/>
                      <path d="M45 72H75C77 72 79 74 79 76V82C79 84 77 86 75 86H45C43 86 41 84 41 82V76C41 74 43 72 45 72Z" fill="white" opacity="0.9"/>
                      <circle cx="52" cy="79" r="3" fill="#722F85"/>
                      <circle cx="60" cy="79" r="3" fill="#722F85"/>
                      <circle cx="68" cy="79" r="3" fill="#722F85"/>
                    </svg>
                  </div>
                  <div class="selected-indicator"><i class="fas fa-check-circle"></i></div>
                </div>

                <!-- Plin -->
                <div class="payment-icon-card" :class="{ selected: metodoPago === 'plin' }" @click="metodoPago = 'plin'" title="Pagar con Plin">
                  <div class="icon-wrapper plin">
                    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="120" height="120" rx="24" fill="#00A0DF"/>
                      <circle cx="60" cy="42" r="16" fill="white"/>
                      <path d="M40 62H80C82 62 84 64 84 66V80C84 82 82 84 80 84H40C38 84 36 82 36 80V66C36 64 38 62 40 62Z" fill="white"/>
                      <rect x="44" y="69" width="32" height="3" rx="1.5" fill="#00A0DF"/>
                      <rect x="44" y="75" width="20" height="3" rx="1.5" fill="#00A0DF"/>
                      <circle cx="72" cy="76" r="4" fill="#00A0DF" opacity="0.5"/>
                    </svg>
                  </div>
                  <div class="selected-indicator"><i class="fas fa-check-circle"></i></div>
                </div>

                <!-- Transferencia -->
                <div class="payment-icon-card" :class="{ selected: metodoPago === 'transferencia' }" @click="metodoPago = 'transferencia'" title="Transferencia Bancaria">
                  <div class="icon-wrapper bank">
                    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="120" height="120" rx="24" fill="#059669"/>
                      <path d="M60 32L32 50H36V78H48V62H72V78H84V50H88L60 32Z" fill="white"/>
                      <rect x="53" y="68" width="5" height="10" fill="#059669"/>
                      <rect x="62" y="68" width="5" height="10" fill="#059669"/>
                      <rect x="28" y="82" width="64" height="6" rx="2" fill="white"/>
                    </svg>
                  </div>
                  <div class="selected-indicator"><i class="fas fa-check-circle"></i></div>
                </div>

                <!-- Tarjeta -->
                <div class="payment-icon-card" :class="{ selected: metodoPago === 'tarjeta' }" @click="metodoPago = 'tarjeta'" title="Tarjeta de Crédito/Débito">
                  <div class="icon-wrapper card">
                    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="120" height="120" rx="24" fill="#3b82f6"/>
                      <rect x="20" y="36" width="80" height="48" rx="6" fill="white"/>
                      <rect x="20" y="44" width="80" height="12" fill="#1e40af"/>
                      <rect x="28" y="64" width="36" height="8" rx="2" fill="#cbd5e1"/>
                      <circle cx="82" cy="68" r="8" fill="#f59e0b" opacity="0.7"/>
                      <circle cx="74" cy="68" r="8" fill="#ef4444" opacity="0.7"/>
                      <rect x="28" y="74" width="20" height="4" rx="1" fill="#e2e8f0"/>
                    </svg>
                  </div>
                  <div class="selected-indicator"><i class="fas fa-check-circle"></i></div>
                </div>

                <!-- Efectivo -->
                <div class="payment-icon-card" :class="{ selected: metodoPago === 'contraentrega' }" @click="metodoPago = 'contraentrega'" title="Pago contra entrega">
                  <div class="icon-wrapper cash">
                    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="120" height="120" rx="24" fill="#f59e0b"/>
                      <rect x="28" y="42" width="64" height="36" rx="4" fill="#10b981"/>
                      <circle cx="60" cy="60" r="14" fill="#fbbf24"/>
                      <text x="60" y="68" text-anchor="middle" fill="#047857" font-size="18" font-weight="bold">S/</text>
                      <rect x="32" y="46" width="6" height="28" fill="#047857" opacity="0.3"/>
                      <rect x="82" y="46" width="6" height="28" fill="#047857" opacity="0.3"/>
                      <circle cx="42" cy="60" r="3" fill="#047857" opacity="0.4"/>
                      <circle cx="78" cy="60" r="3" fill="#047857" opacity="0.4"/>
                    </svg>
                  </div>
                  <div class="selected-indicator"><i class="fas fa-check-circle"></i></div>
                </div>
              </div>

              <!-- Detalles expandidos del método seleccionado -->
              <transition name="expand">
                <div v-if="metodoPago" class="payment-details">
                  
                  <!-- Formulario Yape -->
                  <div v-if="metodoPago === 'yape'" class="payment-form">
                    <div class="payment-info-header">
                      <i class="fas fa-mobile-alt"></i>
                      <h4>Pagar con Yape</h4>
                    </div>
                    <div class="qr-payment-section">
                      <div class="qr-code-placeholder">
                        <i class="fas fa-qrcode"></i>
                        <p>Escanea el código QR</p>
                      </div>
                      <div class="payment-instructions">
                        <div class="instruction-item">
                          <span class="label">Número Yape:</span>
                          <span class="value">{{ empresaConfig.pagos?.yape?.numeroDisplay || '948 435 269' }}</span>
                        </div>
                        <div class="instruction-item">
                          <span class="label">Titular:</span>
                          <span class="value">Alsimtex S.A.C.</span>
                        </div>
                        <div class="instruction-item highlight">
                          <span class="label">Monto a pagar:</span>
                          <span class="value">S/ {{ totalFinal.toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Número de operación *</label>
                      <input type="text" v-model="datosCliente.numeroOperacion" placeholder="Ingresa el número de operación" required>
                      <small>Ingresa el código de 8 dígitos que aparece en tu recibo</small>
                    </div>
                    <div class="alert alert-info">
                      <i class="fas fa-info-circle"></i>
                      <span>Verificaremos tu pago antes de procesar el pedido (1-2 horas)</span>
                    </div>
                  </div>

                  <!-- Formulario Plin -->
                  <div v-else-if="metodoPago === 'plin'" class="payment-form">
                    <div class="payment-info-header">
                      <i class="fas fa-mobile-alt"></i>
                      <h4>Pagar con Plin</h4>
                    </div>
                    <div class="qr-payment-section">
                      <div class="qr-code-placeholder plin-color">
                        <i class="fas fa-qrcode"></i>
                        <p>Escanea el código QR</p>
                      </div>
                      <div class="payment-instructions">
                        <div class="instruction-item">
                          <span class="label">Número Plin:</span>
                          <span class="value">{{ empresaConfig.pagos?.plin?.numeroDisplay || '948 435 269' }}</span>
                        </div>
                        <div class="instruction-item">
                          <span class="label">Titular:</span>
                          <span class="value">Alsimtex S.A.C.</span>
                        </div>
                        <div class="instruction-item highlight">
                          <span class="label">Monto a pagar:</span>
                          <span class="value">S/ {{ totalFinal.toFixed(2) }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Número de operación *</label>
                      <input type="text" v-model="datosCliente.numeroOperacion" placeholder="Ingresa el número de operación" required>
                      <small>Ingresa el código que aparece en tu comprobante de pago</small>
                    </div>
                    <div class="alert alert-info">
                      <i class="fas fa-info-circle"></i>
                      <span>Verificaremos tu pago antes de procesar el pedido (1-2 horas)</span>
                    </div>
                  </div>

                  <!-- Formulario Transferencia Bancaria -->
                  <div v-else-if="metodoPago === 'transferencia'" class="payment-form">
                    <div class="payment-info-header">
                      <i class="fas fa-university"></i>
                      <h4>Transferencia Bancaria</h4>
                    </div>
                    <div class="bank-account-details">
                      <div class="bank-item">
                        <span class="label">Banco:</span>
                        <span class="value">BCP - Banco de Crédito del Perú</span>
                      </div>
                      <div class="bank-item">
                        <span class="label">Titular:</span>
                        <span class="value">{{ empresaConfig.nombre }}</span>
                      </div>
                      <div class="bank-item">
                        <span class="label">RUC:</span>
                        <span class="value">{{ empresaConfig?.datosLegales?.ruc || '20453859224' }}</span>
                      </div>
                      <div class="bank-item account-number">
                        <span class="label">Cuenta Corriente Soles:</span>
                        <span class="value">193-2456789-0-12</span>
                        <button type="button" class="btn-copy" @click="copiarTexto('193-2456789-0-12')" title="Copiar">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                      <div class="bank-item account-number">
                        <span class="label">CCI:</span>
                        <span class="value">002-193-002456789012-15</span>
                        <button type="button" class="btn-copy" @click="copiarTexto('002-193-002456789012-15')" title="Copiar">
                          <i class="fas fa-copy"></i>
                        </button>
                      </div>
                      <div class="bank-item highlight">
                        <span class="label">Monto a transferir:</span>
                        <span class="value amount">S/ {{ totalFinal.toFixed(2) }}</span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Número de operación *</label>
                      <input type="text" v-model="datosCliente.numeroOperacion" placeholder="Ingresa el número de operación" required>
                      <small>Lo encuentras en tu voucher o constancia de transferencia</small>
                    </div>
                    <div class="alert alert-info">
                      <i class="fas fa-info-circle"></i>
                      <span>La verificación puede tardar hasta 24 horas hábiles</span>
                    </div>
                  </div>

                  <!-- Formulario Tarjeta de Crédito/Débito -->
                  <div v-else-if="metodoPago === 'tarjeta'" class="payment-form">
                    <div class="payment-info-header">
                      <i class="fas fa-credit-card"></i>
                      <h4>Tarjeta de Crédito / Débito</h4>
                    </div>
                    <div class="card-brands">
                      <i class="fab fa-cc-visa" title="Visa"></i>
                      <i class="fab fa-cc-mastercard" title="Mastercard"></i>
                      <i class="fab fa-cc-amex" title="American Express"></i>
                      <i class="fab fa-cc-diners-club" title="Diners Club"></i>
                    </div>
                    <div class="card-form-fields">
                      <div class="form-group">
                        <label>Número de tarjeta *</label>
                        <div class="input-with-icon">
                          <input 
                            type="text" 
                            v-model="datosTarjeta.numero" 
                            placeholder="1234 5678 9012 3456" 
                            maxlength="19"
                            @input="formatearNumeroTarjeta"
                            required
                          >
                          <i class="fas fa-credit-card input-icon"></i>
                        </div>
                      </div>
                      <div class="form-group">
                        <label>Nombre del titular (como aparece en la tarjeta) *</label>
                        <input 
                          type="text" 
                          v-model="datosTarjeta.titular" 
                          placeholder="JUAN PEREZ LOPEZ" 
                          style="text-transform: uppercase"
                          required
                        >
                      </div>
                      <div class="form-row">
                        <div class="form-group">
                          <label>Fecha de expiración *</label>
                          <input 
                            type="text" 
                            v-model="datosTarjeta.expiracion" 
                            placeholder="MM/AA" 
                            maxlength="5"
                            @input="formatearExpiracion"
                            required
                          >
                        </div>
                        <div class="form-group">
                          <label>CVV / CVC *</label>
                          <div class="input-with-icon password-cvv-wrapper">
                            <input 
                              :type="showCVV ? 'text' : 'password'" 
                              v-model="datosTarjeta.cvv" 
                              placeholder="123" 
                              maxlength="4"
                              @input="soloNumeros($event, 'cvv')"
                              required
                            >
                            <i class="fas fa-lock input-icon"></i>
                            <button 
                              type="button" 
                              class="toggle-cvv" 
                              @click="showCVV = !showCVV"
                              :title="showCVV ? 'Ocultar CVV' : 'Mostrar CVV'"
                            >
                              <i :class="showCVV ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                          </div>
                          <small>Los 3 o 4 dígitos en el reverso</small>
                        </div>
                      </div>
                    </div>
                    <div class="security-info">
                      <div class="security-badge">
                        <i class="fas fa-shield-alt"></i>
                        <span>Pago Seguro SSL</span>
                      </div>
                      <div class="security-badge">
                        <i class="fas fa-lock"></i>
                        <span>Cifrado 256-bit</span>
                      </div>
                      <div class="security-badge">
                        <i class="fas fa-check-circle"></i>
                        <span>PCI Compliant</span>
                      </div>
                    </div>
                    <div class="alert alert-success">
                      <i class="fas fa-check-circle"></i>
                      <span>Tu información está protegida y no será almacenada</span>
                    </div>
                  </div>

                  <!-- Pago Contra Entrega / En Tienda -->
                  <div v-else-if="metodoPago === 'contraentrega'" class="payment-form">
                    <div class="payment-info-header">
                      <i class="fas fa-money-bill-wave"></i>
                      <h4>{{ tipoEntrega === 'recojo' ? 'Pago en Tienda' : 'Pago Contra Entrega' }}</h4>
                    </div>
                    <div class="cash-payment-info">
                      <div class="amount-display">
                        <span class="label">Monto a pagar:</span>
                        <span class="amount">S/ {{ totalFinal.toFixed(2) }}</span>
                      </div>
                      <ul class="payment-instructions-list">
                        <li><i class="fas fa-check-circle"></i> {{ tipoEntrega === 'recojo' ? 'Paga al recoger tu pedido en tienda' : 'Paga cuando recibas tu pedido' }}</li>
                        <li><i class="fas fa-check-circle"></i> Prepara el monto exacto si es posible</li>
                        <li><i class="fas fa-check-circle"></i> Recibirás tu boleta o factura en el momento</li>
                        <li><i class="fas fa-check-circle"></i> {{ tipoEntrega === 'recojo' ? 'Verifica tu pedido antes de pagar' : 'Verifica tu pedido al recibirlo' }}</li>
                        <li v-if="tipoEntrega === 'envio'"><i class="fas fa-info-circle"></i> Solo disponible en Lima Metropolitana</li>
                      </ul>
                    </div>
                    <div class="alert alert-warning" v-if="tipoEntrega === 'envio'">
                      <i class="fas fa-exclamation-triangle"></i>
                      <span>Este método tiene un recargo de S/ 5.00 por servicio de entrega</span>
                    </div>
                  </div>

                </div>
              </transition>
            </div>

            <!-- Información de Pedido -->
            <div class="order-info-section">
              <div class="order-info-header">
                <i class="fas fa-info-circle"></i>
                <div>
                  <h3>Información de Pedido</h3>
                  <p class="order-description">Revisa los detalles de tu solicitud</p>
                </div>
              </div>
              
              <div class="order-info-content">
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-shopping-cart"></i>
                  </div>
                  <div class="info-text">
                    <h4>Solo Generación de Pedido</h4>
                    <p>Esta plataforma genera tu pedido para coordinación posterior. No realizamos pagos online.</p>
                  </div>
                </div>
                
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-phone"></i>
                  </div>
                  <div class="info-text">
                    <h4>Coordinación Telefónica</h4>
                    <p>Nos contactaremos contigo para confirmar detalles y acordar la forma de pago.</p>
                  </div>
                </div>
                
                <div class="info-card">
                  <div class="info-icon">
                    <i class="fas fa-handshake"></i>
                  </div>
                  <div class="info-text">
                    <h4>Pago Flexible</h4>
                    <p>Podrás pagar en efectivo, transferencia, Yape, Plin o cualquier método que acordemos.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen de datos -->
            <div class="confirmation-summary">
              <div class="summary-header">
                <i class="fas fa-clipboard-list"></i>
                <h3>Resumen de tu Pedido</h3>
              </div>
              
              <div class="summary-grid">
                <div class="summary-section">
                  <div class="summary-section-title">
                    <i class="fas fa-user"></i>
                    <h4>Datos del Cliente</h4>
                  </div>
                  <p><i class="fas fa-id-card"></i> <strong>Nombre:</strong> {{ datosCliente.nombre }}</p>
                  <p><i class="fas fa-envelope"></i> <strong>Email:</strong> {{ datosCliente.email }}</p>
                  <p><i class="fas fa-phone"></i> <strong>Teléfono:</strong> {{ datosCliente.telefono }}</p>
                  <p><i class="fas fa-address-card"></i> <strong>Documento:</strong> {{ datosCliente.documento }}</p>
                </div>
              
                <div class="summary-section">
                  <div class="summary-section-title">
                    <i class="fas fa-shipping-fast"></i>
                    <h4>{{ tipoEntrega === 'envio' ? 'Dirección de Envío' : 'Recojo en Tienda' }}</h4>
                  </div>
                  <template v-if="tipoEntrega === 'envio'">
                    <p><i class="fas fa-map-marker-alt"></i> {{ direccionEnvio.direccion }}</p>
                    <p><i class="fas fa-city"></i> {{ direccionEnvio.ciudad }}, {{ direccionEnvio.provincia }}</p>
                    <p v-if="direccionEnvio.codigoPostal"><i class="fas fa-envelope"></i> CP: {{ direccionEnvio.codigoPostal }}</p>
                    <p v-if="direccionEnvio.referencia" class="referencia">
                      <i class="fas fa-info-circle"></i> <strong>Ref:</strong> {{ direccionEnvio.referencia }}
                    </p>
                  </template>
                  <template v-else>
                    <div class="tienda-recojo">
                      <div class="recojo-icon">
                        <i class="fas fa-store"></i>
                      </div>
                      <div class="recojo-info">
                        <p class="tienda-nombre"><i class="fas fa-shopping-bag"></i> <strong>ALSIMTEX - Tienda Principal</strong></p>
                        <p><i class="fas fa-map-marker-alt"></i> Av. Argentina</p>
                        <p><i class="fas fa-city"></i> Arequipa - Perú</p>
                        <p class="horario">
                          <i class="fas fa-clock"></i>
                          <strong>Horario:</strong> Lun - Sáb: 9:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="pasoAnterior"
                :disabled="loading"
              >
                <i class="fas fa-arrow-left"></i>
                Atrás
              </button>
              <button 
                type="button" 
                class="btn btn-primary btn-confirmar"
                @click="procesarPedido"
                :disabled="loading"
              >
                <span v-if="loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  Procesando...
                </span>
                <span v-else>
                  <i class="fas fa-check"></i>
                  Confirmar Pedido
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Resumen del pedido -->
        <div class="order-summary">
          <h2>Resumen del Pedido</h2>
          
          <div class="summary-items">
            <div v-for="item in items" :key="item.cartItemId" class="summary-item">
              <img :src="item.producto.imagen" :alt="item.producto.nombre">
              <div class="item-info">
                <h4>{{ item.producto.nombre }}</h4>
                <p class="item-specs">
                  {{ item.tipo }}
                  <span v-if="item.tamano"> - {{ item.tamano }}</span>
                </p>
                <p class="item-quantity">Cantidad: {{ item.cantidad }}</p>
              </div>
              <div class="item-price">
                {{ formatPrice(cartStore.obtenerDescuentoItem(item.cartItemId)?.precioFinal || item.precioTotal) }}
              </div>
            </div>
          </div>

          <div class="summary-totals">
            <div class="total-row">
              <span>Subtotal ({{ totalItems }} items):</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div v-if="descuento > 0" class="total-row discount">
              <span>Descuento por cantidad:</span>
              <span>-{{ formatPrice(descuento) }}</span>
            </div>
            <div class="total-row">
              <span>Costo de envío:</span>
              <span :class="{ 'free-shipping': costoEnvio === 0 }">
                {{ costoEnvio === 0 ? 'GRATIS' : formatPrice(costoEnvio) }}
              </span>
            </div>
            <div v-if="costoEnvio > 0 && total < 500" class="shipping-note">
              <i class="fas fa-info-circle"></i>
              Envío gratis en compras mayores a S/500
            </div>
            <div class="total-row final">
              <span>Total:</span>
              <span>{{ formatPrice(totalFinal) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: var(--spacing-4xl) var(--spacing-xl);
}

/* Mensaje de éxito */
.success-message {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  background: white;
  padding: var(--spacing-4xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
}

.success-icon {
  font-size: 5rem;
  color: var(--success-color);
  margin-bottom: var(--spacing-xl);
  animation: scaleIn 0.5s ease-out;
}

.success-message h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.success-message p {
  color: var(--text-secondary);
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-md);
}

.redirect-text {
  font-size: var(--font-sm) !important;
  color: var(--text-tertiary) !important;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Indicador de pasos moderno */
.steps-indicator-modern {
  max-width: 800px;
  margin: 0 auto var(--spacing-4xl);
  position: relative;
  padding: var(--spacing-2xl);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--border-radius-3xl);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.steps-progress-track {
  position: absolute;
  top: 60px;
  left: 80px;
  right: 80px;
  height: 6px;
  background: rgba(226, 232, 240, 0.8);
  border-radius: var(--border-radius-full);
  overflow: hidden;
  z-index: 1;
}

.steps-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #14b8a6, #059669, #047857);
  border-radius: var(--border-radius-full);
  transition: width 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.5);
}

.steps-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6));
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.steps-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 2;
}

.step-modern {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.step-circle {
  position: relative;
  width: 70px;
  height: 70px;
  margin-bottom: var(--spacing-lg);
}

.step-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 4px solid rgba(226, 232, 240, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-bold);
  font-size: var(--font-xl);
  color: var(--text-tertiary);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  z-index: 2;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.step-ripple {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: rgba(20, 184, 166, 0.1);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.step-modern.active .step-inner {
  background: linear-gradient(135deg, #14b8a6, #059669);
  border-color: #14b8a6;
  color: white;
  transform: scale(1.1);
  box-shadow: 
    0 10px 25px rgba(20, 184, 166, 0.4),
    0 0 0 8px rgba(20, 184, 166, 0.1);
  animation: activeStep 2s ease-in-out infinite;
}

.step-modern.active .step-ripple {
  opacity: 1;
  transform: scale(1.2);
  animation: rippleEffect 2s ease-in-out infinite;
}

@keyframes activeStep {
  0%, 100% {
    box-shadow: 
      0 10px 25px rgba(20, 184, 166, 0.4),
      0 0 0 8px rgba(20, 184, 166, 0.1);
  }
  50% {
    box-shadow: 
      0 15px 35px rgba(20, 184, 166, 0.5),
      0 0 0 12px rgba(20, 184, 166, 0.15);
  }
}

@keyframes rippleEffect {
  0%, 100% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.1;
  }
}

.step-modern.completed .step-inner {
  background: linear-gradient(135deg, #059669, #047857);
  border-color: #059669;
  color: white;
  box-shadow: 
    0 8px 20px rgba(5, 150, 105, 0.3),
    0 0 0 6px rgba(5, 150, 105, 0.1);
}

.step-content {
  text-align: center;
  max-width: 140px;
}

.step-title {
  font-size: var(--font-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  transition: all 0.3s ease;
}

.step-subtitle {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  line-height: 1.4;
  transition: all 0.3s ease;
}

.step-modern.active .step-title {
  color: var(--secondary-color);
  transform: translateY(-2px);
}

.step-modern.active .step-subtitle {
  color: var(--secondary-dark);
}

/* Grid de checkout */
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto;
}

/* Formulario */
.checkout-form {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
}

.form-section h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-2xl);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

.form-group label {
  display: block;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-base);
  transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.form-actions {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
}

.btn {
  flex: 1;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-semibold);
  font-size: var(--font-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: none;
}

.btn-primary {
  background: var(--secondary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--secondary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: white;
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirmar {
  background: var(--success-color);
}

.btn-confirmar:hover:not(:disabled) {
  background: var(--success-dark, #27ae60);
}

/* Métodos de pago */
.payment-methods {
  margin-bottom: var(--spacing-2xl);
}

.payment-methods h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-xl);
}

.payment-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-sm);
  text-align: center;
}

/* Grid de iconos - HORIZONTAL */
.payment-icons-grid {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.payment-icon-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  padding: var(--spacing-sm);
  background: white;
  border: 3px solid transparent;
  border-radius: var(--border-radius-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.payment-icon-card:hover {
  border-color: var(--secondary-color);
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
}

.payment-icon-card.selected {
  border-color: var(--secondary-color);
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(20, 184, 166, 0.05));
  box-shadow: var(--shadow-xl), 0 0 0 4px rgba(20, 184, 166, 0.2);
}

.icon-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-normal);
  flex-shrink: 0;
  overflow: hidden;
}

.icon-wrapper svg {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.icon-wrapper i {
  font-size: 2rem;
}

.icon-wrapper.yape {
  background: transparent;
}

.icon-wrapper.plin {
  background: transparent;
}

.icon-wrapper.bank {
  background: transparent;
}

.icon-wrapper.card {
  background: transparent;
}

.icon-wrapper.cash {
  background: transparent;
}

.payment-icon-card:hover .icon-wrapper {
  transform: scale(1.05);
}

.payment-icon-card.selected .icon-wrapper {
  transform: scale(1.1);
  animation: iconPulse 0.6s ease-out;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1.1); }
  50% { transform: scale(1.15); }
}

.selected-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 1.5rem;
  color: var(--secondary-color);
  background: white;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all var(--transition-normal);
}

.payment-icon-card.selected .selected-indicator {
  opacity: 1;
  transform: scale(1);
  animation: checkBounce 0.4s ease-out;
}

@keyframes checkBounce {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

/* Detalles expandidos - Formularios */
.payment-details {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-xl);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
  margin-top: var(--spacing-xl);
}

.payment-form {
  max-width: 700px;
  margin: 0 auto;
}

.payment-info-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-color);
}

.payment-info-header i {
  font-size: 2rem;
  color: var(--primary-color);
}

.payment-info-header h4 {
  font-size: var(--font-xl);
  color: var(--text-primary);
  margin: 0;
}

/* QR y detalles de pago */
.qr-payment-section {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(114, 47, 133, 0.05), rgba(155, 75, 161, 0.05));
  border-radius: var(--border-radius-lg);
}

.qr-code-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  border: 3px dashed #722F85;
  border-radius: var(--border-radius-lg);
}

.qr-code-placeholder.plin-color {
  border-color: #00A0DF;
}

.qr-code-placeholder i {
  font-size: 4rem;
  color: #722F85;
  margin-bottom: var(--spacing-md);
}

.qr-code-placeholder.plin-color i {
  color: #00A0DF;
}

.qr-code-placeholder p {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  margin: 0;
}

.payment-instructions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  justify-content: center;
}

.instruction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-md);
}

.instruction-item.highlight {
  background: var(--primary-color);
  color: white;
  font-weight: var(--font-bold);
  font-size: var(--font-lg);
}

.instruction-item .label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.instruction-item.highlight .label {
  color: rgba(255, 255, 255, 0.9);
}

.instruction-item .value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.instruction-item.highlight .value {
  color: white;
}

/* Detalles bancarios */
.bank-account-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(20, 184, 166, 0.05));
  border-radius: var(--border-radius-lg);
}

.bank-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-md);
  position: relative;
}

.bank-item.account-number {
  border: 2px solid var(--primary-color);
}

.bank-item.highlight {
  background: var(--primary-color);
  color: white;
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
}

.bank-item .label {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
}

.bank-item.highlight .label {
  color: rgba(255, 255, 255, 0.9);
}

.bank-item .value {
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.bank-item.highlight .value {
  color: white;
}

.bank-item .value.amount {
  font-size: var(--font-2xl);
  font-family: inherit;
}

.btn-copy {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-left: var(--spacing-md);
}

.btn-copy:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.btn-copy i {
  font-size: var(--font-base);
}

/* Formulario de tarjeta */
.card-brands {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.card-brands i {
  font-size: 3rem;
  opacity: 0.7;
  transition: all var(--transition-normal);
}

.card-brands i:hover {
  opacity: 1;
  transform: scale(1.1);
}

.card-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-right: 40px;
}

.password-cvv-wrapper input {
  padding-right: 75px;
}

.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  pointer-events: none;
}

.toggle-cvv {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 5px 10px;
  font-size: 1rem;
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.toggle-cvv:hover {
  color: var(--secondary-color);
}

.security-info {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.security-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: white;
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

.security-badge i {
  color: var(--primary-color);
}

/* Pago en efectivo */
.cash-payment-info {
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(251, 191, 36, 0.05));
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-xl);
}

.amount-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  border: 2px solid var(--primary-color);
}

.amount-display .label {
  font-size: var(--font-lg);
  color: var(--text-secondary);
}

.amount-display .amount {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--primary-color);
}

.payment-instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.payment-instructions-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: white;
  border-radius: var(--border-radius-md);
}

.payment-instructions-list li i {
  color: var(--primary-color);
  margin-top: 2px;
  flex-shrink: 0;
}

/* Alertas */
.alert {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-lg);
}

.alert i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.alert-info {
  background: #e0f2fe;
  border-left: 4px solid #0284c7;
  color: #075985;
}

.alert-warning {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.alert-success {
  background: #d1fae5;
  border-left: 4px solid #059669;
  color: #065f46;
}

.alert span {
  font-size: var(--font-sm);
}

.form-group small {
  display: block;
  margin-top: var(--spacing-xs);
  font-size: var(--font-xs);
  color: var(--text-secondary);
}

/* Sección de entrega */
/* Animación de expansión */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
}

.expand-enter-to {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.expand-leave-from {
  opacity: 1;
  max-height: 500px;
  transform: translateY(0);
}

.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-20px);
}

/* Estilos antiguos para compatibilidad */
.payment-option {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.payment-option input[type="radio"] {
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-md);
  cursor: pointer;
}

.payment-option label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.payment-option input[type="radio"]:checked + label {
  border-color: var(--secondary-color);
  background: rgba(139, 69, 19, 0.05);
}

.payment-option label i {
  font-size: var(--font-xl);
  color: var(--secondary-color);
}

.payment-option label strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.payment-option label span {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
}

/* Confirmación */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: var(--border-radius-xl);
  color: white;
  box-shadow: var(--shadow-lg);
}

.section-header .header-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.section-header .header-content h2 {
  margin: 0;
  font-size: var(--font-2xl);
  color: white;
}

.section-header .section-subtitle {
  margin: var(--spacing-xs) 0 0 0;
  opacity: 0.9;
  font-size: var(--font-sm);
}

.payment-methods-section {
  margin-bottom: var(--spacing-2xl);
}

.payment-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border-left: 4px solid var(--primary-color);
}

.payment-header i {
  font-size: 2rem;
  color: var(--primary-color);
}

.payment-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-xl);
}

.payment-header .payment-description {
  margin: var(--spacing-xs) 0 0 0;
  color: var(--text-secondary);
  font-size: var(--font-sm);
}

.confirmation-summary {
  margin-bottom: var(--spacing-2xl);
  background: white;
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(20, 184, 166, 0.1));
  border-bottom: 2px solid var(--border-color);
}

.summary-header i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.summary-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-xl);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.summary-section {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--border-color);
  transition: all var(--transition-normal);
}

.summary-section:hover {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.summary-section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--primary-color);
}

.summary-section-title i {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.summary-section-title h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
}

.summary-section p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xs);
  line-height: 1.6;
}

.summary-section p i {
  color: var(--primary-color);
  margin-top: 2px;
  font-size: 0.9rem;
}

.summary-section p strong {
  color: var(--text-primary);
  min-width: 100px;
}

.summary-section .referencia {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-sm);
  font-style: italic;
  color: var(--text-tertiary);
}

/* Resumen del pedido */
.order-summary {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-lg);
  height: fit-content;
  position: sticky;
  top: var(--spacing-xl);
}

.order-summary h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  font-size: var(--font-xl);
}

.summary-items {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: var(--spacing-xl);
  padding-right: var(--spacing-sm);
}

.summary-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
}

.item-info h4 {
  color: var(--text-primary);
  font-size: var(--font-base);
  margin-bottom: var(--spacing-xs);
}

.item-specs,
.item-quantity {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
}

.item-price {
  font-weight: var(--font-bold);
  color: var(--secondary-color);
  font-size: var(--font-lg);
}

.summary-totals {
  padding-top: var(--spacing-xl);
  border-top: 2px solid var(--border-color);
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.total-row.discount {
  color: var(--success-color);
  font-weight: var(--font-semibold);
}

.total-row.final {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  padding-top: var(--spacing-lg);
  border-top: 2px solid var(--border-color);
  margin-top: var(--spacing-lg);
}

.total-row.final span:last-child {
  color: var(--secondary-color);
}

.free-shipping {
  color: var(--success-color) !important;
  font-weight: var(--font-bold);
}

.shipping-note {
  font-size: var(--font-sm);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--info-bg, #e3f2fd);
  border-radius: var(--border-radius-md);
}

/* Alert */
.alert {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.alert-error {
  background: var(--danger-bg);
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

/* Opciones de entrega */
.section-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.entrega-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.entrega-option {
  position: relative;
  cursor: pointer;
}

.entrega-option input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: white;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-xl);
  transition: all var(--transition-normal);
}

.entrega-option:hover .option-content {
  border-color: var(--secondary-color);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.entrega-option.selected .option-content {
  border-color: var(--secondary-color);
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(20, 184, 166, 0.05));
  box-shadow: var(--shadow-lg), 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.option-icon {
  font-size: 2.5rem;
  color: var(--text-tertiary);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.entrega-option.selected .option-icon {
  color: var(--secondary-color);
  animation: bounce 0.6s ease-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.option-details {
  flex: 1;
}

.option-details h3 {
  color: var(--text-primary);
  font-size: var(--font-lg);
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-semibold);
}

.option-details > p {
  color: var(--text-secondary);
  font-size: var(--font-sm);
  margin-bottom: var(--spacing-md);
}

.option-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-full);
  font-size: var(--font-xs);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.info-badge.success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success-color);
}

.info-badge i {
  font-size: 0.85em;
}

.tienda-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-sm);
  color: var(--text-primary);
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tienda-info i {
  color: var(--secondary-color);
}

.option-check {
  font-size: 1.5rem;
  color: var(--border-color);
  transition: all var(--transition-normal);
  flex-shrink: 0;
}

.entrega-option.selected .option-check {
  color: var(--secondary-color);
  animation: scaleIn 0.3s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Tienda recojo en confirmación */
.tienda-recojo {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.05), rgba(20, 184, 166, 0.05));
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--primary-color);
}

.recojo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  border-radius: var(--border-radius-lg);
  flex-shrink: 0;
}

.recojo-icon i {
  font-size: 2rem;
  color: white;
}

.recojo-info {
  flex: 1;
}

.recojo-info p {
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
}

.recojo-info p i {
  color: var(--primary-color);
  width: 20px;
  text-align: center;
}

.recojo-info .tienda-nombre {
  font-size: var(--font-lg);
  color: var(--text-primary);
  font-weight: var(--font-bold);
  margin-bottom: var(--spacing-md);
}

.recojo-info .horario {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--border-color);
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.recojo-info .horario i {
  color: var(--secondary-color);
}

.tienda-recojo .horario i {
  color: var(--secondary-color);
}

/* Responsive */
@media (max-width: 1024px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .steps-indicator {
    flex-wrap: wrap;
  }

  .step-line {
    display: none;
  }

  .checkout-form,
  .order-summary {
    padding: var(--spacing-xl);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .payment-icons-grid {
    gap: var(--spacing-md);
    justify-content: center;
  }

  .payment-icon-card {
    width: 70px;
    height: 70px;
  }

  .qr-payment-section {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .qr-code-placeholder {
    width: 180px;
    height: 180px;
    margin: 0 auto;
  }

  .card-form-fields .form-row {
    flex-direction: column;
  }

  .security-info {
    flex-direction: column;
  }

  .payment-form {
    padding: 0;
  }

  .payment-icon-card.selected .selected-indicator {
    top: -6px;
    right: -6px;
    font-size: 1.2rem;
  }

  .entrega-options {
    gap: var(--spacing-md);
  }

  .option-icon {
    font-size: 2rem;
  }
}

/* Estilos para la nueva sección de información de pedido */
.order-info-section {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-3xl);
  margin-bottom: var(--spacing-2xl);
  border: 2px solid var(--border-light);
  box-shadow: var(--shadow-lg);
}

.order-info-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.order-info-header i {
  font-size: var(--font-3xl);
  color: var(--secondary-color);
  background: rgba(20, 184, 166, 0.1);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-full);
}

.order-info-header h3 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
}

.order-description {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-base);
}

.order-info-content {
  display: grid;
  gap: var(--spacing-xl);
}

.info-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  border-left: 4px solid var(--secondary-color);
}

.info-icon {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  background: var(--secondary-color);
  border-radius: var(--border-radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-xl);
}

.info-text h4 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.info-text p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .order-info-section {
    padding: var(--spacing-xl);
  }
  
  .info-card {
    padding: var(--spacing-lg);
  }
  
  .info-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-lg);
  }
}

/* Estilos para la nueva sección interactiva de cuentas de pago */
.payment-info-box {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05), rgba(160, 82, 45, 0.05));
  border: 2px solid rgba(139, 69, 19, 0.2);
  border-radius: var(--border-radius-2xl);
  padding: var(--spacing-2xl);
  margin: var(--spacing-2xl) 0;
  box-shadow: var(--shadow-lg);
}

.payment-info-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid rgba(139, 69, 19, 0.1);
}

.payment-info-header i {
  font-size: 3rem;
  color: var(--secondary-color);
  margin-bottom: var(--spacing-md);
  background: rgba(139, 69, 19, 0.1);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-full);
}

.payment-info-header h3 {
  font-size: var(--font-2xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
}

.payment-info-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-base);
}

/* Selector de métodos de pago */
.payment-methods-selector {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  justify-content: center;
}

.payment-method-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: white;
  border: 3px solid transparent;
  border-radius: var(--border-radius-xl);
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  position: relative;
  min-width: 120px;
  text-align: center;
}

.payment-method-option:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
  border-color: var(--secondary-color);
}

.payment-method-option.active {
  border-color: var(--secondary-color);
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(160, 82, 45, 0.1));
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl), 0 0 20px rgba(139, 69, 19, 0.2);
}

.method-logo {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-full);
  padding: var(--spacing-sm);
  transition: all var(--transition-normal);
}

.payment-method-option.active .method-logo {
  background: rgba(139, 69, 19, 0.2);
  transform: scale(1.1);
}

.method-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.method-name {
  font-size: var(--font-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.arrow-icon {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  transition: all var(--transition-normal);
}

.arrow-icon.rotated {
  transform: rotate(180deg);
  color: var(--secondary-color);
}

/* Contenedor de detalles */
.payment-details-container {
  margin-top: var(--spacing-xl);
}

.payment-detail-card {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  border-left: 5px solid var(--secondary-color);
}

.yape-detail {
  border-left-color: #722F85;
}

.plin-detail {
  border-left-color: #00A0DF;
}

.bcp-detail {
  border-left-color: #003D6B;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-light);
}

.detail-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm);
}

.detail-header h4 {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.detail-header p {
  color: var(--text-secondary);
  margin: 0;
  font-size: var(--font-sm);
}

.detail-content {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
}

.qr-container-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.qr-image-large {
  width: 150px;
  height: 150px;
  object-fit: contain;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
}

.qr-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.bank-info-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
}

.info-item.highlight {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1), rgba(160, 82, 45, 0.1));
  border: 2px solid rgba(139, 69, 19, 0.2);
}

.info-label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.info-value {
  font-size: var(--font-lg);
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  font-weight: var(--font-bold);
  letter-spacing: 1px;
}

.btn-copy-modern {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.btn-copy-modern:hover {
  background: var(--secondary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-copy-modern i {
  font-size: var(--font-sm);
}

/* Animaciones */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive para la nueva sección interactiva */
@media (max-width: 768px) {
  .payment-methods-selector {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: center;
  }
  
  .payment-method-option {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    max-width: 300px;
    padding: var(--spacing-md);
  }
  
  .method-logo {
    width: 50px;
    height: 50px;
  }
  
  .detail-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  .qr-container-large {
    margin: 0 auto;
  }
  
  .qr-image-large {
    width: 120px;
    height: 120px;
  }
  
  .info-value-group {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .btn-copy-modern {
    align-self: center;
  }
}

/* Estilos para campos obligatorios */
.document-upload-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-lg);
}

.document-upload-label.required {
  color: var(--danger-color);
}

.required-indicator {
  background: var(--danger-bg);
  color: var(--danger-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  border: 1px solid var(--danger-color);
}
</style>
