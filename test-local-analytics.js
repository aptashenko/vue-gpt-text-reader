// Тестовый скрипт для проверки локальной аналитики
console.log('Testing Local Analytics...')

// Симуляция работы с localStorage
const mockLocalStorage = {
  data: {},
  getItem(key) {
    return JSON.stringify(this.data[key] || null)
  },
  setItem(key, value) {
    this.data[key] = JSON.parse(value)
    console.log(`Saved to ${key}:`, this.data[key])
  }
}

// Переопределяем localStorage для тестирования
global.localStorage = mockLocalStorage

// Импортируем сервис
import('./src/services/logsnag.js').then(({ default: logsnag }) => {
  console.log('LogSnag service loaded')
  
  async function testLocalAnalytics() {
    try {
      // Тест 1: Отслеживание метрик
      console.log('\n1. Testing metric tracking...')
      await logsnag.trackMetric('user_signup', 1, { email: 'test@example.com' })
      await logsnag.trackMetric('text_read', 1, { language: 'en' })
      await logsnag.trackMetric('word_added', 1, { language: 'fr' })
      await logsnag.trackMetric('question_answered', 1, { is_correct: true })
      
      // Тест 2: Получение метрик
      console.log('\n2. Testing metric retrieval...')
      const userSignups = await logsnag.getInsights('user_signup', { days: 7 })
      const textsRead = await logsnag.getInsights('text_read', { days: 7 })
      const wordsAdded = await logsnag.getInsights('word_added', { days: 7 })
      
      console.log('User signups:', userSignups)
      console.log('Texts read:', textsRead)
      console.log('Words added:', wordsAdded)
      
      // Тест 3: Получение событий
      console.log('\n3. Testing events retrieval...')
      const events = await logsnag.getEvents({ limit: 5 })
      console.log('Recent events:', events)
      
      console.log('\n✅ Local analytics test completed!')
      
    } catch (error) {
      console.error('❌ Test failed:', error)
    }
  }
  
  testLocalAnalytics()
}).catch(error => {
  console.error('Failed to load LogSnag service:', error)
}) 