<script setup>
import ConfirmModal from './ConfirmModal.vue'
import { useConfirm } from '../composables/useConfirm'

const { showModal, modalConfig, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <ConfirmModal
    v-model:show="showModal"
    :title="modalConfig.title"
    :message="modalConfig.message"
    :confirm-text="modalConfig.confirmText"
    :cancel-text="modalConfig.cancelText"
    :type="modalConfig.type"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
