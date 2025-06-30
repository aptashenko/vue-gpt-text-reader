// Скрипт для генерации тестовых данных аналитики
// Выполните этот код в консоли браузера на странице аналитики

console.log('Generating test analytics data...')

// Получаем сервис LogSnag
const logsnag = window.logsnag || (() => {
  // Простая симуляция сервиса для тестирования
  return {
    trackMetric: async (metric, value, options) => {
      console.log(`Tracking metric: ${metric} = ${value}`, options)
      
      // Сохраняем в localStorage
      const storageKey = 'logsnag_analytics'
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}')
      
      const today = new Date().toISOString().split('T')[0]
      
      if (!existing[metric]) {
        existing[metric] = {}
      }
      
      if (!existing[metric][today]) {
        existing[metric][today] = 0
      }
      
      existing[metric][today] += value
      
      // Сохраняем события
      if (!existing.events) {
        existing.events = []
      }
      
      existing.events.unshift({
        event: metric,
        timestamp: new Date().toISOString(),
        description: `Test ${metric}`,
        value: value
      })
      
      if (existing.events.length > 100) {
        existing.events = existing.events.slice(0, 100)
      }
      
      localStorage.setItem(storageKey, JSON.stringify(existing))
    }
  }
})()

// Генерируем тестовые данные
async function generateTestData() {
  const metrics = [
    { name: 'user_signup', value: 15, options: {} },
    { name: 'user_login', value: 45, options: {} },
    { name: 'text_read', value: 120, options: { language: 'en' } },
    { name: 'text_read', value: 80, options: { language: 'fr' } },
    { name: 'text_read', value: 60, options: { language: 'es' } },
    { name: 'text_completed', value: 95, options: {} },
    { name: 'word_added', value: 320, options: {} },
    { name: 'question_answered', value: 180, options: {} },
    { name: 'correct_answer', value: 150, options: {} },
    { name: 'feedback_submitted', value: 25, options: {} },
    { name: 'feedback_rating', value: 120, options: {} }
  ]
  
  for (const metric of metrics) {
    await logsnag.trackMetric(metric.name, metric.value, metric.options)
    await new Promise(resolve => setTimeout(resolve, 100)) // Небольшая задержка
  }
  
  console.log('✅ Test data generated! Refresh the analytics page to see the results.')
}

// Запускаем генерацию
generateTestData() 