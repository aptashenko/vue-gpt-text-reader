<template>
  <button
    @click="handleLogout"
    :disabled="loading"
    class="logout-button"
    :class="{ 'loading': loading }"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-else class="logout-icon">🚪</span>
    {{ loading ? 'Logging out...' : text }}
  </button>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { logout } from '../utils/auth'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  text: {
    type: String,
    default: 'Logout'
  },
  variant: {
    type: String,
    default: 'default', // 'default', 'text', 'icon'
    validator: (value) => ['default', 'text', 'icon'].includes(value)
  },
  redirectToLogin: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['logout-success', 'logout-error'])

// Local state
const loading = ref(false)
const router = useRouter()

// Methods
async function handleLogout() {
  loading.value = true
  
  try {
    const result = await logout(props.redirectToLogin)
    
    if (result.success) {
      emit('logout-success')
      
      // Force navigation if redirect is requested
      if (props.redirectToLogin) {
        // Use nextTick to ensure state updates are processed
        await nextTick()
        router.push('/login')
      }
    } else {
      emit('logout-error', result.error)
      console.error('Logout failed:', result.error)
    }
  } catch (error) {
    emit('logout-error', error.message)
    console.error('Logout error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.logout-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.logout-button:hover:not(:disabled) {
  background: #c53030;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.logout-button:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.logout-button.loading {
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.logout-icon {
  font-size: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Variant styles */
.logout-button.text {
  background: transparent;
  color: #e53e3e;
  padding: 4px 8px;
}

.logout-button.text:hover:not(:disabled) {
  background: #fed7d7;
  color: #c53030;
  transform: none;
  box-shadow: none;
}

.logout-button.icon {
  padding: 8px;
  min-width: 36px;
  justify-content: center;
}

.logout-button.icon .logout-icon {
  font-size: 1.2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .logout-button {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .logout-button.icon {
    padding: 6px;
    min-width: 32px;
  }
}
</style> 