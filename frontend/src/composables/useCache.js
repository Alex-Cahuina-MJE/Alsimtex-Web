import { ref } from 'vue';

export function useCache(key, ttl = 300000) { // ttl por defecto: 5 minutos
    const cache = ref(new Map());

    const get = (id) => {
        const item = cache.value.get(id);
        if (!item) return null;

        if (Date.now() - item.timestamp > ttl) {
            cache.value.delete(id);
            return null;
        }

        return item.data;
    };

    const set = (id, data) => {
        cache.value.set(id, {
            data,
            timestamp: Date.now()
        });
    };

    const clear = () => {
        cache.value.clear();
    };

    const clearExpired = () => {
        for (const [id, item] of cache.value.entries()) {
            if (Date.now() - item.timestamp > ttl) {
                cache.value.delete(id);
            }
        }
    };

    // Limpiar cache expirado cada minuto
    setInterval(clearExpired, 60000);

    return {
        get,
        set,
        clear,
        clearExpired
    };
}