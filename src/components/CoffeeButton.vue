<template>
  <button 
    @click="buyMeACoffee" 
    class="coffee-button"
    :class="variant"
    :title="title"
  >
    ☕ {{ text }}
  </button>
</template>

<script setup>
import analyticsService from '../services/logsnag.js'
import { getAnalyticsUserId } from '../utils/analytics.js'
import { useRoute } from 'vue-router'

const route = useRoute()

defineProps({
  text: {
    type: String,
    default: 'Buy me a coffee'
  },
  title: {
    type: String,
    default: 'Buy me a coffee'
  },
  variant: {
    type: String,
    default: 'default'
  }
})

function buyMeACoffee() {
  try {
    analyticsService.trackMetric('coffee_button_clicked', 1, {
      user_id: getAnalyticsUserId(),
      page: route.path
    })
    analyticsService.track('coffee_button_clicked', {
      description: 'User clicked Buy me a coffee button',
      tags: { 
        user_id: getAnalyticsUserId(),
        page: route.path 
      },
      icon: '☕'
    })
  } catch (analyticsError) {
    console.error('Analytics tracking error:', analyticsError)
  }

  window.open('https://coff.ee/aptashenko', '_blank')
}
</script>

<style scoped>
.coffee-button {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.2);
}

.coffee-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.coffee-button:active {
  transform: translateY(0);
}

.coffee-button.large {
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: 8px;
}

.coffee-button.small {
  padding: 6px 12px;
  font-size: 0.8rem;
  border-radius: 4px;
}
</style> 