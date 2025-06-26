<template>
  <div class="loading-overlay" v-if="show">
    <div class="loading-spinner">
      <div class="emoji">🧘‍♀️</div>
      <div class="spinner"></div>
      <p class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Loading'
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
}

.loading-spinner {
  text-align: center;
  background: rgba(255, 250, 246, 0.85);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  animation: popIn 0.4s ease-out;
}

.emoji {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #f0e6dd;
  border-top: 6px solid #d08a6e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.message {
  color: #5a4a42;
  font-size: 1.1rem;
  position: relative;
}

.message::after {
  content: '';
  display: inline-block;
  width: 1.2em;
  text-align: left;
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes dots {
  0%   { content: ''; }
  25%  { content: '.'; }
  50%  { content: '..'; }
  75%  { content: '...'; }
  100% { content: ''; }
}

</style>