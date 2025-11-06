import { ref } from 'vue'

const showModal = ref(false)
const modalConfig = ref({
  title: 'Confirmación',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'warning'
})

let resolvePromise = null

export function useConfirm() {
  const confirm = ({ title, message, confirmText, cancelText, type }) => {
    return new Promise((resolve) => {
      modalConfig.value = {
        title: title || 'Confirmación',
        message: message || '¿Estás seguro?',
        confirmText: confirmText || 'Confirmar',
        cancelText: cancelText || 'Cancelar',
        type: type || 'warning'
      }
      showModal.value = true
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
    showModal.value = false
  }

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
    showModal.value = false
  }

  return {
    showModal,
    modalConfig,
    confirm,
    handleConfirm,
    handleCancel
  }
}
