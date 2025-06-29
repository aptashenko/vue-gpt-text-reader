<template>
  <div class="landing-page">
    <div class="container">
      <!-- Header -->
      <header class="header">
        <h1 class="title">{{ $t('landing.title') }}</h1>
        <p class="subtitle">{{ $t('landing.subtitle') }}</p>
      </header>

      <!-- Benefits Section -->
      <section class="benefits">
        <h2 class="benefits-title">{{ $t('landing.benefits.title') }}</h2>
        <div class="benefits-grid">
          <div class="benefit-item">
            <div class="benefit-icon">📚</div>
            <h3>{{ $t('landing.benefits.simple') }}</h3>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">📖</div>
            <h3>{{ $t('landing.benefits.dictionary') }}</h3>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">❓</div>
            <h3>{{ $t('landing.benefits.questions') }}</h3>
          </div>
          <div class="benefit-item">
            <div class="benefit-icon">🤖</div>
            <h3>{{ $t('landing.benefits.ai') }}</h3>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta-section">
        <div class="cta-content">
          <h2 class="cta-title">{{ $t('landing.cta') }}</h2>
          <p class="cta-subtitle">{{ $t('landing.ctaSubtitle') }}</p>
          <button class="cta-button" @click="startLearning">
            {{ $t('landing.cta') }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

function startLearning() {
  router.push('/app')
}
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  max-width: 1200px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* Header */
.header {
  margin-bottom: 60px;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.25rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Benefits */
.benefits {
  margin-bottom: 60px;
}

.benefits-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 40px;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.benefit-item {
  padding: 30px 20px;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.benefit-item:hover {
  border-color: #667eea;
  background: #edf2f7;
  transform: translateY(-2px);
}

.benefit-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.benefit-item h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  line-height: 1.4;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: 0 -40px -60px -40px;
  padding: 60px 40px;
  border-radius: 0 0 20px 20px;
  color: white;
}

.cta-content {
  max-width: 500px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
}

.cta-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 30px;
}

.cta-button {
  background: white;
  color: #667eea;
  border: none;
  padding: 16px 40px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.cta-button:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 40px 20px;
  }

  .title {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .benefits-title {
    font-size: 1.5rem;
  }

  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .benefit-item {
    padding: 25px 15px;
  }

  .benefit-icon {
    font-size: 2.5rem;
  }

  .cta-section {
    margin: 0 -20px -40px -20px;
    padding: 40px 20px;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-button {
    padding: 14px 30px;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .landing-page {
    padding: 10px;
  }

  .container {
    padding: 30px 15px;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .cta-title {
    font-size: 1.6rem;
  }
}
</style> 