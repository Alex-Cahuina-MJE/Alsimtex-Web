import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useErrorStore = defineStore('error', () => {
    const errors = ref([]);
    const hasErrors = ref(false);

    const addError = (error) => {
        const errorObj = {
            id: Date.now(),
            message: error.message || 'Error desconocido',
            type: error.type || 'error',
            timestamp: new Date()
        };
        errors.value.push(errorObj);
        hasErrors.value = true;

        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            removeError(errorObj.id);
        }, 5000);
    };

    const removeError = (id) => {
        errors.value = errors.value.filter(e => e.id !== id);
        hasErrors.value = errors.value.length > 0;
    };

    const clearErrors = () => {
        errors.value = [];
        hasErrors.value = false;
    };

    return {
        errors,
        hasErrors,
        addError,
        removeError,
        clearErrors
    };
});