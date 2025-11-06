//notifications.js
import { ref } from 'vue';

const notifications = ref([]);

export function useNotifications() {
    const addNotification = (message, type = 'info', duration = 5000) => {
        const id = Date.now();
        const notification = {
            id,
            message,
            type,
            timestamp: new Date()
        };

        notifications.value.push(notification);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    };

    const removeNotification = (id) => {
        const index = notifications.value.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications.value.splice(index, 1);
        }
    };

    const clearNotifications = () => {
        notifications.value = [];
    };

    return {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications
    };
}