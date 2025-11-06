import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './authStore';
import { getApiBase } from '../config/api';

const API_URL = getApiBase();

export const useUsuariosStore = defineStore('usuarios', () => {
    const usuarios = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const estadisticas = ref(null);

    // Obtener todos los usuarios
    const fetchUsuarios = async (filters = {}) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;
        
        try {
            const queryParams = new URLSearchParams();
            if (filters.rol) queryParams.append('rol', filters.rol);
            if (filters.search) queryParams.append('search', filters.search);

            const url = `${API_URL}/usuarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            });
            
            const data = await response.json();

            if (data.success) {
                usuarios.value = data.usuarios;
                return data.usuarios;
            } else {
                throw new Error(data.error || 'Error al cargar usuarios');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error fetching usuarios:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Obtener estadísticas de usuarios
    const fetchEstadisticas = async () => {
        const authStore = useAuthStore();
        
        try {
            const response = await fetch(`${API_URL}/usuarios/estadisticas`, {
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            });
            
            const data = await response.json();

            if (data.success) {
                estadisticas.value = data.estadisticas;
                return data.estadisticas;
            }
        } catch (err) {
            console.error('Error fetching estadísticas:', err);
        }
    };

    // Crear nuevo usuario
    const createUsuario = async (usuarioData) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(usuarioData)
            });

            const data = await response.json();

            if (data.success) {
                usuarios.value.unshift(data.usuario);
                return data.usuario;
            } else {
                throw new Error(data.error || 'Error al crear usuario');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error creating usuario:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Actualizar usuario
    const updateUsuario = async (id, usuarioData) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify(usuarioData)
            });

            const data = await response.json();

            if (data.success) {
                const index = usuarios.value.findIndex(u => u.id === id);
                if (index !== -1) {
                    usuarios.value[index] = data.usuario;
                }
                return data.usuario;
            } else {
                throw new Error(data.error || 'Error al actualizar usuario');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error updating usuario:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Eliminar usuario
    const deleteUsuario = async (id) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authStore.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                usuarios.value = usuarios.value.filter(u => u.id !== id);
                return true;
            } else {
                throw new Error(data.error || 'Error al eliminar usuario');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error deleting usuario:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Cambiar rol de usuario
    const cambiarRol = async (id, nuevoRol) => {
        const authStore = useAuthStore();
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${API_URL}/usuarios/${id}/cambiar-rol`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authStore.token}`
                },
                body: JSON.stringify({ rol: nuevoRol })
            });

            const data = await response.json();

            if (data.success) {
                const index = usuarios.value.findIndex(u => u.id === id);
                if (index !== -1) {
                    usuarios.value[index] = data.usuario;
                }
                return data.usuario;
            } else {
                throw new Error(data.error || 'Error al cambiar rol');
            }
        } catch (err) {
            error.value = err.message;
            console.error('Error changing rol:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        usuarios,
        loading,
        error,
        estadisticas,
        fetchUsuarios,
        fetchEstadisticas,
        createUsuario,
        updateUsuario,
        deleteUsuario,
        cambiarRol
    };
});
