<template>
  <button
    @click="goBack"
    class="back-button"
    :class="{ 'back-button--small': small }"
    type="button"
  >
    <span class="back-text">{{ text }}</span>
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// Props
const props = defineProps({
  text: {
    type: String,
    default: 'Back'
  },
  small: {
    type: Boolean,
    default: false
  },
  customAction: {
    type: Function,
    default: null
  }
})

// Methods
function goBack() {
  if (props.customAction) {
    props.customAction()
  } else {
    router.back()
  }
}
</script>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #667eea;
  color: white !important;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-family: inherit;
}

.back-button:hover {
  background: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.back-button:active {
  transform: translateY(0);
}

.back-button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.back-button--small {
  padding: 8px 12px;
  font-size: 0.9rem;
}

.back-icon {
  flex-shrink: 0;
}

.back-text {
  white-space: nowrap;
  color: #f5f7fb;
}

/* Responsive */
@media (max-width: 768px) {
  .back-button {
    padding: 10px 14px;
    font-size: 0.9rem;
  }

  .back-button--small {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
</style>
