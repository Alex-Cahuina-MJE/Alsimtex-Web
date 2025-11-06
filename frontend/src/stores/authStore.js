import { ref } from 'vue';
import { defineStore } from 'pinia';
import { getApiBase } from '../config/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const token = ref(null);

    // Cargar estado inicial desde localStorage
    if (localStorage.getItem('user')) {
        user.value = JSON.parse(localStorage.getItem('user'));
        token.value = localStorage.getItem('token');
    }

    const login = async(email, password) => {
        try {
            const response = await fetch(`${getApiBase()}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            user.value = data.user;
            token.value = data.token;

            // Guardar en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async(userData) => {
        try {
            const response = await fetch(`${getApiBase()}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            user.value = data.user;
            token.value = data.token;

            // Guardar en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        user.value = null;
        token.value = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const isAuthenticated = () => {
        return !!token.value;
    };

    const isAdmin = () => {
        if (!user.value) return false;
        return user.value.rol === 'admin';
    };

    return {
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
    };
});