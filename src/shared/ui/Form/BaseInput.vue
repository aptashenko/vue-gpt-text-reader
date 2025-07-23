<template>
  <div class="form-group" :class="{disabled}">
    <label v-if="label" :for="name" class="form-label">{{ label }}</label>

    <input
        :id="name"
        :name="name"
        :type="type"
        v-model="model"
        :disabled="disabled"
        :placeholder="placeholder"
        :class="['form-input', { error: localError }]"
        @focus="onFocus"
        @blur="$emit('blur')"
    />

    <span v-if="localError" class="error-message">{{ localError }}</span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  name: String,
  label: String,
  placeholder: String,
  disabled: Boolean,
  type: {
    type: String,
    default: 'text',
  },
  error: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['blur', 'focus'])

const model = defineModel() // автоматически работает с v-model
const localError = ref(props.error)

watch(() => props.error, (val) => {
  localError.value = val
})

function onFocus(e) {
  localError.value = ''
  emit('focus', e)
}
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.disabled input {
  opacity: 0.3;
}

.form-label {
  text-align: start;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  color: #2d3748;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #e53e3e;
}

.form-input.error:focus {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  text-align: start;
}
</style>
