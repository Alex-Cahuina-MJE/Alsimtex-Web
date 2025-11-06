import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const CART_STORAGE_KEY = 'alsimtex_cart'

export const useCartStore = defineStore('cart', () => {
    const items = ref([])
    const isCartOpen = ref(false)

    // Cargar carrito desde localStorage al inicializar
    const loadCartFromStorage = () => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY)
            if (stored) {
                const parsedCart = JSON.parse(stored)
                if (Array.isArray(parsedCart)) {
                    items.value = parsedCart.map(item => ({
                        ...item,
                        cartItemId: item.cartItemId || Date.now() + Math.random()
                    }))
                }
            }
        } catch (error) {
            console.warn('Error loading cart from localStorage:', error)
            items.value = []
        }
    }

    // Guardar carrito en localStorage
    const saveCartToStorage = () => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
        } catch (error) {
            console.warn('Error saving cart to localStorage:', error)
        }
    }

    // Inicializar carga desde storage
    loadCartFromStorage()

    // Watcher para guardar automáticamente en localStorage
    watch(items, saveCartToStorage, { deep: true })

    // Definir niveles de descuento por cantidad
    const descuentosPorCantidad = [
        { min: 50, descuento: 0.15 }, // 15% de descuento para 50+ unidades
        { min: 25, descuento: 0.10 }, // 10% de descuento para 25-49 unidades
        { min: 10, descuento: 0.05 }, // 5% de descuento para 10-24 unidades
    ]

    // Obtener el descuento aplicable según la cantidad
    const calcularDescuento = (cantidad) => {
        if (!cantidad || cantidad < 1) return 0
        const nivel = descuentosPorCantidad.find(nivel => cantidad >= nivel.min)
        return nivel ? nivel.descuento : 0
    }

    const totalItems = computed(() => {
        return items.value.reduce((total, item) => total + item.cantidad, 0)
    })

    const subtotalSinDescuento = computed(() => {
        return items.value.reduce((total, item) => total + item.precioTotal, 0)
    })

    const descuentoTotal = computed(() => {
        return items.value.reduce((total, item) => {
            const descuento = calcularDescuento(item.cantidad)
            return total + (item.precioTotal * descuento)
        }, 0)
    })

    const subtotal = computed(() => {
        return subtotalSinDescuento.value - descuentoTotal.value
    })

    const total = computed(() => {
        return subtotal.value
    })

    const obtenerDescuentoItem = (cartItemId) => {
        const item = items.value.find(item => item.cartItemId === cartItemId)
        if (!item) return null

        const descuento = calcularDescuento(item.cantidad)
        return {
            porcentaje: descuento * 100,
            cantidad: item.precioTotal * descuento,
            precioFinal: item.precioTotal * (1 - descuento)
        }
    }

    function addToCart(products) {
        if (!Array.isArray(products) || products.length === 0) {
            console.warn('addToCart: products debe ser un array no vacío')
            return
        }

        products.forEach(product => {
            console.log('🛒 CartStore - Agregando producto:', product.producto?.nombre || product.nombre)
            
            // Para el nuevo sistema simplificado, convertir formato si es necesario
            let normalizedProduct
            if (product.producto) {
                // Formato antiguo - mantener compatibilidad
                normalizedProduct = product
            } else {
                // Formato nuevo simplificado
                normalizedProduct = {
                    producto: {
                        id: product.id,
                        nombre: product.nombre,
                        imagen_principal: product.imagen_principal,
                        descripcion: product.descripcion,
                        precio: product.precio_base,
                        stock: product.stock
                    },
                    tipo: product.categoria,
                    tamano: product.subcategoria,
                    cantidad: product.cantidad,
                    precio: product.precio_base,
                    precioTotal: (product.precio_base || 0) * (product.cantidad || 1),
                    detalles: { notas: '' }
                }
            }
            
            // Validar producto normalizado
            if (!normalizedProduct.producto || !normalizedProduct.producto.id) {
                console.warn('addToCart: producto inválido', normalizedProduct)
                return
            }

            if (!normalizedProduct.cantidad || normalizedProduct.cantidad < 1) {
                console.warn('addToCart: cantidad inválida', normalizedProduct)
                return
            }

            // Simplificado: solo comparar por ID, tipo y tamaño
            const existingItem = items.value.find(item =>
                item.producto.id === normalizedProduct.producto.id &&
                item.tipo === normalizedProduct.tipo &&
                item.tamano === normalizedProduct.tamano
            )

            if (existingItem) {
                console.log('🛒 Item existente encontrado, sumando cantidad')
                existingItem.cantidad += normalizedProduct.cantidad
                existingItem.precioTotal += normalizedProduct.precioTotal || 0
            } else {
                console.log('🛒 Nuevo item agregado al carrito')
                items.value.push({
                    ...normalizedProduct,
                    cartItemId: Date.now() + Math.random(),
                    precioTotal: normalizedProduct.precioTotal || 0
                })
            }
        })
        isCartOpen.value = true
    }

    function removeFromCart(cartItemId) {
        if (!cartItemId) {
            console.warn('removeFromCart: cartItemId requerido')
            return
        }

        const index = items.value.findIndex(item => item.cartItemId === cartItemId)
        if (index !== -1) {
            items.value.splice(index, 1)
        }
    }

    function updateQuantity(cartItemId, newQuantity) {
        if (!cartItemId) {
            console.warn('updateQuantity: cartItemId requerido')
            return
        }

        if (newQuantity < 1) {
            console.warn('updateQuantity: cantidad debe ser al menos 1')
            return
        }

        const item = items.value.find(item => item.cartItemId === cartItemId)
        if (item) {
            // Validar que la nueva cantidad no exceda el stock disponible
            const stockDisponible = item.producto?.stock || 0
            if (newQuantity > stockDisponible) {
                console.warn(`updateQuantity: cantidad ${newQuantity} excede el stock disponible ${stockDisponible}`)
                // Limitar la cantidad al stock disponible máximo
                newQuantity = stockDisponible
                if (newQuantity < 1) {
                    console.warn('updateQuantity: stock insuficiente, no se puede actualizar')
                    return
                }
            }

            const precioUnitarioOriginal = item.precioTotal / item.cantidad
            item.cantidad = newQuantity
            item.precioTotal = precioUnitarioOriginal * newQuantity
        }
    }

    function updateItemDetails(cartItemId, newDetails) {
        if (!cartItemId) {
            console.warn('updateItemDetails: cartItemId requerido')
            return
        }

        if (!newDetails || typeof newDetails !== 'object') {
            console.warn('updateItemDetails: newDetails debe ser un objeto')
            return
        }

        const item = items.value.find(item => item.cartItemId === cartItemId)
        if (item) {
            if (newDetails.tipo) item.tipo = newDetails.tipo
            if (newDetails.tamano !== undefined) item.tamano = newDetails.tamano
            if (newDetails.detalles) {
                item.detalles = {...(item.detalles || {}), ...newDetails.detalles }
            }
        }
    }

    function clearCart() {
        items.value = []
    }

    function toggleCart() {
        isCartOpen.value = !isCartOpen.value
    }

    // Función para validar el carrito antes del checkout
    function validateCart() {
        const errors = []

        if (items.value.length === 0) {
            errors.push('El carrito está vacío')
            return { valid: false, errors }
        }

        items.value.forEach((item, index) => {
            if (!item.producto || !item.producto.id) {
                errors.push(`Producto ${index + 1}: información del producto incompleta`)
            }
            if (!item.cantidad || item.cantidad < 1) {
                errors.push(`Producto ${index + 1}: cantidad inválida`)
            }
            if (!item.precioTotal || item.precioTotal < 0) {
                errors.push(`Producto ${index + 1}: precio inválido`)
            }
        })

        return {
            valid: errors.length === 0,
            errors
        }
    }

    return {
        items,
        isCartOpen,
        totalItems,
        subtotal,
        total,
        subtotalSinDescuento,
        descuentoTotal,
        obtenerDescuentoItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemDetails,
        clearCart,
        toggleCart,
        validateCart
    }
})