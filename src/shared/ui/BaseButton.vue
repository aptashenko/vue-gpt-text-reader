<template>
  <button
      :type="type"
      :disabled="pending || disabled"
      :class="['base-button', variant, { pending }]"
      @click="handleClick"
  >
    <span v-if="pending" class="spinner"></span>
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' }, // primary | secondary | guest
  pending: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

function handleClick(e) {
  if (!props.pending) emit('click', e)
}
</script>

<style scoped>
.base-button {
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  width: 100%;
}

/* Primary (фиолетовая) */
.base-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.base-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

/* Secondary (светлая серая) */
.base-button.secondary {
  background: #f7fafc;
  color: #4a5568;
  border: 2px solid #e2e8f0;
}

.base-button.secondary:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

/* Guest (плоский стиль, нейтральный) */
.base-button.guest {
  background: transparent;
  border: 2px solid #cbd5e0;
  color: #4a5568;
}

.base-button.guest:hover:not(:disabled) {
  background: #f0f0f0;
  transform: translateY(-1px);
}

/* Общие состояния */
.base-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
