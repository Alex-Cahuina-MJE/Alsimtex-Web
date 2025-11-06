<!-- NotificationBar.vue -->
<template>
    <div class="notification-container" v-if="notifications.length > 0">
        <TransitionGroup name="notification">
            <div
                v-for="notification in notifications"
                :key="notification.id"
                :class="['notification', notification.type]"
                @click="removeNotification(notification.id)"
            >
                <div class="notification-content">
                    <i :class="getIcon(notification.type)"></i>
                    <span>{{ notification.message }}</span>
                </div>
                <button class="close-btn" @click.stop="removeNotification(notification.id)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<script setup>
import { useNotifications } from '../composables/useNotifications'

const { notifications, removeNotification } = useNotifications()

const getIcon = (type) => {
    switch(type) {
        case 'success':
            return 'fas fa-check-circle'
        case 'error':
            return 'fas fa-exclamation-circle'
        case 'warning':
            return 'fas fa-exclamation-triangle'
        default:
            return 'fas fa-info-circle'
    }
}
</script>

<style scoped>
.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 400px;
}

.notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification i {
    font-size: 1.2em;
}

.notification.success {
    background: #ecfdf5;
    border-left: 4px solid #10b981;
}

.notification.error {
    background: #fef2f2;
    border-left: 4px solid #ef4444;
}

.notification.warning {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
}

.notification.info {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
}

.close-btn {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: rgba(0, 0, 0, 0.1);
}

/* Transiciones */
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(30px);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>