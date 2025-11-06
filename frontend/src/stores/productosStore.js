import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';
import { useErrorStore } from './errorStore';
import { useCache } from '../composables/useCache';
import { getApiBase } from '../config/api';

const API_URL = getApiBase();

export const useProductosStore = defineStore('productos', () => {
    const productos = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const errorStore = useErrorStore();
    const cache = useCache('productos', 300000); // 5 minutos de cache

    // Getters computados
    const productosActivos = computed(() =>
        productos.value.filter(p => p.estado === true)
    );

    const productosPorCategoria = computed(() => {
        const categorias = {};
        productos.value.forEach(p => {
            if (!categorias[p.categoria]) {
                categorias[p.categoria] = [];
            }
            categorias[p.categoria].push(p);
        });
        return categorias;
    });

    // Obtener todos los productos
    const fetchProductos = async(filters = {}) => {
        loading.value = true;
        error.value = null;

        try {
            const queryParams = new URLSearchParams();
            if (filters.categoria) queryParams.append('categoria', filters.categoria);
            if (filters.subcategoria) queryParams.append('subcategoria', filters.subcategoria);
            if (filters.estado !== undefined) queryParams.append('estado', filters.estado);
            if (filters.search) queryParams.append('search', filters.search);

            const url = `${API_URL}/productos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                productos.value = data.productos;
                return data.productos;
            } else {
                throw new Error(data.error || 'Error al cargar productos');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error fetching productos:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Obtener un producto por ID
    const fetchProductoById = async(id) => {
        loading.value = true;
        error.value = null;

        try {
            // Verificar cache primero
            const cachedProduct = cache.get(`producto_${id}`);
            if (cachedProduct) {
                return cachedProduct;
            }

            const response = await fetch(`${API_URL}/productos/${id}`);
            const data = await response.json();

            if (data.success) {
                // Guardar en cache
                cache.set(`producto_${id}`, data.producto);
                return data.producto;
            } else {
                throw new Error(data.error || 'Producto no encontrado');
            }
        } catch (err) {
            error.value = err.message;
            errorStore.addError({
                message: `Error al cargar el producto: ${err.message}`,
                type: 'error'
            });
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Crear nuevo producto
    const createProducto = async(productoData) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            // Filtrar solo los campos permitidos y excluir los campos de fecha
            const datosPermitidos = {
                nombre: productoData.nombre ? productoData.nombre.trim() : '',
                descripcion: productoData.descripcion ? productoData.descripcion.trim() : null,
                precio_base: parseFloat(productoData.precio_base) || 0,
                categoria: productoData.categoria,
                subcategoria: productoData.subcategoria || null,
                stock: parseInt(productoData.stock) || 0,
                estado: Boolean(productoData.estado),
                descuento: parseFloat(productoData.descuento) || 0,
                imagen_principal: productoData.imagen_principal ? productoData.imagen_principal.trim() : null,
                imagenes: Array.isArray(productoData.imagenes) ? productoData.imagenes.filter(img => img && img.trim()) : []
            };

            const response = await fetch(`${API_URL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(datosPermitidos)
            });

            const data = await response.json();

            if (data.success) {
                productos.value.unshift(data.producto);
                return data.producto;
            } else {
                throw new Error(data.error || 'Error al crear producto');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error creating producto:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Actualizar producto
    const updateProducto = async(id, productoData) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            // Filtrar solo los campos permitidos y excluir los campos de fecha
            const datosPermitidos = {
                nombre: productoData.nombre ? productoData.nombre.trim() : '',
                descripcion: productoData.descripcion ? productoData.descripcion.trim() : null,
                precio_base: parseFloat(productoData.precio_base) || 0,
                categoria: productoData.categoria,
                subcategoria: productoData.subcategoria || null,
                stock: parseInt(productoData.stock) || 0,
                estado: Boolean(productoData.estado),
                descuento: parseFloat(productoData.descuento) || 0,
                imagen_principal: productoData.imagen_principal ? productoData.imagen_principal.trim() : null,
                imagenes: Array.isArray(productoData.imagenes) ? productoData.imagenes.filter(img => img && img.trim()) : []
            };

            const response = await fetch(`${API_URL}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(datosPermitidos)
            });

            const data = await response.json();

            if (data.success) {
                const index = productos.value.findIndex(p => p.id === id);
                if (index !== -1) {
                    productos.value[index] = data.producto;
                }
                return data.producto;
            } else {
                throw new Error(data.error || 'Error al actualizar producto');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error updating producto:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Eliminar producto
    const deleteProducto = async(id) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${API_URL}/productos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                productos.value = productos.value.filter(p => p.id !== id);
                return true;
            } else {
                throw new Error(data.error || 'Error al eliminar producto');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error deleting producto:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Toggle estado del producto
    const toggleEstadoProducto = async(id) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${API_URL}/productos/${id}/toggle-estado`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                const index = productos.value.findIndex(p => p.id === id);
                if (index !== -1) {
                    productos.value[index] = data.producto;
                }
                return data.producto;
            } else {
                throw new Error(data.error || 'Error al cambiar estado');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error toggling estado:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Obtener categorías
    const fetchCategorias = async() => {
        try {
            const response = await fetch(`${API_URL}/productos/categorias`);
            const data = await response.json();

            if (data.success) {
                return data.categorias;
            }
            return [];
        } catch (err) {
            console.error('Error fetching categorias:', err);
            return [];
        }
    };

    // Obtener subcategorías
    const fetchSubcategorias = async(categoria = null) => {
        try {
            const url = categoria ?
                `${API_URL}/productos/subcategorias?categoria=${categoria}` :
                `${API_URL}/productos/subcategorias`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                return data.subcategorias;
            }
            return [];
        } catch (err) {
            console.error('Error fetching subcategorias:', err);
            return [];
        }
    };

    return {
        productos,
        loading,
        error,
        productosActivos,
        productosPorCategoria,
        fetchProductos,
        fetchProductoById,
        createProducto,
        updateProducto,
        deleteProducto,
        toggleEstadoProducto,
        fetchCategorias,
        fetchSubcategorias
    };
});