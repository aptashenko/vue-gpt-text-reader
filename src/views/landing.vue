<template>
  <div class="landing-wrapper">
    <!-- Hero Section -->
    <section class="hero">
      <h1 class="hero-title">Read. Understand. Remember.</h1>
      <p class="hero-subtitle">Learn languages by reading texts with AI-powered word translation and smart vocabulary tracking.</p>
      <button class="hero-cta" @click="startLearning">Start learning →</button>
    </section>

    <!-- How it works -->
    <section class="flow">
      <h2 class="flow-title">How it works</h2>
      <div class="flow-steps">
        <div class="flow-step">
          <div class="flow-icon">🌐</div>
          <p>Choose your native & target language</p>
        </div>
        <div class="flow-step">
          <div class="flow-icon">📄</div>
          <p>Start reading short, adapted texts</p>
        </div>
        <div class="flow-step">
          <div class="flow-icon">🧠</div>
          <p>Click any word to see the meaning in context</p>
        </div>
        <div class="flow-step">
          <div class="flow-icon">📥</div>
          <p>Save difficult words to your personal dictionary</p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <h2 class="features-title">Why learners love it</h2>
      <div class="features-grid">
        <Feature icon="⚡️" text="Instant AI-powered translations" />
        <Feature icon="🗂️" text="Your personal smart dictionary" />
        <Feature icon="🎯" text="Focus on context, not just words" />
        <Feature icon="📈" text="Track your learning progress" />
      </div>
    </section>

    <!-- Final CTA -->
    <section class="cta-final">
      <h2 class="cta-title">No grammar drills. Just real language in real context.</h2>
      <button class="hero-cta" @click="startLearning">Start now</button>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>Created with ❤️ for language lovers</p>
      <button class="coffee-button" @click="buyMeACoffee">☕ Buy me a coffee</button>
    </footer>
  </div>
</template>

<script setup>
import {useRouter} from 'vue-router'

const router = useRouter()

function startLearning() {
  router.push('/app')
}

function buyMeACoffee() {
  window.open('https://coff.ee/aptashenko', '_blank')
}
</script>

<script>
export default {
  components: {
    Feature: {
      props: ['icon', 'text'],
      template: `
        <div class="feature-item">
          <div class="feature-icon">{{ icon }}</div>
          <p>{{ text }}</p>
        </div>
      `
    }
  }
}
</script>

<style scoped>
.landing-wrapper {
  max-width: 960px;
  margin: 0 auto;
  padding: 60px 20px;
  font-family: system-ui, sans-serif;
  color: #1a202c;
}

/* Hero */
.hero {
  text-align: center;
  margin-bottom: 60px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 32px;
}

.hero-cta {
  background: #667eea;
  color: white;
  font-size: 1.1rem;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: 0.2s ease;
}

.hero-cta:hover {
  background: #5a67d8;
}

/* How it works */
.flow-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 30px;
}

.flow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-around;
}

.flow-step {
  flex: 1 1 200px;
  text-align: center;
  padding: 20px;
}

.flow-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

/* Features */
.features-title {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 60px 0 30px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.feature-item {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.feature-icon {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: #667eea;
}

/* CTA Final */
.cta-final {
  margin-top: 60px;
  text-align: center;
}

.cta-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
}

/* Footer */
.footer {
  text-align: center;
  margin-top: 60px;
  color: #718096;
}

.coffee-button {
  background: #8b4513;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
}
</style>
